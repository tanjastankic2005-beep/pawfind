# PawFind — Deploy setup

Workflow: `.github/workflows/deploy.yml`
Trigger: svaki `push` na `main` (ili ručno preko **Actions → Deploy to server → Run workflow**).

Tok: checkout → `npm ci` → syntax check → SSH na server → `git reset --hard origin/main` → `npm ci --omit=dev` → `pm2 reload` → health check na `/ping`.

---

## 1. Prvo — očisti git (VAŽNO)

Prije nego postoji `.gitignore`, možda su `node_modules/` i `.env` već ušli u repo. `.env` sadrži password baze i session secret, i **nikad** ne smije biti na GitHubu.

```bash
cd C:\Users\Tanja\Desktop\pawfind

# provjeri šta je trenutno u gitu
git ls-files | findstr /B "node_modules .env"
```

Ako nešto izlistalo, izbaci iz gita (fajlovi ostaju na disku):

```bash
git rm -r --cached node_modules
git rm --cached .env
git add .gitignore
git commit -m "Add .gitignore, remove node_modules and .env from tracking"
git push
```

> Ako je `.env` ikad bio pushan na GitHub — promijeni MySQL password i `SESSION_SECRET`. Historija commita ostaje javna čak i nakon brisanja fajla.

---

## 2. Setup na serveru (jednom)

Uloguj se na VPS preko SSH-a i pokreni:

```bash
# --- Node 20 + PM2 ---
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm install -g pm2

# --- MySQL ---
sudo apt install -y mysql-server
sudo mysql_secure_installation

# --- baza i user ---
sudo mysql -e "CREATE DATABASE pawfind CHARACTER SET utf8mb4;"
sudo mysql -e "CREATE USER 'pawfind'@'localhost' IDENTIFIED BY 'JAK_PASSWORD_OVDJE';"
sudo mysql -e "GRANT ALL PRIVILEGES ON pawfind.* TO 'pawfind'@'localhost'; FLUSH PRIVILEGES;"

# --- kloniraj projekt ---
sudo mkdir -p /var/www && sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/tanjastankic2005-beep/pawfind.git
cd pawfind
npm ci --omit=dev
```

Napravi `.env` **na serveru** (ovaj fajl nikad ne ide kroz git):

```bash
nano /var/www/pawfind/.env
```

```
DB_HOST=localhost
DB_USER=pawfind
DB_PASSWORD=JAK_PASSWORD_OVDJE
DB_NAME=pawfind
PORT=3000
SESSION_SECRET=<openssl rand -hex 32>
NODE_ENV=production
```

Generiši secret sa: `openssl rand -hex 32`

Importuj šemu baze (ako imaš `.sql` dump), pa startuj app:

```bash
cd /var/www/pawfind
pm2 start backend/server.js --name pawfind
pm2 save
pm2 startup     # ispiše komandu — kopiraj je i pokreni, da app preživi reboot
```

Test: `curl localhost:3000/ping` → treba vratiti `pong`.

---

## 3. SSH ključ za GitHub Actions

Napravi **novi, poseban** ključ samo za deploy (ne koristi svoj lični).

Na svom računaru:

```bash
ssh-keygen -t ed25519 -C "github-actions-pawfind" -f pawfind_deploy_key -N ""
```

Dobiješ dva fajla:

| Fajl | Gdje ide |
|---|---|
| `pawfind_deploy_key.pub` (javni) | na **server** |
| `pawfind_deploy_key` (privatni) | u **GitHub secret** `SSH_KEY` |

Javni ključ na server:

```bash
ssh-copy-id -i pawfind_deploy_key.pub korisnik@IP_SERVERA
```

Ili ručno — sadržaj `.pub` fajla dopiši u `~/.ssh/authorized_keys` na serveru.

Provjeri da radi: `ssh -i pawfind_deploy_key korisnik@IP_SERVERA`

---

## 4. GitHub Secrets

GitHub → tvoj repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Dodaj ovih 6:

| Ime secreta | Vrijednost | Primjer |
|---|---|---|
| `SSH_HOST` | IP ili domen servera | `203.0.113.45` |
| `SSH_USER` | SSH korisnik | `ubuntu` ili `root` |
| `SSH_KEY` | **cijeli** sadržaj privatnog ključa | `-----BEGIN OPENSSH PRIVATE KEY-----` ... `-----END OPENSSH PRIVATE KEY-----` |
| `SSH_PORT` | SSH port | `22` |
| `APP_PATH` | putanja projekta na serveru | `/var/www/pawfind` |
| `HEALTH_URL` | `/ping` endpoint | `https://pawfind.com/ping` |

Kod `SSH_KEY` kopiraj **sve**, uključujući `BEGIN`/`END` linije i završni prazan red.

---

## 5. Nginx reverse proxy (da radi na portu 80/443)

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/pawfind
```

```nginx
server {
    listen 80;
    server_name pawfind.com www.pawfind.com;

    client_max_body_size 10M;   # zbog upload-a slika (multer limit je 5MB/fajl)

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/pawfind /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS besplatno
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pawfind.com -d www.pawfind.com
```

Nakon HTTPS-a, dodaj u `server.js` u session config (inače cookie neće raditi ispravno):

```js
app.set('trust proxy', 1);
// ... u session cookie objektu:
secure: process.env.NODE_ENV === 'production',
sameSite: 'lax'
```

---

## 6. Checklist

- [ ] `.gitignore` commitovan, `node_modules` i `.env` izbačeni iz gita
- [ ] Node 20, PM2, MySQL instalirani na serveru
- [ ] Baza `pawfind` + user napravljeni, šema importovana
- [ ] `.env` napravljen **na serveru** s pravim vrijednostima
- [ ] `pm2 start` radi, `curl localhost:3000/ping` vraća `pong`
- [ ] `pm2 save` + `pm2 startup` izvršeni
- [ ] Deploy SSH ključ napravljen, javni dio na serveru
- [ ] 6 GitHub secrets dodani
- [ ] Nginx + HTTPS podešeni
- [ ] Test: push na `main` → Actions tab pokazuje zelenu kvačicu

---

## Debug

**Actions job pao na SSH koraku** — ključ nije dobro kopiran ili `SSH_USER`/`SSH_HOST` griješe. Testiraj lokalno: `ssh -i pawfind_deploy_key -p 22 korisnik@host`

**"pm2: command not found"** — PM2 nije u PATH-u za neinteraktivnu SSH sesiju. Nađi punu putanju na serveru (`which pm2`) i u workflow-u zamijeni `pm2` s njom, npr. `/usr/bin/pm2`.

**Health check pao, ostalo prošlo** — app se ne pokreće. Na serveru: `pm2 logs pawfind --lines 50`

**Slike nakon deploya nestale** — `git reset --hard` ne dira untracked fajlove, a `frontend/images/uploads/` je u `.gitignore`, pa su sigurne. Ako su ikad bile u gitu, prvo ih izbaci: `git rm -r --cached frontend/images/uploads`

**Rollback na prethodnu verziju:**
```bash
cd /var/www/pawfind
git log --oneline -5
git reset --hard <commit_hash>
npm ci --omit=dev && pm2 reload pawfind
```

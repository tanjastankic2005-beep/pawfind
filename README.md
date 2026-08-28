# 🐾 PawFind

**Find your new best friend.**

A full-stack pet adoption platform where visitors can browse rescue animals,
save favourites, and apply to adopt — and where shelter staff can manage pets
and adoption applications from an admin dashboard.

Built from scratch as my first full-stack project: no frontend framework,
no ORM, no starter template.

---

## Screenshots

| Home | Browse pets |
|---|---|
| ![Home](docs/home.png) | ![Browse](docs/browse.png) |

| Pet details |
|---|
| ![Pet details](docs/details.png) |
---

## Tech stack

**Frontend** — HTML5, CSS3, vanilla JavaScript
No frameworks. Responsive layout with CSS Grid and Flexbox, design tokens as
CSS custom properties, and a mobile navigation built with plain DOM APIs.

**Backend** — Node.js, Express
REST API with modular routers, session-based authentication, and role-based
authorization middleware.

**Database** — MySQL 8
Four related tables with foreign keys, cascading deletes, and a many-to-many
junction table for favourites.

**Libraries** — `express`, `mysql2`, `express-session`, `bcryptjs`, `dotenv`

---

## Features

### For visitors
- Browse available pets
- Search by name, filter by species, gender, age group, size, location and personality
- Sort by name, age or date added
- View full pet details
- Apply to adopt, with or without an account

### For registered users
- Create an account with a hashed password
- Save favourite pets — stored in the database, not in the browser
- Track adoption applications and their status
- Personal profile with statistics

### For administrators
- Dashboard with live statistics
- Full CRUD on pets: create, read, update, delete
- View all applications, including guest applications
- Change application status — approving one automatically marks the pet as adopted

---

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org) 18 or newer
- [MySQL](https://dev.mysql.com/downloads/) 8 or newer

### 1. Clone and install

```bash
git clone https://github.com/tanjastankic2005-beep/pawfind.git
cd pawfind
npm install
```

### 2. Create the database

Open MySQL Workbench and run, in order:

```
backend/database/schema.sql
backend/database/seed.sql
```

The first creates the database and its four tables.
The second fills the `pets` table with sample data.

### 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pawfind
PORT=3000
SESSION_SECRET=any_long_random_string
```

### 4. Run

```bash
npm run dev     # development, restarts on file changes
npm start       # production
```

Open **http://localhost:3000**

### 5. Create an admin account

Register through the interface, then promote the account in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Log out and back in — an **Admin** link appears in the navigation.

---

## API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/pets` | public | List pets, with search, filters and sorting |
| `GET` | `/api/pets/:id` | public | Single pet |
| `POST` | `/api/pets` | admin | Create a pet |
| `PUT` | `/api/pets/:id` | admin | Replace a pet |
| `DELETE` | `/api/pets/:id` | admin | Delete a pet |
| `POST` | `/api/auth/register` | public | Create an account |
| `POST` | `/api/auth/login` | public | Start a session |
| `POST` | `/api/auth/logout` | public | End the session |
| `GET` | `/api/auth/me` | public | Current user, or 401 |
| `GET` | `/api/favorites` | user | Saved pets, with full pet data |
| `GET` | `/api/favorites/ids` | user | Saved pet IDs only |
| `POST` | `/api/favorites` | user | Save a pet |
| `DELETE` | `/api/favorites/:petId` | user | Remove a saved pet |
| `POST` | `/api/applications` | public | Submit an adoption application |
| `GET` | `/api/applications/me` | user | My applications |
| `PATCH` | `/api/applications/:id/status` | admin | Change application status |
| `GET` | `/api/admin/stats` | admin | Dashboard statistics |
| `GET` | `/api/admin/pets` | admin | All pets, including adopted |
| `GET` | `/api/admin/applications` | admin | All applications |

**Query parameters on `/api/pets`:**
`search`, `species`, `gender`, `age`, `size`, `location`, `personality`, `sort`

**Status codes used:** `200` `201` `400` `401` `403` `404` `409` `500`

---

## Database

```
users                    pets
  id (PK)                  id (PK)
  name                     name, species, breed, age
  email (UNIQUE)           gender, size, location
  password (hashed)        description, image, personality
  role                     vaccinated, neutered
  created_at               good_with_kids / dogs / cats
                           status, created_at
      |                        |
      |  1                   1 |
      |                        |
      +---- applications ------+
      |      user_id (FK, nullable - guests allowed)
      |      pet_id  (FK)
      |      housing details, reason, status
      |
      +---- favorites ---------+
             user_id (FK) + pet_id (FK)
             UNIQUE(user_id, pet_id)
```

`applications.user_id` is nullable so visitors can apply without an account.
`favorites` is a junction table implementing a many-to-many relationship.
Both use `ON DELETE CASCADE`.

---

## Project structure

```
pawfind/
├── backend/
│   ├── database/
│   │   ├── db.js            connection pool
│   │   ├── schema.sql       table definitions
│   │   └── seed.sql         sample data
│   ├── middleware/
│   │   └── auth.js          requireAuth, requireAdmin
│   ├── routes/
│   │   ├── pets.js
│   │   ├── auth.js
│   │   ├── applications.js
│   │   ├── favorites.js
│   │   └── admin.js
│   └── server.js            configuration and route mounting
│
├── frontend/
│   ├── css/style.css        design tokens and all styling
│   ├── images/
│   ├── js/
│   │   ├── api.js           every call to the backend
│   │   ├── main.js          navigation, toast messages
│   │   └── ...              one file per page
│   └── *.html               nine pages
│
├── docs/                    screenshots
├── .env.example
└── package.json
```

---

## Security

- Passwords hashed with **bcrypt** (cost factor 10, per-user salt)
- Sessions in **httpOnly cookies** — unreadable from JavaScript
- All SQL uses **prepared statements** — no string concatenation
- `ORDER BY` and status values validated against **whitelists**
- Input validated on **both** the client and the server
- Secrets kept in `.env`, excluded from version control
- Authorization enforced **server-side**; hidden UI is never the protection

---

## What I learned

This was my first backend and my first database. Along the way I worked through
what a server actually is, how HTTP requests and responses travel, how to design
a relational schema with primary and foreign keys, how to write SQL joins, how
sessions keep a stateless protocol stateful, why passwords are hashed rather
than encrypted, and why every rule enforced on the frontend has to be enforced
again on the backend.

The trickiest lesson was that middleware order in Express *is* logic — a 404
handler in the wrong place silently swallowed half the API.

---

## Author

**Tanja Stankić**
[github.com/tanjastankic2005-beep](https://github.com/tanjastankic2005-beep)

Built as an internship project, 2026.
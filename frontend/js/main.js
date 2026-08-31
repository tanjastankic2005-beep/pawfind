// ---- Mobilna navigacija ----
const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
}


// ---- Početna: slika koju je admin izabrao za hero sekciju ----
const heroImage = document.querySelector('#heroImage');
if (heroImage) {
  getSettings()
    .then(settings => {
      if (settings && settings.hero_image) heroImage.src = settings.hero_image;
    })
    .catch(error => console.error(error));
}


// ---- "Add a pet" i "Contact us" su dostupni i gostima i prijavljenim korisnicima ----
function addSharedNavLinks() {
  if (!mainNav || mainNav.querySelector('a[href="contact.html"]')) return;

  const loginLink = mainNav.querySelector('a[href="login.html"]');

  const linksHtml = `
    <a href="pets-adopted.html" class="nav-link" data-i18n="nav.adopted">Adopted pets</a>
    <a href="add-pet.html" class="nav-link" data-i18n="nav.addPet">Add a pet</a>
    <a href="contact.html" class="nav-link" data-i18n="nav.contact">Contact us</a>
  `;

  if (loginLink) {
    loginLink.insertAdjacentHTML('beforebegin', linksHtml);
  } else {
    mainNav.insertAdjacentHTML('beforeend', linksHtml);
  }
}

function addFooterContactLink() {
  const footerNav = document.querySelector('.footer-nav');
  if (footerNav && !footerNav.querySelector('a[href="contact.html"]')) {
    footerNav.insertAdjacentHTML('beforeend', `
      <a href="pets-adopted.html" data-i18n="nav.adopted">Adopted pets</a>
      <a href="contact.html" data-i18n="nav.contact">Contact us</a>
    `);
  }
}


// ---- Navigacija za prijavljenog korisnika ----
async function updateNav() {
  if (!mainNav) return;

  try {
    const user = await getCurrentUser();

    // Nije prijavljena — ostavi navigaciju kakva jeste, samo dodaj zajedničke linkove
    if (!user) {
      addSharedNavLinks();
      if (typeof applyTranslations === 'function') applyTranslations();
      return;
    }

    const firstName = user.name.split(' ')[0];

    const adminLink = user.role === 'admin'
      ? '<a href="admin.html" class="nav-link">Admin</a>'
      : '';

    mainNav.innerHTML = `
      <a href="index.html" class="nav-link" data-i18n="nav.home">Home</a>
      <a href="pets.html" class="nav-link" data-i18n="nav.browsePets">Browse Pets</a>
      <a href="favorites.html" class="nav-link" data-i18n="nav.favorites">Favorites</a>
      <a href="pets-adopted.html" class="nav-link" data-i18n="nav.adopted">Adopted pets</a>
      <a href="add-pet.html" class="nav-link" data-i18n="nav.addPet">Add a pet</a>
      <a href="contact.html" class="nav-link" data-i18n="nav.contact">Contact us</a>
      ${adminLink}
      <a href="profile.html" class="nav-link" id="navHiName">Hi, ${firstName}</a>
      <button class="nav-logout" id="logoutButton" data-i18n="nav.logout">Log out</button>
    `;

    if (typeof t === 'function') {
      document.querySelector('#navHiName').textContent = t('nav.hi', { name: firstName });
    }

    if (typeof applyTranslations === 'function') applyTranslations();

    document.querySelector('#logoutButton').addEventListener('click', async () => {
      await logoutUser();
      window.location.href = 'index.html';
    });

  } catch (error) {
    console.error(error);
  }
}


// Pokreni tek kad su svi skriptovi učitani
window.addEventListener('DOMContentLoaded', () => {
  updateNav();
  addFooterContactLink();
});

// Kad se promijeni jezik, ponovo ispiši "Hi, Ime" u ispravnom obliku
window.addEventListener('pawfind:langchange', () => {
  const hiName = document.querySelector('#navHiName');
  if (hiName && typeof t === 'function') {
    const firstName = hiName.textContent.replace(/^[^,]+,\s*/, '');
    hiName.textContent = t('nav.hi', { name: firstName });
  }
});


// ---- Kratke poruke u uglu ekrana ----
function showToast(message, type = 'error') {
  let container = document.querySelector('#toastContainer');

  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}

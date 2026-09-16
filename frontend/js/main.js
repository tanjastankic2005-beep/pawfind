// ---- Mobilna navigacija ----
const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
}


// ---- Glavna navigacija ----
// Ista na svim stranicama i gradi se ovdje, umjesto da se ručno kopira po HTML fajlovima.
// Na telefonu isti markup upada u postojeći ☰ meni (redoslijed u DOM-u = redoslijed na ekranu).
const NAV_LEFT_LINKS = [
  { href: 'index.html',             key: 'nav.home',        fallback: 'Home' },
  { href: 'pets.html',               key: 'nav.browsePets',  fallback: 'Find a pet' },
  { href: 'pets-adopted.html',       key: 'nav.adopted',     fallback: 'Adopted stories' },
  { href: 'index.html#how-it-works', key: 'home.howItWorks', fallback: 'How it works' }
];

// Anchor linkovi (sa #) ne broje se kao posebna stranica.
function isCurrentPage(href) {
  if (href.includes('#')) return false;
  const page = href.split('/').pop();
  const current = window.location.pathname.split('/').pop() || 'index.html';
  return page === current;
}

function currentAttr(href) {
  return isCurrentPage(href) ? ' aria-current="page"' : '';
}

function buildMainNav() {
  if (!mainNav) return;

  const leftLinks = NAV_LEFT_LINKS.map(link => `
    <a href="${link.href}" class="nav-link" data-i18n="${link.key}"${currentAttr(link.href)}>${link.fallback}</a>
  `).join('');

  mainNav.innerHTML = `
    ${leftLinks}
    <div class="nav-right">
      <a href="favorites.html" class="nav-link nav-fav"${currentAttr('favorites.html')}>
        <span class="nav-fav-icon" aria-hidden="true">❤</span><span data-i18n="nav.favorites">Favorites</span>
      </a>
      <a href="pets.html" class="btn btn-primary btn-sm nav-adopt-btn" data-i18n="nav.adoptCta">Adopt a pet</a>
      <div class="user-menu" id="userMenu">
        <button type="button" class="user-menu-toggle" id="userMenuToggle" aria-haspopup="true" aria-expanded="false">
          <span id="userMenuLabel" data-i18n="nav.account">Account</span><span class="user-menu-caret" aria-hidden="true">▾</span>
        </button>
        <div class="user-menu-dropdown" id="userMenuDropdown" hidden></div>
      </div>
    </div>
  `;

  setupUserMenuToggle();
}

// Otvaranje/zatvaranje padajućeg menija — nezavisno od toga šta je unutra.
function setupUserMenuToggle() {
  const userMenu         = document.querySelector('#userMenu');
  const userMenuToggle   = document.querySelector('#userMenuToggle');
  const userMenuDropdown = document.querySelector('#userMenuDropdown');
  if (!userMenu || !userMenuToggle || !userMenuDropdown) return;

  function closeMenu() {
    userMenuDropdown.hidden = true;
    userMenuToggle.setAttribute('aria-expanded', 'false');
  }

  userMenuToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = userMenuToggle.getAttribute('aria-expanded') === 'true';
    userMenuDropdown.hidden = isOpen;
    userMenuToggle.setAttribute('aria-expanded', String(!isOpen));
  });

  // Klik izvan menija ga zatvara
  document.addEventListener('click', (event) => {
    if (!userMenu.contains(event.target)) closeMenu();
  });

  // Escape ga zatvara
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

buildMainNav();


// ---- Sadržaj korisničkog menija — zavisi od toga da li je neko prijavljen ----
async function initUserMenu() {
  const dropdown = document.querySelector('#userMenuDropdown');
  const label    = document.querySelector('#userMenuLabel');
  if (!dropdown || !label) return;

  try {
    const user = await getCurrentUser();

    if (!user) {
      dropdown.innerHTML = `
        <a href="login.html" class="user-menu-item" data-i18n="nav.login">Log in</a>
        <a href="register.html" class="user-menu-item" data-i18n="nav.signup">Sign up</a>
      `;

    } else {
      const firstName = user.name.split(' ')[0];
      label.removeAttribute('data-i18n');
      label.textContent = firstName;

      const adminLink = user.role === 'admin'
        ? '<a href="admin.html" class="user-menu-item" data-i18n="nav.adminPanel">Admin panel</a>'
        : '';

      dropdown.innerHTML = `
        <a href="profile.html" class="user-menu-item" data-i18n="nav.myProfile">My profile</a>
        <a href="add-pet.html" class="user-menu-item" data-i18n="nav.addPet">Add a pet</a>
        <a href="contact.html" class="user-menu-item" data-i18n="nav.contact">Contact us</a>
        ${adminLink}
        <hr class="user-menu-divider">
        <button type="button" class="user-menu-item" id="userMenuLogout" data-i18n="nav.logout">Log out</button>
      `;

      document.querySelector('#userMenuLogout').addEventListener('click', async () => {
        await logoutUser();
        window.location.href = 'index.html';
      });
    }

    if (typeof applyTranslations === 'function') applyTranslations();

  } catch (error) {
    console.error(error);
  }
}


// ---- Početna: slika koju je admin izabrao za hero sekciju ----
const heroImage = document.querySelector('#heroImage');

// ---- Početna: "coverflow" karusel uspješnih priča ----
// Sve priče se iscrtaju odjednom u traku; klik na strelicu samo pomjera traku
// i mijenja koja je kartica "aktivna" — CSS tranzicije rade animaciju.
const successStorySection = document.querySelector('#successStorySection');
const successStoryTrack   = document.querySelector('#successStoryTrack');
const successStoryPrev    = document.querySelector('#successStoryPrev');
const successStoryNext    = document.querySelector('#successStoryNext');
const successStoryDots    = document.querySelector('#successStoryDots');

const STORY_SLIDE_WIDTH = 70;                        // mora odgovarati .success-story-slide { flex-basis } u CSS-u
const STORY_SLIDE_PEEK  = (100 - STORY_SLIDE_WIDTH) / 2;

let successStories    = [];
let currentStoryIndex = 0;

// Mini-slajd fotografija UNUTAR jedne priče (npr. dvije fotografije istog ljubimca)
function setupStoryPhotoNav(imageWrap, images) {
  const imageEl = imageWrap.querySelector('.success-story-photo');
  imageEl.src = images[0];
  if (images.length <= 1) return;

  let photoIndex = 0;

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'image-nav image-nav-prev';
  prevButton.setAttribute('aria-label', 'Previous photo');
  prevButton.textContent = '‹';

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'image-nav image-nav-next';
  nextButton.setAttribute('aria-label', 'Next photo');
  nextButton.textContent = '›';

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'image-dots';
  dotsWrap.innerHTML = images.map((_, i) => `<span class="image-dot ${i === 0 ? 'is-active' : ''}"></span>`).join('');

  function show(newIndex) {
    photoIndex = (newIndex + images.length) % images.length;
    imageEl.src = images[photoIndex];
    dotsWrap.querySelectorAll('.image-dot').forEach((dot, i) => dot.classList.toggle('is-active', i === photoIndex));
  }

  prevButton.addEventListener('click', (event) => { event.stopPropagation(); show(photoIndex - 1); });
  nextButton.addEventListener('click', (event) => { event.stopPropagation(); show(photoIndex + 1); });

  imageWrap.append(prevButton, nextButton, dotsWrap);
}

function applyAllCaptions() {
  successStoryTrack.querySelectorAll('.success-story-slide').forEach((slideEl, i) => {
    const story = successStories[i];
    const text = (typeof getLang === 'function' && getLang() === 'sr' && story.text_sr)
      ? story.text_sr
      : story.text;
    slideEl.querySelector('.success-story-caption').textContent = text;
  });
}

// Prelazak između PRIČA — samo pomjera traku i mijenja koja kartica je "u fokusu"
function showStory(index) {
  currentStoryIndex = (index + successStories.length) % successStories.length;

  successStoryTrack.querySelectorAll('.success-story-slide').forEach((slideEl, i) => {
    slideEl.classList.toggle('is-active', i === currentStoryIndex);
  });

  const offset = STORY_SLIDE_PEEK - (currentStoryIndex * STORY_SLIDE_WIDTH);
  successStoryTrack.style.transform = `translateX(${offset}%)`;

  successStoryDots.querySelectorAll('.success-story-dot').forEach((dot, i) => {
    dot.classList.toggle('is-active', i === currentStoryIndex);
  });
}

function initSuccessStories(stories) {
  successStories = stories.filter(story => story.images.length > 0);
  if (!successStorySection || successStories.length === 0) return;

  successStoryTrack.innerHTML = successStories.map(() => `
    <div class="success-story-slide">
      <div class="success-story-card">
        <div class="success-story-image-wrap">
          <img class="success-story-photo" src="" alt="">
        </div>
        <p class="success-story-caption"></p>
      </div>
    </div>
  `).join('');

  successStoryTrack.querySelectorAll('.success-story-slide').forEach((slideEl, index) => {
    setupStoryPhotoNav(slideEl.querySelector('.success-story-image-wrap'), successStories[index].images);
    slideEl.addEventListener('click', () => {
      if (index !== currentStoryIndex) showStory(index);
    });
  });

  const multiple = successStories.length > 1;
  successStoryPrev.classList.toggle('hidden', !multiple);
  successStoryNext.classList.toggle('hidden', !multiple);
  successStoryDots.classList.toggle('hidden', !multiple);

  successStoryDots.innerHTML = successStories
    .map((_, i) => `<button type="button" class="success-story-dot" aria-label="Story ${i + 1}"></button>`)
    .join('');

  successStoryDots.querySelectorAll('.success-story-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => showStory(i));
  });

  successStoryPrev.addEventListener('click', () => showStory(currentStoryIndex - 1));
  successStoryNext.addEventListener('click', () => showStory(currentStoryIndex + 1));

  applyAllCaptions();
  showStory(0);
  successStorySection.classList.remove('hidden');
}

if (heroImage || successStorySection) {
  Promise.all([
    getSettings(),
    successStorySection ? getSuccessStories() : Promise.resolve([])
  ])
    .then(([settings, stories]) => {
      if (heroImage && settings.hero_image) heroImage.src = settings.hero_image;
      initSuccessStories(stories);
    })
    .catch(error => console.error(error));
}

window.addEventListener('pawfind:langchange', () => {
  if (successStories.length === 0) return;
  applyAllCaptions();
});


function addFooterContactLink() {
  const footerNav = document.querySelector('.footer-nav');
  if (footerNav && !footerNav.querySelector('a[href="contact.html"]')) {
    footerNav.insertAdjacentHTML('beforeend', `
      <a href="pets-adopted.html" data-i18n="nav.adopted">Adopted pets</a>
      <a href="contact.html" data-i18n="nav.contact">Contact us</a>
    `);
  }
}


// Pokreni tek kad su svi skriptovi učitani
window.addEventListener('DOMContentLoaded', () => {
  initUserMenu();
  addFooterContactLink();
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

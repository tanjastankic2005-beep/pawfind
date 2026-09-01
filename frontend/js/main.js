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

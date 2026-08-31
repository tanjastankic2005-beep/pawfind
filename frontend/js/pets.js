// ---- Elementi ----
const petsGrid  = document.querySelector('#petsGrid');
const petsCount = document.querySelector('#petsCount');

const searchInput       = document.querySelector('#searchInput');
const speciesFilter     = document.querySelector('#speciesFilter');
const genderFilter      = document.querySelector('#genderFilter');
const ageFilter         = document.querySelector('#ageFilter');
const sizeFilter        = document.querySelector('#sizeFilter');
const locationFilter    = document.querySelector('#locationFilter');
const personalityFilter = document.querySelector('#personalityFilter');
const sortSelect        = document.querySelector('#sortSelect');
const resetButton       = document.querySelector('#resetFilters');

// ---- Stanje ----
let favoriteIds = [];
let isLoggedIn  = false;


// ---- Šablon kartice ----
function petImageList(pet) {
  return (pet.images && pet.images.length > 0)
    ? pet.images.map(img => img.image)
    : [pet.image];
}

function createPetCard(pet) {
  const isFavorite = favoriteIds.includes(pet.id);
  const images = petImageList(pet);

  const carouselControls = images.length > 1 ? `
    <button type="button" class="image-nav image-nav-prev" data-dir="-1" aria-label="Previous photo">‹</button>
    <button type="button" class="image-nav image-nav-next" data-dir="1" aria-label="Next photo">›</button>
    <div class="image-dots">
      ${images.map((_, i) => `<span class="image-dot ${i === 0 ? 'is-active' : ''}"></span>`).join('')}
    </div>
  ` : '';

  const statusBadge = pet.status === 'adopted'
    ? `<span class="pet-status-badge is-adopted">${t('adopted.badge')}</span>`
    : `<span class="pet-status-badge is-available">${t('pets.lookingForHome')}</span>`;

  return `
    <article class="pet-card ${pet.status === 'adopted' ? 'pet-card-adopted' : ''}">
      <div class="pet-card-image" data-images='${JSON.stringify(images)}' data-index="0">
        <img src="${images[0]}" alt="${pet.name}, a ${pet.age} year old ${pet.species}">
        ${statusBadge}
        <button class="fav-btn ${isFavorite ? 'is-favorite' : ''}"
                data-pet-id="${pet.id}"
                aria-label="${isFavorite ? t('pets.removeFromFavorites') : t('pets.addToFavorites')}">
          ${isFavorite ? '♥' : '♡'}
        </button>
        ${carouselControls}
      </div>

      <div class="pet-card-body">
        <div class="pet-card-head">
          <h3 class="pet-name">${pet.name}</h3>
          <span class="pet-location">📍 ${pet.location}</span>
        </div>

        <p class="pet-meta">
          ${tSpecies(pet.species)} · ${pet.age} ${tYearsWord(pet.age)} · ${tSize(pet.size)}
        </p>

        <p class="pet-description">${tDescription(pet)}</p>

        <a href="pet.html?id=${pet.id}" class="btn btn-primary btn-sm">${t('pets.viewDetails')}</a>
      </div>
    </article>
  `;
}

function renderPets(list) {
  petsGrid.innerHTML = list.map(createPetCard).join('');
  petsCount.textContent = t('pets.countFound', { n: list.length, word: tPetsWord(list.length) });
}

function showMessage(text) {
  petsGrid.innerHTML = `<p class="state-message">${text}</p>`;
}


// ---- Filteri ----
function getCurrentFilters() {
  return {
    search:      searchInput.value.trim(),
    species:     speciesFilter.value,
    gender:      genderFilter.value,
    age:         ageFilter.value,
    size:        sizeFilter.value,
    location:    locationFilter.value,
    personality: personalityFilter.value,
    sort:        sortSelect.value
  };
}

async function loadPets() {
  petsCount.textContent = t('pets.loading');

  try {
    const pets = await getPets(getCurrentFilters());

    if (pets.length === 0) {
      showMessage(t('pets.noMatch'));
      petsCount.textContent = t('pets.countFound', { n: 0, word: tPetsWord(0) });
      return;
    }

    renderPets(pets);

  } catch (error) {
    console.error(error);
    showMessage(t('pets.loadError'));
    petsCount.textContent = t('pets.somethingWrong');
  }
}


// ---- Klik na strelice karusela slika ----
petsGrid.addEventListener('click', (event) => {
  const navButton = event.target.closest('.image-nav');
  if (!navButton) return;

  event.preventDefault();

  const wrapper = navButton.closest('.pet-card-image');
  const images  = JSON.parse(wrapper.dataset.images);
  const dir     = Number(navButton.dataset.dir);
  const index   = (Number(wrapper.dataset.index) + dir + images.length) % images.length;

  wrapper.dataset.index = index;
  wrapper.querySelector('img').src = images[index];

  wrapper.querySelectorAll('.image-dot').forEach((dot, i) => {
    dot.classList.toggle('is-active', i === index);
  });
});


// ---- Klik na srce (event delegation) ----
petsGrid.addEventListener('click', async (event) => {
  const button = event.target.closest('.fav-btn');
  if (!button) return;

  if (!isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  const petId = Number(button.dataset.petId);
  const wasFavorite = favoriteIds.includes(petId);

  // Odmah promijeni izgled — ne čekamo server
  if (wasFavorite) {
    favoriteIds = favoriteIds.filter(id => id !== petId);
    button.classList.remove('is-favorite');
    button.textContent = '♡';
  } else {
    favoriteIds.push(petId);
    button.classList.add('is-favorite');
    button.textContent = '♥';
  }

  try {
    if (wasFavorite) {
      await removeFavorite(petId);
    } else {
      await addFavorite(petId);
    }
  } catch (error) {
    console.error(error);

    // Nije uspjelo — vrati kako je bilo
    if (wasFavorite) {
      favoriteIds.push(petId);
      button.classList.add('is-favorite');
      button.textContent = '♥';
    } else {
      favoriteIds = favoriteIds.filter(id => id !== petId);
      button.classList.remove('is-favorite');
      button.textContent = '♡';
    }
  }
});


// ---- Slušači filtera ----
let searchTimer;

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadPets, 400);
});

const allSelects = [
  speciesFilter, genderFilter, ageFilter, sizeFilter,
  locationFilter, personalityFilter, sortSelect
];

allSelects.forEach(select => {
  select.addEventListener('change', loadPets);
});

resetButton.addEventListener('click', () => {
  searchInput.value = '';
  allSelects.forEach(select => { select.value = ''; });
  sortSelect.value = 'newest';
  loadPets();
});


// ---- Start ----
async function init() {
  const ids = await getFavoriteIds();

  if (ids === null) {
    isLoggedIn = false;
    favoriteIds = [];
  } else {
    isLoggedIn = true;
    favoriteIds = ids;
  }

  loadPets();
}

init();

window.addEventListener('pawfind:langchange', loadPets);
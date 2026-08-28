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
function createPetCard(pet) {
  const isFavorite = favoriteIds.includes(pet.id);

  return `
    <article class="pet-card">
      <div class="pet-card-image">
        <img src="${pet.image}" alt="${pet.name}, a ${pet.age} year old ${pet.species}">
        <button class="fav-btn ${isFavorite ? 'is-favorite' : ''}"
                data-pet-id="${pet.id}"
                aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          ${isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <div class="pet-card-body">
        <div class="pet-card-head">
          <h3 class="pet-name">${pet.name}</h3>
          <span class="pet-location">📍 ${pet.location}</span>
        </div>

        <p class="pet-meta">
          ${pet.species} · ${pet.age} ${pet.age === 1 ? 'year' : 'years'} · ${pet.size}
        </p>

        <p class="pet-description">${pet.description}</p>

        <a href="pet.html?id=${pet.id}" class="btn btn-primary btn-sm">View details</a>
      </div>
    </article>
  `;
}

function renderPets(list) {
  petsGrid.innerHTML = list.map(createPetCard).join('');
  petsCount.textContent = `${list.length} ${list.length === 1 ? 'pet' : 'pets'} found`;
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
  petsCount.textContent = 'Loading…';

  try {
    const pets = await getPets(getCurrentFilters());

    if (pets.length === 0) {
      showMessage('No pets match your search. Try changing the filters.');
      petsCount.textContent = '0 pets found';
      return;
    }

    renderPets(pets);

  } catch (error) {
    console.error(error);
    showMessage('Could not load pets. Is the server running?');
    petsCount.textContent = 'Something went wrong';
  }
}


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
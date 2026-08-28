// ---- Elementi na stranici ----
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


// ---- Šablon jedne kartice ----
function createPetCard(pet) {
  return `
    <article class="pet-card">
      <div class="pet-card-image">
        <img src="${pet.image}" alt="${pet.name}, a ${pet.age} year old ${pet.species}">
        <button class="fav-btn" aria-label="Add to favorites">♡</button>
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


// ---- Pokupi trenutno stanje svih filtera ----
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


// ---- Glavna funkcija ----
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


// ---- Pretraga: čekaj da korisnik prestane kucati ----
let searchTimer;

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadPets, 400);
});


// ---- Padajuće liste: reaguj odmah ----
const allSelects = [
  speciesFilter,
  genderFilter,
  ageFilter,
  sizeFilter,
  locationFilter,
  personalityFilter,
  sortSelect
];

allSelects.forEach(select => {
  select.addEventListener('change', loadPets);
});


// ---- Reset ----
resetButton.addEventListener('click', () => {
  searchInput.value = '';
  allSelects.forEach(select => {
    select.value = '';
  });
  sortSelect.value = 'newest';
  loadPets();
});


// ---- Pokreni ----
loadPets();
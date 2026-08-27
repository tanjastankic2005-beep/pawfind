// Nađi mjesta na stranici gdje ćemo pisati
const petsGrid = document.querySelector('#petsGrid');
const petsCount = document.querySelector('#petsCount');

// ŠABLON: od jednog ljubimca pravi HTML jedne kartice
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

// Uzmi listu, napravi sve kartice, ubaci ih na stranicu
function renderPets(list) {
  petsGrid.innerHTML = list.map(createPetCard).join('');
  petsCount.textContent = `${list.length} pets available`;
}

// Pokreni
renderPets(pets);
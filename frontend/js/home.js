// ---- Početna: "Oni čekaju baš tebe" — 4 najnovija dostupna ljubimca ----
const featuredGrid = document.querySelector('#featuredGrid');

function featuredPetImage(pet) {
  return (pet.images && pet.images.length > 0) ? pet.images[0].image : pet.image;
}

function createFeaturedCard(pet) {
  const image = featuredPetImage(pet);

  return `
    <a href="pet.html?id=${pet.id}" class="featured-card">
      <div class="featured-card-image">
        <img src="${image}" alt="${pet.name}, a ${pet.age} year old ${pet.species}">
      </div>
      <div class="featured-card-body">
        <h3 class="featured-card-name">${pet.name}</h3>
        <p class="featured-card-meta">${tSpecies(pet.species)} · ${pet.age} ${tYearsWord(pet.age)}</p>
        <p class="featured-card-location">📍 ${pet.location}</p>
      </div>
    </a>
  `;
}

function showFeaturedMessage(text) {
  featuredGrid.innerHTML = `<p class="state-message">${text}</p>`;
}

async function loadFeaturedPets() {
  showFeaturedMessage(t('home.featuredLoading'));

  try {
    const pets = await getPets({ sort: 'newest' });
    const available = pets.filter(pet => pet.status === 'available').slice(0, 4);

    if (available.length === 0) {
      showFeaturedMessage(t('home.featuredEmpty'));
      return;
    }

    featuredGrid.innerHTML = available.map(createFeaturedCard).join('');

  } catch (error) {
    console.error(error);
    showFeaturedMessage(t('home.featuredError'));
  }
}

if (featuredGrid) {
  loadFeaturedPets();
  window.addEventListener('pawfind:langchange', loadFeaturedPets);
}

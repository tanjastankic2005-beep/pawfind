const favGrid  = document.querySelector('#favGrid');
const favCount = document.querySelector('#favCount');


function createFavoriteCard(pet) {
  return `
    <article class="pet-card">
      <div class="pet-card-image">
        <img src="${pet.image}" alt="${pet.name}, a ${pet.age} year old ${pet.species}">
        <button class="fav-btn is-favorite"
                data-pet-id="${pet.id}"
                aria-label="Remove from favorites">♥</button>
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


function showMessage(html) {
  favGrid.innerHTML = `<div class="state-message">${html}</div>`;
}


async function loadFavorites() {
  favCount.textContent = 'Loading…';

  try {
    const pets = await getFavorites();

    // Nije prijavljena
    if (pets === null) {
      favCount.textContent = '';
      showMessage(`
        <p>Log in to see the pets you saved.</p>
        <a href="login.html" class="btn btn-primary">Log in</a>
      `);
      return;
    }

    // Prijavljena, ali nema favorita
    if (pets.length === 0) {
      favCount.textContent = '0 pets saved';
      showMessage(`
        <p>You have not saved any pets yet.</p>
        <a href="pets.html" class="btn btn-primary">Browse pets</a>
      `);
      return;
    }

    favGrid.innerHTML = pets.map(createFavoriteCard).join('');
    favCount.textContent = `${pets.length} ${pets.length === 1 ? 'pet' : 'pets'} saved`;

  } catch (error) {
    console.error(error);
    favCount.textContent = 'Something went wrong';
    showMessage('<p>Could not load your favourites. Is the server running?</p>');
  }
}


// ---- Uklanjanje iz favorita ----
favGrid.addEventListener('click', async (event) => {
  const button = event.target.closest('.fav-btn');
  if (!button) return;

  const petId = Number(button.dataset.petId);
  const card  = button.closest('.pet-card');

  card.style.opacity = '0.4';
  button.disabled = true;

  try {
    await removeFavorite(petId);
    loadFavorites();
  } catch (error) {
    console.error(error);
    card.style.opacity = '1';
    button.disabled = false;
  }
});


loadFavorites();
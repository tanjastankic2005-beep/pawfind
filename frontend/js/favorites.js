const favGrid  = document.querySelector('#favGrid');
const favCount = document.querySelector('#favCount');


function createFavoriteCard(pet) {
  return `
    <article class="pet-card">
      <div class="pet-card-image">
        <img src="${pet.image}" alt="${pet.name}, a ${pet.age} year old ${pet.species}">
        <button class="fav-btn is-favorite"
                data-pet-id="${pet.id}"
                aria-label="${t('pets.removeFromFavorites')}">♥</button>
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


function showMessage(html) {
  favGrid.innerHTML = `<div class="state-message">${html}</div>`;
}


async function loadFavorites() {
  favCount.textContent = t('favorites.loading');

  try {
    const pets = await getFavorites();

    // Nije prijavljena
    if (pets === null) {
      favCount.textContent = '';
      showMessage(`
        <p>${t('favorites.loginPrompt')}</p>
        <a href="login.html" class="btn btn-primary">${t('auth.loginButton')}</a>
      `);
      return;
    }

    // Prijavljena, ali nema favorita
    if (pets.length === 0) {
      favCount.textContent = t('favorites.countSaved', { n: 0, word: tPetsWord(0) });
      showMessage(`
        <p>${t('favorites.noneSaved')}</p>
        <a href="pets.html" class="btn btn-primary">${t('addPet.browseButton')}</a>
      `);
      return;
    }

    favGrid.innerHTML = pets.map(createFavoriteCard).join('');
    favCount.textContent = t('favorites.countSaved', { n: pets.length, word: tPetsWord(pets.length) });

  } catch (error) {
    console.error(error);
    favCount.textContent = t('favorites.somethingWrong');
    showMessage(`<p>${t('favorites.loadError')}</p>`);
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

window.addEventListener('pawfind:langchange', loadFavorites);
const petDetail = document.querySelector('#petDetail');

function showMessage(text) {
  petDetail.innerHTML = `<p class="state-message">${text}</p>`;
}

// MySQL vraća 1 i 0 umjesto true/false
function yesNo(value) {
  return value === 1 ? '✓ Yes' : '✕ No';
}

function renderPet(pet) {
  document.title = `${pet.name} — PawFind`;

  petDetail.innerHTML = `
    <div class="detail-grid">

      <div class="detail-image">
        <img src="${pet.image}" alt="${pet.name}, a ${pet.age} year old ${pet.species}">
      </div>

      <div class="detail-info">

        <p class="detail-eyebrow">${pet.species} · ${pet.breed || 'Mixed breed'}</p>
        <h1 class="detail-name">${pet.name}</h1>
        <p class="detail-location">📍 ${pet.location}</p>

        <div class="detail-facts">
          <div class="fact">
            <span class="fact-label">Age</span>
            <span class="fact-value">${pet.age} ${pet.age === 1 ? 'year' : 'years'}</span>
          </div>
          <div class="fact">
            <span class="fact-label">Gender</span>
            <span class="fact-value">${pet.gender}</span>
          </div>
          <div class="fact">
            <span class="fact-label">Size</span>
            <span class="fact-value">${pet.size}</span>
          </div>
          <div class="fact">
            <span class="fact-label">Personality</span>
            <span class="fact-value">${pet.personality || '—'}</span>
          </div>
        </div>

        <p class="detail-description">${pet.description}</p>

        <h2 class="detail-subtitle">Good to know</h2>
        <ul class="detail-list">
          <li><span>Vaccinated</span> <strong>${yesNo(pet.vaccinated)}</strong></li>
          <li><span>Neutered / spayed</span> <strong>${yesNo(pet.neutered)}</strong></li>
          <li><span>Good with kids</span> <strong>${yesNo(pet.good_with_kids)}</strong></li>
          <li><span>Good with dogs</span> <strong>${yesNo(pet.good_with_dogs)}</strong></li>
          <li><span>Good with cats</span> <strong>${yesNo(pet.good_with_cats)}</strong></li>
        </ul>

        <a href="apply.html?id=${pet.id}" class="btn btn-primary">Apply to adopt</a>

      </div>

    </div>
  `;
}

async function loadPet() {
  // Pročitaj ?id=5 iz adrese
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showMessage('No pet selected.');
    return;
  }

  showMessage('Loading…');

  try {
    const pet = await getPetById(id);

    if (pet === null) {
      showMessage('This pet is no longer available.');
      return;
    }

    renderPet(pet);

  } catch (error) {
    console.error(error);
    showMessage('Could not load this pet. Is the server running?');
  }
}

loadPet();
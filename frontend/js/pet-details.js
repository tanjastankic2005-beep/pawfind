const petDetail = document.querySelector('#petDetail');

function showMessage(text) {
  petDetail.innerHTML = `<p class="state-message">${text}</p>`;
}

// MySQL vraća 1 i 0 umjesto true/false
function yesNo(value) {
  return value === 1 ? t('petDetails.yes') : t('petDetails.no');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function renderPet(pet) {
  document.title = `${pet.name} — PawFind`;

  const images = (pet.images && pet.images.length > 0)
    ? pet.images.map(img => img.image)
    : [pet.image];

  const thumbsHtml = images.length > 1
    ? `
      <div class="detail-thumbs">
        ${images.map((src, index) => `
          <button type="button" class="detail-thumb ${index === 0 ? 'is-active' : ''}" data-src="${src}">
            <img src="${src}" alt="">
          </button>
        `).join('')}
      </div>
    `
    : '';

  petDetail.innerHTML = `
    <div class="detail-grid">

      <div class="detail-image">
        <img id="detailMainImage" src="${images[0]}" alt="${pet.name}, a ${pet.age} year old ${pet.species}">
        ${thumbsHtml}
      </div>

      <div class="detail-info">

        <p class="detail-eyebrow">${tSpecies(pet.species)} · ${pet.breed || t('petDetails.mixedBreed')}</p>
        <h1 class="detail-name">${pet.name}</h1>
        <p class="detail-location">📍 ${pet.location}</p>

        <div class="detail-facts">
          <div class="fact">
            <span class="fact-label">${t('petDetails.age')}</span>
            <span class="fact-value">${pet.age} ${tYearsWord(pet.age)}</span>
          </div>
          <div class="fact">
            <span class="fact-label">${t('petDetails.gender')}</span>
            <span class="fact-value">${tGender(pet.gender)}</span>
          </div>
          <div class="fact">
            <span class="fact-label">${t('petDetails.size')}</span>
            <span class="fact-value">${tSize(pet.size)}</span>
          </div>
          <div class="fact">
            <span class="fact-label">${t('petDetails.personality')}</span>
            <span class="fact-value">${tPersonality(pet.personality)}</span>
          </div>
        </div>

        <p class="detail-description">${tDescription(pet)}</p>

        <h2 class="detail-subtitle">${t('petDetails.goodToKnow')}</h2>
        <ul class="detail-list">
          <li><span>${t('petDetails.vaccinated')}</span> <strong>${yesNo(pet.vaccinated)}</strong></li>
          <li><span>${t('petDetails.neutered')}</span> <strong>${yesNo(pet.neutered)}</strong></li>
          <li><span>${t('petDetails.goodWithKids')}</span> <strong>${yesNo(pet.good_with_kids)}</strong></li>
          <li><span>${t('petDetails.goodWithDogs')}</span> <strong>${yesNo(pet.good_with_dogs)}</strong></li>
          <li><span>${t('petDetails.goodWithCats')}</span> <strong>${yesNo(pet.good_with_cats)}</strong></li>
        </ul>

        ${pet.status === 'adopted' ? `
          <div class="adopted-notice">
            🎉 ${!pet.adopted_at
              ? t('adopted.noDateInfo')
              : pet.adopted_by
                ? t('adopted.dateAndBy', { date: formatDate(pet.adopted_at), name: pet.adopted_by })
                : t('adopted.dateOnly', { date: formatDate(pet.adopted_at) })}
          </div>
        ` : `
          <a href="apply.html?id=${pet.id}" class="btn btn-primary">${t('petDetails.applyButton')}</a>
        `}

      </div>

    </div>
  `;

  const mainImage = document.querySelector('#detailMainImage');
  petDetail.querySelectorAll('.detail-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      mainImage.src = thumb.dataset.src;
      petDetail.querySelectorAll('.detail-thumb').forEach(thumbEl => thumbEl.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
  });
}

async function loadPet() {
  // Pročitaj ?id=5 iz adrese
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showMessage(t('petDetails.noSelection'));
    return;
  }

  showMessage(t('petDetails.loading'));

  try {
    const pet = await getPetById(id);

    if (pet === null) {
      showMessage(t('petDetails.noLongerAvailable'));
      return;
    }

    renderPet(pet);

  } catch (error) {
    console.error(error);
    showMessage(t('petDetails.couldNotLoad'));
  }
}

loadPet();

window.addEventListener('pawfind:langchange', loadPet);

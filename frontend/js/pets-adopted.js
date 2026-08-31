// ---- Elementi ----
const adoptedGrid  = document.querySelector('#adoptedGrid');
const adoptedCount = document.querySelector('#adoptedCount');


// "2026-08-28T11:15:53.000Z" → "28 Aug 2026"
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}


// ---- Šablon kartice ----
function petImageList(pet) {
  return (pet.images && pet.images.length > 0)
    ? pet.images.map(img => img.image)
    : [pet.image];
}

function createAdoptedCard(pet) {
  const images = petImageList(pet);

  const carouselControls = images.length > 1 ? `
    <button type="button" class="image-nav image-nav-prev" data-dir="-1" aria-label="Previous photo">‹</button>
    <button type="button" class="image-nav image-nav-next" data-dir="1" aria-label="Next photo">›</button>
    <div class="image-dots">
      ${images.map((_, i) => `<span class="image-dot ${i === 0 ? 'is-active' : ''}"></span>`).join('')}
    </div>
  ` : '';

  const adoptedText = !pet.adopted_at
    ? t('adopted.noDateInfo')
    : pet.adopted_by
      ? t('adopted.dateAndBy', { date: formatDate(pet.adopted_at), name: pet.adopted_by })
      : t('adopted.dateOnly', { date: formatDate(pet.adopted_at) });

  return `
    <article class="pet-card pet-card-adopted">
      <div class="pet-card-image" data-images='${JSON.stringify(images)}' data-index="0">
        <img src="${images[0]}" alt="${pet.name}, a ${pet.age} year old ${pet.species}">
        <span class="pet-status-badge is-adopted">${t('adopted.badge')}</span>
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

        <p class="adopted-info">${adoptedText}</p>

        <a href="pet.html?id=${pet.id}" class="btn btn-ghost btn-sm">${t('pets.viewDetails')}</a>
      </div>
    </article>
  `;
}


// ---- Klik na strelice karusela slika ----
adoptedGrid.addEventListener('click', (event) => {
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


// ---- Učitavanje ----
async function loadAdoptedPets() {
  adoptedCount.textContent = t('adopted.loading');

  try {
    const pets = await getAdoptedPets();

    if (pets.length === 0) {
      adoptedCount.textContent = '';
      adoptedGrid.innerHTML = `<p class="state-message">${t('adopted.noneYet')}</p>`;
      return;
    }

    adoptedGrid.innerHTML = pets.map(createAdoptedCard).join('');
    adoptedCount.textContent = t('adopted.countLabel', {
      n: pets.length,
      word: tPetsWord(pets.length),
      participle: tAdoptedParticiple(pets.length)
    });

  } catch (error) {
    console.error(error);
    adoptedCount.textContent = '';
    adoptedGrid.innerHTML = `<p class="state-message">${t('adopted.loadError')}</p>`;
  }
}

loadAdoptedPets();

window.addEventListener('pawfind:langchange', loadAdoptedPets);

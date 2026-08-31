// ---- Elementi ----
const addPetGuard   = document.querySelector('#addPetGuard');
const addPetPanel   = document.querySelector('#addPetPanel');
const addPetForm    = document.querySelector('#addPetForm');
const addPetMessage = document.querySelector('#addPetFormMessage');
const submitButton  = document.querySelector('#addPetSubmitButton');

const petImagesInput  = document.querySelector('#petImages');
const petImagePreview = document.querySelector('#petImagePreview');
const petImagesHint   = document.querySelector('#petImagesHint');

let selectedFiles = [];


// ---- Pregled izabranih slika ----
function renderImagePreview() {
  petImagePreview.innerHTML = selectedFiles
    .map((file, index) => `
      <div class="image-preview-item">
        <img src="${URL.createObjectURL(file)}" alt="">
        <button type="button" class="image-preview-remove" data-index="${index}" title="Remove photo">×</button>
      </div>
    `).join('');

  petImagesHint.textContent = selectedFiles.length > 0
    ? t('addPet.photosSelected', { n: selectedFiles.length, word: tPhotosWord(selectedFiles.length) })
    : t('addPet.photosHint');
}

function addFiles(fileList) {
  const images = Array.from(fileList).filter(file => file.type.startsWith('image/'));
  selectedFiles = selectedFiles.concat(images);
  renderImagePreview();
}

petImagesInput.addEventListener('change', () => {
  addFiles(petImagesInput.files);
  petImagesInput.value = '';
});

const imageUploadBox = document.querySelector('.image-upload-box');

['dragenter', 'dragover'].forEach(eventName => {
  imageUploadBox.addEventListener(eventName, (event) => {
    event.preventDefault();
    imageUploadBox.classList.add('is-dragover');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  imageUploadBox.addEventListener(eventName, (event) => {
    event.preventDefault();
    imageUploadBox.classList.remove('is-dragover');
  });
});

imageUploadBox.addEventListener('drop', (event) => {
  if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
});

petImagePreview.addEventListener('click', (event) => {
  const button = event.target.closest('.image-preview-remove');
  if (!button) return;

  selectedFiles.splice(Number(button.dataset.index), 1);
  renderImagePreview();
});


// ---- Slanje forme ----
addPetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  addPetMessage.innerHTML = '';

  const data = new FormData();
  data.append('name',           document.querySelector('#petName').value);
  data.append('breed',          document.querySelector('#petBreed').value);
  data.append('species',        document.querySelector('#petSpecies').value);
  data.append('age',            document.querySelector('#petAge').value);
  data.append('gender',         document.querySelector('#petGender').value);
  data.append('size',           document.querySelector('#petSize').value);
  data.append('location',       document.querySelector('#petLocation').value);
  data.append('personality',    document.querySelector('#petPersonality').value);
  data.append('description',    document.querySelector('#petDescription').value);
  data.append('vaccinated',     document.querySelector('#petVaccinated').checked);
  data.append('neutered',       document.querySelector('#petNeutered').checked);
  data.append('good_with_kids', document.querySelector('#petKids').checked);
  data.append('good_with_dogs', document.querySelector('#petDogs').checked);
  data.append('good_with_cats', document.querySelector('#petCats').checked);

  selectedFiles.forEach(file => data.append('images', file));

  submitButton.disabled = true;
  submitButton.textContent = t('addPet.submittingButton');

  try {
    await submitPet(data);

    addPetForm.style.display = 'none';

    addPetMessage.innerHTML = `
      <div class="success-box">
        <h2>${t('addPet.thankYou')}</h2>
        <p>${t('addPet.submittedText')}</p>
        <p>${t('addPet.appearText')}</p>
        <a href="pets.html" class="btn btn-primary">${t('addPet.browseButton')}</a>
      </div>
    `;

  } catch (error) {
    console.error(error);

    const messages = (error.data && error.data.errors)
      ? error.data.errors
      : [t('addPet.genericError')];

    addPetMessage.innerHTML = `
      <div class="error-box">
        <ul>${messages.map(m => `<li>${m}</li>`).join('')}</ul>
      </div>
    `;

    submitButton.disabled = false;
    submitButton.textContent = t('addPet.submitButton');
  }
});


// ---- Provjera prijave ----
async function init() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      addPetGuard.innerHTML = `
        <div class="state-message">
          <p>${t('addPet.needAccount')}</p>
          <a href="login.html" class="btn btn-primary">${t('addPet.loginButton')}</a>
        </div>
      `;
      return;
    }

    addPetPanel.classList.remove('hidden');

  } catch (error) {
    console.error(error);
    addPetGuard.innerHTML = `<p class="state-message">${t('addPet.couldNotLoad')}</p>`;
  }
}

init();

window.addEventListener('pawfind:langchange', () => {
  if (addPetGuard.innerHTML.trim() !== '') init();
});

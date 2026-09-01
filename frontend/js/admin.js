// ---- Elementi ----
const adminSubtitle    = document.querySelector('#adminSubtitle');
const adminGuard       = document.querySelector('#adminGuard');
const adminPanel       = document.querySelector('#adminPanel');
const statsGrid        = document.querySelector('#statsGrid');
const petsTableBody    = document.querySelector('#petsTableBody');
const adminApplications = document.querySelector('#adminApplications');
const adminMessages     = document.querySelector('#adminMessages');
const heroImagePicker   = document.querySelector('#heroImagePicker');
const currentHeroPreview = document.querySelector('#currentHeroPreview');

const petForm          = document.querySelector('#petForm');
const petFormTitle     = document.querySelector('#petFormTitle');
const petFormMessage   = document.querySelector('#petFormMessage');
const newPetButton     = document.querySelector('#newPetButton');
const petCancelButton  = document.querySelector('#petCancelButton');

let allPets = [];

// ---- Slike u formi ----
const petImagesInput   = document.querySelector('#petImages');
const petImagePreview  = document.querySelector('#petImagePreview');
const petImagesHint    = document.querySelector('#petImagesHint');

let selectedFiles    = [];  // nove slike izabrane sa diska (File objekti)
let existingImages   = [];  // slike koje ljubimac već ima (kod izmjene): [{id, image}]
let removedImageIds  = [];  // id-jevi postojećih slika koje treba obrisati

function renderImagePreview() {
  const existingHtml = existingImages
    .filter(img => !removedImageIds.includes(img.id))
    .map(img => `
      <div class="image-preview-item">
        <img src="${img.image}" alt="">
        <button type="button" class="image-preview-remove" data-existing-id="${img.id}" title="Remove photo">×</button>
      </div>
    `).join('');

  const newHtml = selectedFiles
    .map((file, index) => `
      <div class="image-preview-item">
        <img src="${URL.createObjectURL(file)}" alt="">
        <button type="button" class="image-preview-remove" data-new-index="${index}" title="Remove photo">×</button>
      </div>
    `).join('');

  petImagePreview.innerHTML = existingHtml + newHtml;

  const totalCount = existingImages.filter(img => !removedImageIds.includes(img.id)).length + selectedFiles.length;
  petImagesHint.textContent = totalCount > 0
    ? `${totalCount} photo${totalCount === 1 ? '' : 's'} selected — click or drag to add more.`
    : 'Click to choose photos, or drag them here. You can select several at once.';
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

  if (button.dataset.existingId) {
    removedImageIds.push(Number(button.dataset.existingId));
  } else if (button.dataset.newIndex !== undefined) {
    selectedFiles.splice(Number(button.dataset.newIndex), 1);
  }

  renderImagePreview();
});


// ---- Pomoćne ----
function statusClass(status) {
  return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}


// ---- Taberi ----
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');

    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.querySelector(`#panel-${tab.dataset.tab}`).classList.remove('hidden');
  });
});


// ---- Statistika ----
async function loadStats() {
  const s = await getAdminStats();

  statsGrid.innerHTML = `
    <div class="stat-card"><span class="stat-number">${s.totalPets}</span><span class="stat-label">Total pets</span></div>
    <div class="stat-card"><span class="stat-number">${s.availablePets}</span><span class="stat-label">Available</span></div>
    <div class="stat-card"><span class="stat-number">${s.adoptedPets}</span><span class="stat-label">Adopted</span></div>
    <div class="stat-card"><span class="stat-number">${s.pendingPets}</span><span class="stat-label">Pets awaiting review</span></div>
    <div class="stat-card"><span class="stat-number">${s.pendingApplications}</span><span class="stat-label">Pending applications</span></div>
    <div class="stat-card"><span class="stat-number">${s.approvedApplications}</span><span class="stat-label">Approved</span></div>
  `;
}


// ---- Tabela ljubimaca ----
const PET_STATUS_CLASSES = {
  pending:   'status-pending',
  available: 'status-approved',
  adopted:   'status-completed'
};

async function loadPetsTable() {
  allPets = await getAdminPets();

  petsTableBody.innerHTML = allPets.map(pet => `
    <tr>
      <td class="cell-pet">
        <img src="${pet.image}" alt="">
        <span>${pet.name}</span>
      </td>
      <td class="capitalize">${pet.species}</td>
      <td>${pet.age}</td>
      <td>${pet.location}</td>
      <td>
        <span class="status-badge ${PET_STATUS_CLASSES[pet.status] || 'status-approved'}">
          ${pet.status === 'pending' ? 'Pending review' : pet.status}
        </span>
      </td>
      <td class="cell-actions">
        <button class="link-btn" data-action="edit" data-id="${pet.id}">Edit</button>
        <button class="link-btn link-danger" data-action="delete" data-id="${pet.id}">Delete</button>
      </td>
    </tr>
  `).join('');
}


// ---- Lista prijava ----
const APPLICATION_STATUSES = [
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
  'Completed'
];

function statusOptions(current) {
  return APPLICATION_STATUSES
    .map(s => `<option value="${s}" ${s === current ? 'selected' : ''}>${s}</option>`)
    .join('');
}

async function loadApplicationsList() {
  const apps = await getAdminApplications();

  if (apps.length === 0) {
    adminApplications.innerHTML = `<p class="state-message">No applications yet.</p>`;
    return;
  }

  adminApplications.innerHTML = apps.map(app => `
    <article class="application-card">
      <img src="${app.pet_image}" alt="${app.pet_name}" class="application-image">

      <div class="application-info">
        <h3 class="application-pet">${app.pet_name}</h3>
        <p class="application-meta">
          ${app.user_name || app.applicant_name} ·
          ${app.user_email || app.applicant_email}
          ${app.user_name ? '' : ' <em>(guest)</em>'}
        </p>
        <p class="application-date">
          ${app.city || '—'} · ${app.housing_type || '—'} · ${formatDate(app.created_at)}
        </p>
      </div>

      <div class="application-side">
        <span class="status-badge ${statusClass(app.status)}" data-badge-for="${app.id}">
          ${app.status}
        </span>
        <select class="status-select" data-id="${app.id}" aria-label="Change status">
          ${statusOptions(app.status)}
        </select>
      </div>
    </article>
  `).join('');
}


// ---- Lista poruka sa Contact us stranice ----
let allMessages = [];

function messageCardHtml(msg) {
  const replyBlock = msg.reply ? `
    <div class="message-reply">
      <p class="message-reply-label">Your reply · ${formatDate(msg.replied_at)}</p>
      <p class="message-reply-text">${msg.reply}</p>
    </div>
  ` : '';

  return `
    <article class="message-card" data-id="${msg.id}">
      <div class="message-info">
        <p class="message-meta">
          <strong>${msg.name}</strong> · <a href="mailto:${msg.email}">${msg.email}</a>
          <span class="message-date">${formatDate(msg.created_at)}</span>
        </p>
        <p class="message-text">${msg.message}</p>

        ${replyBlock}

        <form class="message-reply-form hidden" data-id="${msg.id}">
          <textarea rows="3" placeholder="Write your reply…">${msg.reply || ''}</textarea>
          <div class="message-reply-actions">
            <button type="submit" class="btn btn-primary btn-sm">Send reply</button>
            <button type="button" class="btn btn-ghost btn-sm" data-action="cancel-reply">Cancel</button>
          </div>
        </form>
      </div>

      <div class="message-side">
        <button class="link-btn" data-action="toggle-reply" data-id="${msg.id}">${msg.reply ? 'Edit reply' : 'Reply'}</button>
        <button class="link-btn link-danger" data-action="delete-message" data-id="${msg.id}">Delete</button>
      </div>
    </article>
  `;
}

async function loadMessagesList() {
  allMessages = await getAdminMessages();

  if (allMessages.length === 0) {
    adminMessages.innerHTML = `<p class="state-message">No messages yet.</p>`;
    return;
  }

  adminMessages.innerHTML = allMessages.map(messageCardHtml).join('');
}

adminMessages.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('[data-action="delete-message"]');
  if (deleteButton) {
    const id = Number(deleteButton.dataset.id);
    const ok = confirm('Delete this message? This cannot be undone.');
    if (!ok) return;

    try {
      await deleteAdminMessage(id);
      deleteButton.closest('.message-card').remove();
    } catch (error) {
      console.error(error);
      showToast('Could not delete this message.');
    }
    return;
  }

  const toggleButton = event.target.closest('[data-action="toggle-reply"]');
  if (toggleButton) {
    const form = toggleButton.closest('.message-card').querySelector('.message-reply-form');
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) form.querySelector('textarea').focus();
    return;
  }

  const cancelButton = event.target.closest('[data-action="cancel-reply"]');
  if (cancelButton) {
    cancelButton.closest('.message-reply-form').classList.add('hidden');
  }
});

adminMessages.addEventListener('submit', async (event) => {
  const form = event.target.closest('.message-reply-form');
  if (!form) return;

  event.preventDefault();

  const id      = Number(form.dataset.id);
  const msg     = allMessages.find(m => m.id === id);
  const textarea = form.querySelector('textarea');
  const reply   = textarea.value.trim();

  if (!reply) return;

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    await replyToAdminMessage(id, reply);

    const mailtoUrl =
      `mailto:${encodeURIComponent(msg.email)}` +
      `?subject=${encodeURIComponent('Re: your message to PawFind')}` +
      `&body=${encodeURIComponent(reply + '\n\n---\nYour message:\n' + msg.message)}`;
    window.location.href = mailtoUrl;

    await loadMessagesList();
    showToast('Reply saved.', 'success');

  } catch (error) {
    console.error(error);
    showToast('Could not save the reply.');
    submitButton.disabled = false;
  }
});


// ---- Generički birač slike + upload (koristi se za hero i uspješnu priču) ----
function setupImagePicker({ pickerEl, previewEl, uploadInputEl, fallbackImage, getCurrentImage, onPick, onUpload }) {
  const uploadHintEl = uploadInputEl.parentElement.querySelector('.image-upload-hint');
  const uploadBox    = uploadInputEl.closest('.image-upload-box');
  const defaultHint  = uploadHintEl.textContent;

  async function render() {
    try {
      const [settings, images] = await Promise.all([getSettings(), getAdminImages()]);
      const currentImage = getCurrentImage(settings) || fallbackImage;
      previewEl.src = currentImage;

      pickerEl.innerHTML = images.map(image => `
        <button type="button"
                class="image-picker-item ${image === currentImage ? 'is-selected' : ''}"
                data-image="${image}">
          <img src="${image}" alt="">
        </button>
      `).join('');

    } catch (error) {
      console.error(error);
      pickerEl.innerHTML = `<p class="state-message">Could not load saved photos.</p>`;
    }
  }

  pickerEl.addEventListener('click', async (event) => {
    const button = event.target.closest('.image-picker-item');
    if (!button) return;

    const image = button.dataset.image;

    try {
      await onPick(image);
      previewEl.src = image;
      pickerEl.querySelectorAll('.image-picker-item').forEach(el => {
        el.classList.toggle('is-selected', el.dataset.image === image);
      });
      showToast('Photo updated.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Could not update the photo.');
    }
  });

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    uploadHintEl.textContent = 'Uploading…';

    try {
      const image = await onUpload(file);
      previewEl.src = image;
      pickerEl.querySelectorAll('.image-picker-item').forEach(el => el.classList.remove('is-selected'));
      showToast('Photo updated.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Could not upload the photo.');
    } finally {
      uploadHintEl.textContent = defaultHint;
      uploadInputEl.value = '';
    }
  }

  uploadInputEl.addEventListener('change', () => handleFile(uploadInputEl.files[0]));

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadBox.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadBox.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadBox.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadBox.classList.remove('is-dragover');
    });
  });

  uploadBox.addEventListener('drop', (event) => handleFile(event.dataTransfer.files[0]));

  return { render };
}

const heroPicker = setupImagePicker({
  pickerEl: heroImagePicker,
  previewEl: currentHeroPreview,
  uploadInputEl: document.querySelector('#heroUploadInput'),
  fallbackImage: 'images/hero.jpg',
  getCurrentImage: settings => settings.hero_image,
  onPick: updateHeroImage,
  onUpload: async file => (await uploadHeroImage(file)).hero_image
});

// ---- Uspješne priče: više nezavisnih priča, svaka sa svojim slikama i natpisom ----
const successStoriesList = document.querySelector('#successStoriesList');

let successStoriesAdmin = [];
let allPetImagesCache   = [];
let openStoryPickerId   = null;

function firstErrorMessage(error, fallback) {
  return (error.data && error.data.errors && error.data.errors[0]) || fallback;
}

function successStoryCardHtml(story) {
  const photosHtml = story.images.length > 0
    ? story.images.map(img => `
        <div class="image-preview-item">
          <img src="${img.image}" alt="">
          <button type="button" class="image-preview-remove" data-action="remove-photo" data-story="${story.id}" data-image-id="${img.id}" title="Remove photo">×</button>
        </div>
      `).join('')
    : `<p class="state-message">No photo yet — add one below.</p>`;

  const pickerOpen    = openStoryPickerId === story.id;
  const currentPaths  = story.images.map(img => img.image);

  const pickerPanel = pickerOpen ? `
    <div class="success-story-picker-panel">
      <div class="image-picker-grid">
        ${allPetImagesCache.map(image => `
          <button type="button"
                  class="image-picker-item ${currentPaths.includes(image) ? 'is-selected' : ''}"
                  data-action="add-existing-photo" data-story="${story.id}" data-image="${image}">
            <img src="${image}" alt="">
          </button>
        `).join('')}
      </div>
      <div class="image-upload-box">
        <input type="file" class="story-upload-input" data-story="${story.id}" accept="image/*">
        <p class="image-upload-hint">Click to choose a photo, or drag it here.</p>
      </div>
    </div>
  ` : '';

  return `
    <div class="success-story-admin-card">
      <div class="form-row">
        <div class="form-group">
          <label>Caption (English)</label>
          <input type="text" class="story-text-en" data-story="${story.id}" value="${story.text}">
        </div>
        <div class="form-group">
          <label>Caption (Serbian)</label>
          <input type="text" class="story-text-sr" data-story="${story.id}" value="${story.text_sr || ''}">
        </div>
      </div>

      <div class="image-preview-grid">${photosHtml}</div>

      <div class="success-story-admin-actions">
        <button type="button" class="link-btn" data-action="save-text" data-story="${story.id}">Save caption</button>
        <button type="button" class="link-btn" data-action="toggle-picker" data-story="${story.id}">${pickerOpen ? 'Close' : '+ Add photo'}</button>
        <button type="button" class="link-btn link-danger" data-action="delete-story" data-story="${story.id}">Delete story</button>
      </div>

      ${pickerPanel}
    </div>
  `;
}

function renderSuccessStoriesList() {
  successStoriesList.innerHTML = successStoriesAdmin.length > 0
    ? successStoriesAdmin.map(successStoryCardHtml).join('')
    : `<p class="state-message">No success stories yet — add one below.</p>`;
}

async function loadSuccessStories() {
  try {
    [successStoriesAdmin, allPetImagesCache] = await Promise.all([
      getAdminSuccessStories(),
      getAdminImages()
    ]);
    renderSuccessStoriesList();
  } catch (error) {
    console.error(error);
    successStoriesList.innerHTML = `<p class="state-message">Could not load success stories.</p>`;
  }
}

document.querySelector('#addSuccessStoryButton').addEventListener('click', async () => {
  const textEn = prompt('Caption for the new story (English):');
  if (!textEn || !textEn.trim()) return;

  try {
    await createSuccessStory(textEn.trim(), '');
    await loadSuccessStories();
    showToast('Story added — now add a photo.', 'success');
  } catch (error) {
    console.error(error);
    showToast(firstErrorMessage(error, 'Could not add the story.'));
  }
});

successStoriesList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const action  = button.dataset.action;
  const storyId = Number(button.dataset.story);

  if (action === 'toggle-picker') {
    openStoryPickerId = openStoryPickerId === storyId ? null : storyId;
    renderSuccessStoriesList();
    return;
  }

  if (action === 'save-text') {
    const card  = button.closest('.success-story-admin-card');
    const textEn = card.querySelector('.story-text-en').value.trim();
    const textSr = card.querySelector('.story-text-sr').value.trim();

    if (!textEn) { showToast('Please write an English caption.'); return; }

    try {
      await updateSuccessStory(storyId, textEn, textSr);
      showToast('Caption saved.', 'success');
    } catch (error) {
      console.error(error);
      showToast(firstErrorMessage(error, 'Could not save the caption.'));
    }
    return;
  }

  if (action === 'delete-story') {
    if (!confirm('Delete this success story? This cannot be undone.')) return;

    try {
      await deleteSuccessStory(storyId);
      if (openStoryPickerId === storyId) openStoryPickerId = null;
      await loadSuccessStories();
      showToast('Story deleted.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Could not delete the story.');
    }
    return;
  }

  if (action === 'add-existing-photo') {
    try {
      await addSuccessStoryImage(storyId, button.dataset.image);
      await loadSuccessStories();
      showToast('Photo added.', 'success');
    } catch (error) {
      console.error(error);
      showToast(firstErrorMessage(error, 'Could not add the photo.'));
    }
    return;
  }

  if (action === 'remove-photo') {
    try {
      await removeSuccessStoryImage(storyId, Number(button.dataset.imageId));
      await loadSuccessStories();
      showToast('Photo removed.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Could not remove the photo.');
    }
  }
});

async function handleStoryUpload(storyId, file) {
  if (!file || !file.type.startsWith('image/')) return;

  try {
    await uploadSuccessStoryImage(storyId, file);
    await loadSuccessStories();
    showToast('Photo added.', 'success');
  } catch (error) {
    console.error(error);
    showToast(firstErrorMessage(error, 'Could not upload the photo.'));
  }
}

successStoriesList.addEventListener('change', (event) => {
  const input = event.target.closest('.story-upload-input');
  if (!input) return;
  handleStoryUpload(Number(input.dataset.story), input.files[0]);
  input.value = '';
});

['dragenter', 'dragover'].forEach(eventName => {
  successStoriesList.addEventListener(eventName, (event) => {
    const box = event.target.closest('.image-upload-box');
    if (!box) return;
    event.preventDefault();
    box.classList.add('is-dragover');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  successStoriesList.addEventListener(eventName, (event) => {
    const box = event.target.closest('.image-upload-box');
    if (!box) return;
    event.preventDefault();
    box.classList.remove('is-dragover');
  });
});

successStoriesList.addEventListener('drop', (event) => {
  const box = event.target.closest('.image-upload-box');
  if (!box) return;
  const input = box.querySelector('.story-upload-input');
  handleStoryUpload(Number(input.dataset.story), event.dataTransfer.files[0]);
});

async function loadHomePagePanel() {
  await heroPicker.render();
  await loadSuccessStories();
}


// ---- Prikaži "Adopted by" samo kad je status "Adopted" ----
const petStatusSelect = document.querySelector('#petStatus');
const adoptedByGroup  = document.querySelector('#adoptedByGroup');

function updateAdoptedByVisibility() {
  adoptedByGroup.classList.toggle('hidden', petStatusSelect.value !== 'adopted');
}

petStatusSelect.addEventListener('change', updateAdoptedByVisibility);


// ---- Forma: otvori ----
async function openPetForm(pet) {
  petFormMessage.innerHTML = '';
  selectedFiles   = [];
  removedImageIds = [];
  existingImages  = [];

  if (pet) {
    petFormTitle.textContent = `Edit ${pet.name}`;
    document.querySelector('#petId').value          = pet.id;
    document.querySelector('#petName').value        = pet.name;
    document.querySelector('#petBreed').value       = pet.breed || '';
    document.querySelector('#petSpecies').value     = pet.species;
    document.querySelector('#petAge').value         = pet.age;
    document.querySelector('#petGender').value      = pet.gender;
    document.querySelector('#petSize').value        = pet.size;
    document.querySelector('#petLocation').value    = pet.location;
    document.querySelector('#petPersonality').value = pet.personality || '';
    document.querySelector('#petStatus').value      = pet.status;
    document.querySelector('#petAdoptedBy').value   = pet.adopted_by || '';
    document.querySelector('#petDescription').value = pet.description || '';
    document.querySelector('#petDescriptionSr').value = pet.description_sr || '';
    document.querySelector('#petVaccinated').checked = pet.vaccinated === 1;
    document.querySelector('#petNeutered').checked   = pet.neutered === 1;
    document.querySelector('#petKids').checked       = pet.good_with_kids === 1;
    document.querySelector('#petDogs').checked       = pet.good_with_dogs === 1;
    document.querySelector('#petCats').checked       = pet.good_with_cats === 1;

    const full = await getPetById(pet.id);
    existingImages = (full && full.images) || [];
  } else {
    petFormTitle.textContent = 'Add a new pet';
    petForm.reset();
    document.querySelector('#petId').value = '';
  }

  updateAdoptedByVisibility();
  renderImagePreview();
  petForm.classList.remove('hidden');
  petForm.scrollIntoView({ behavior: 'smooth' });
}

function closePetForm() {
  petForm.classList.add('hidden');
  petForm.reset();
  petFormMessage.innerHTML = '';
  selectedFiles   = [];
  removedImageIds = [];
  existingImages  = [];
  renderImagePreview();
}

newPetButton.addEventListener('click', () => openPetForm(null));
petCancelButton.addEventListener('click', closePetForm);


// ---- Forma: snimi ----
petForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  petFormMessage.innerHTML = '';

  const id = document.querySelector('#petId').value;

  const data = new FormData();
  data.append('name',           document.querySelector('#petName').value);
  data.append('breed',          document.querySelector('#petBreed').value);
  data.append('species',        document.querySelector('#petSpecies').value);
  data.append('age',            document.querySelector('#petAge').value);
  data.append('gender',         document.querySelector('#petGender').value);
  data.append('size',           document.querySelector('#petSize').value);
  data.append('location',       document.querySelector('#petLocation').value);
  data.append('personality',    document.querySelector('#petPersonality').value);
  data.append('status',         document.querySelector('#petStatus').value);
  data.append('adopted_by',     document.querySelector('#petAdoptedBy').value);
  data.append('description',    document.querySelector('#petDescription').value);
  data.append('description_sr', document.querySelector('#petDescriptionSr').value);
  data.append('vaccinated',     document.querySelector('#petVaccinated').checked);
  data.append('neutered',       document.querySelector('#petNeutered').checked);
  data.append('good_with_kids', document.querySelector('#petKids').checked);
  data.append('good_with_dogs', document.querySelector('#petDogs').checked);
  data.append('good_with_cats', document.querySelector('#petCats').checked);

  selectedFiles.forEach(file => data.append('images', file));
  if (id) data.append('deleteImageIds', JSON.stringify(removedImageIds));

  try {
    if (id) {
      await updatePet(id, data);
    } else {
      await createPet(data);
    }

    closePetForm();
    await loadPetsTable();
    await loadStats();

  } catch (error) {
    console.error(error);

    const messages = (error.data && error.data.errors)
      ? error.data.errors
      : ['Something went wrong. Please try again.'];

    petFormMessage.innerHTML = `
      <div class="error-box">
        <ul>${messages.map(m => `<li>${m}</li>`).join('')}</ul>
      </div>
    `;
  }
});


// ---- Klik u tabeli ----
petsTableBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = Number(button.dataset.id);
  const pet = allPets.find(p => p.id === id);

  if (button.dataset.action === 'edit') {
    openPetForm(pet);
    return;
  }

  if (button.dataset.action === 'delete') {
    const ok = confirm(
      `Delete ${pet.name}?\n\nThis will also delete all applications and favourites for this pet. This cannot be undone.`
    );

    if (!ok) return;

    try {
      await deletePet(id);
      await loadPetsTable();
      await loadStats();
    } catch (error) {
      console.error(error);
    showToast('Could not delete this pet.');    }
  }
});


// ---- Start ----
async function init() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      adminSubtitle.textContent = '';
      adminGuard.innerHTML = `
        <div class="state-message">
          <p>You must be logged in as an administrator.</p>
          <a href="login.html" class="btn btn-primary">Log in</a>
        </div>
      `;
      return;
    }

    if (user.role !== 'admin') {
      adminSubtitle.textContent = '';
      adminGuard.innerHTML = `
        <div class="state-message">
          <p>You do not have access to this page.</p>
          <a href="index.html" class="btn btn-primary">Back to home</a>
        </div>
      `;
      return;
    }

    adminSubtitle.textContent = `Signed in as ${user.name}`;
    adminPanel.classList.remove('hidden');

    await loadStats();
    await loadPetsTable();
    await loadApplicationsList();
    await loadMessagesList();
    await loadHomePagePanel();

  } catch (error) {
    console.error(error);
    adminGuard.innerHTML = `<p class="state-message">Could not load the dashboard.</p>`;
  }
}

// ---- Promjena statusa prijave ----
adminApplications.addEventListener('change', async (event) => {
  const select = event.target.closest('.status-select');
  if (!select) return;

  const id        = Number(select.dataset.id);
  const newStatus = select.value;

  select.disabled = true;

  try {
    await updateApplicationStatus(id, newStatus);
    showToast(`Status changed to ${newStatus}`, 'success');

    // Oboji oznaku bez ponovnog učitavanja
    const badge = adminApplications.querySelector(`[data-badge-for="${id}"]`);
    badge.textContent = newStatus;
    badge.className = `status-badge ${statusClass(newStatus)}`;

    // Approved je mogao promijeniti i ljubimca
    await loadStats();
    await loadPetsTable();

    select.disabled = false;

  } catch (error) {
    console.error(error);
    showToast('Could not update the status.');
    await loadApplicationsList();
  }
});

init();
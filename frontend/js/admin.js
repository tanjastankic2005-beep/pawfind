// ---- Elementi ----
const adminSubtitle    = document.querySelector('#adminSubtitle');
const adminGuard       = document.querySelector('#adminGuard');
const adminPanel       = document.querySelector('#adminPanel');
const statsGrid        = document.querySelector('#statsGrid');
const petsTableBody    = document.querySelector('#petsTableBody');
const adminApplications = document.querySelector('#adminApplications');

const petForm          = document.querySelector('#petForm');
const petFormTitle     = document.querySelector('#petFormTitle');
const petFormMessage   = document.querySelector('#petFormMessage');
const newPetButton     = document.querySelector('#newPetButton');
const petCancelButton  = document.querySelector('#petCancelButton');

let allPets = [];


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
    <div class="stat-card"><span class="stat-number">${s.pendingApplications}</span><span class="stat-label">Pending</span></div>
    <div class="stat-card"><span class="stat-number">${s.approvedApplications}</span><span class="stat-label">Approved</span></div>
  `;
}


// ---- Tabela ljubimaca ----
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
        <span class="status-badge ${pet.status === 'available' ? 'status-approved' : 'status-completed'}">
          ${pet.status}
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

// ---- Forma: otvori ----
function openPetForm(pet) {
  petFormMessage.innerHTML = '';

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
    document.querySelector('#petImage').value       = pet.image || '';
    document.querySelector('#petStatus').value      = pet.status;
    document.querySelector('#petDescription').value = pet.description || '';
    document.querySelector('#petVaccinated').checked = pet.vaccinated === 1;
    document.querySelector('#petNeutered').checked   = pet.neutered === 1;
    document.querySelector('#petKids').checked       = pet.good_with_kids === 1;
    document.querySelector('#petDogs').checked       = pet.good_with_dogs === 1;
    document.querySelector('#petCats').checked       = pet.good_with_cats === 1;
  } else {
    petFormTitle.textContent = 'Add a new pet';
    petForm.reset();
    document.querySelector('#petId').value = '';
  }

  petForm.classList.remove('hidden');
  petForm.scrollIntoView({ behavior: 'smooth' });
}

function closePetForm() {
  petForm.classList.add('hidden');
  petForm.reset();
  petFormMessage.innerHTML = '';
}

newPetButton.addEventListener('click', () => openPetForm(null));
petCancelButton.addEventListener('click', closePetForm);


// ---- Forma: snimi ----
petForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  petFormMessage.innerHTML = '';

  const id = document.querySelector('#petId').value;

  const data = {
    name:           document.querySelector('#petName').value,
    breed:          document.querySelector('#petBreed').value,
    species:        document.querySelector('#petSpecies').value,
    age:            document.querySelector('#petAge').value,
    gender:         document.querySelector('#petGender').value,
    size:           document.querySelector('#petSize').value,
    location:       document.querySelector('#petLocation').value,
    personality:    document.querySelector('#petPersonality').value,
    image:          document.querySelector('#petImage').value,
    status:         document.querySelector('#petStatus').value,
    description:    document.querySelector('#petDescription').value,
    vaccinated:     document.querySelector('#petVaccinated').checked,
    neutered:       document.querySelector('#petNeutered').checked,
    good_with_kids: document.querySelector('#petKids').checked,
    good_with_dogs: document.querySelector('#petDogs').checked,
    good_with_cats: document.querySelector('#petCats').checked
  };

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
      alert('Could not delete this pet.');
    }
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
    alert('Could not update the status.');
    await loadApplicationsList();
  }
});

init();
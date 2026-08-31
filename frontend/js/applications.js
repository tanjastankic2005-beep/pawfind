const form         = document.querySelector('#applicationForm');
const submitButton = document.querySelector('#submitButton');
const formMessage  = document.querySelector('#formMessage');
const petSummary   = document.querySelector('#petSummary');

// ID ljubimca iz adrese: apply.html?id=1
const params = new URLSearchParams(window.location.search);
const petId  = params.get('id');


// ---- Pokaži za kojeg ljubimca se prijavljuje ----
async function loadPetSummary() {
  if (!petId) {
    petSummary.innerHTML = `<p class="state-message">${t('apply.noSelection')}</p>`;
    return;
  }

  try {
    const pet = await getPetById(petId);

    if (!pet) {
      petSummary.innerHTML = `<p class="state-message">${t('apply.noLongerAvailable')}</p>`;
      return;
    }

    petSummary.innerHTML = `
      <div class="apply-pet">
        <img src="${pet.image}" alt="${pet.name}">
        <div>
          <p class="apply-pet-label">${t('apply.applyingTo')}</p>
          <h2 class="apply-pet-name">${pet.name}</h2>
          <p class="apply-pet-meta">
            ${tSpecies(pet.species)} · ${pet.age} ${tYearsWord(pet.age)} · ${pet.location}
          </p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);
  }
}


// ---- Greške ----
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(p => {
    p.textContent = '';
  });
  formMessage.innerHTML = '';
}

function showFieldError(field, message) {
  const p = document.querySelector(`#error-${field}`);
  if (p) p.textContent = message;
}


// ---- Validacija na frontendu ----
function validate(data) {
  let valid = true;

  if (data.applicant_name.trim().length < 2) {
    showFieldError('applicant_name', t('apply.nameError'));
    valid = false;
  }

  if (!data.applicant_email.includes('@')) {
    showFieldError('applicant_email', t('apply.emailError'));
    valid = false;
  }

  if (data.reason.trim().length < 10) {
    showFieldError('reason', t('apply.reasonError'));
    valid = false;
  }

  return valid;
}


// ---- Slanje forme ----
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearErrors();

  const data = {
    pet_id:            petId,
    applicant_name:    document.querySelector('#applicant_name').value,
    applicant_email:   document.querySelector('#applicant_email').value,
    phone:             document.querySelector('#phone').value,
    city:              document.querySelector('#city').value,
    housing_type:      document.querySelector('#housing_type').value,
    has_yard:          document.querySelector('#has_yard').checked,
    has_other_pets:    document.querySelector('#has_other_pets').checked,
    has_children:      document.querySelector('#has_children').checked,
    pet_experience:    document.querySelector('#pet_experience').value,
    reason:            document.querySelector('#reason').value,
    preferred_contact: document.querySelector('input[name="preferred_contact"]:checked').value
  };

  if (!validate(data)) return;

  submitButton.disabled = true;
  submitButton.textContent = t('apply.sendingButton');

  try {
    const result = await createApplication(data);

    form.style.display = 'none';
    petSummary.style.display = 'none';

    formMessage.innerHTML = `
      <div class="success-box">
        <h2>${t('apply.thankYou')}</h2>
        <p>${t('apply.received')}</p>
        <p>${t('apply.reference')} <strong>#${result.id}</strong></p>
        <p>${t('apply.contactSoon')}</p>
        <a href="pets.html" class="btn btn-primary">${t('apply.browseMore')}</a>
      </div>
    `;

  } catch (error) {
    console.error(error);

    if (error.data && error.data.errors) {
      formMessage.innerHTML = `
        <div class="error-box">
          <p>${t('apply.fixFollowing')}</p>
          <ul>${error.data.errors.map(e => `<li>${e}</li>`).join('')}</ul>
        </div>
      `;
    } else {
      formMessage.innerHTML = `
        <div class="error-box">
          <p>${t('apply.genericError')}</p>
        </div>
      `;
    }

    submitButton.disabled = false;
    submitButton.textContent = t('apply.sendButton');
  }
});


loadPetSummary();

window.addEventListener('pawfind:langchange', loadPetSummary);

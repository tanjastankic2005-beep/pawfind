const profileContent = document.querySelector('#profileContent');


// "Under Review" → "status-under-review"
function statusClass(status) {
  return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
}


// "2026-08-28T11:15:53.000Z" → "28 Aug 2026"
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}


function createApplicationCard(app) {
  return `
    <article class="application-card">
      <img src="${app.pet_image}" alt="${app.pet_name}" class="application-image">

      <div class="application-info">
        <h3 class="application-pet">${app.pet_name}</h3>
        <p class="application-meta">
          ${tSpecies(app.pet_species)} · 📍 ${app.pet_location}
        </p>
        <p class="application-date">${t('profile.applied', { date: formatDate(app.created_at) })}</p>
      </div>

      <div class="application-side">
        <span class="status-badge ${statusClass(app.status)}">${tAppStatus(app.status)}</span>
        <a href="pet.html?id=${app.pet_id}" class="application-link">${t('profile.viewPet')}</a>
      </div>
    </article>
  `;
}


async function loadProfile() {
  try {
    const user = await getCurrentUser();

    // ---- Nije prijavljena ----
    if (!user) {
      profileContent.innerHTML = `
        <div class="state-message">
          <p>${t('profile.loginPrompt')}</p>
          <a href="login.html" class="btn btn-primary">${t('profile.loginButton')}</a>
        </div>
      `;
      return;
    }

    // ---- Dva requesta odjednom ----
    const [applications, favorites] = await Promise.all([
      getMyApplications(),
      getFavorites()
    ]);

    const applicationsHtml = applications.length === 0
      ? `<div class="state-message">
           <p>${t('profile.noApplications')}</p>
           <a href="pets.html" class="btn btn-primary">${t('profile.browseButton')}</a>
         </div>`
      : applications.map(createApplicationCard).join('');

    profileContent.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1 class="profile-name">${user.name}</h1>
          <p class="profile-email">${user.email}</p>
          <p class="profile-since">${t('profile.memberSince', { date: formatDate(user.created_at) })}</p>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <span class="stat-number">${favorites.length}</span>
          <span class="stat-label">${t('profile.savedPetsStat')}</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${applications.length}</span>
          <span class="stat-label">${t('profile.applicationsStat')}</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${applications.filter(a => a.status === 'Approved').length}</span>
          <span class="stat-label">${t('profile.approvedStat')}</span>
        </div>
      </div>

      <h2 class="section-subtitle">${t('profile.myApplications')}</h2>
      <div class="applications-list">
        ${applicationsHtml}
      </div>

      <h2 class="section-subtitle">${t('profile.savedPetsTitle')}</h2>
      <p class="profile-hint">
        ${t('favorites.countSaved', { n: favorites.length, word: tPetsWord(favorites.length) })}.
        <a href="favorites.html">${t('profile.seeAllFavorites')}</a>
      </p>

      <h2 class="section-subtitle">${t('profile.changePasswordTitle')}</h2>
      <form id="passwordForm" class="form form-flat" novalidate>

        <div class="form-group">
          <label for="currentPassword"><span>${t('profile.currentPasswordLabel')}</span> <span class="required">*</span></label>
          <input type="password" id="currentPassword" name="currentPassword" autocomplete="current-password">
          <p class="field-error" id="error-currentPassword"></p>
        </div>

        <div class="form-group">
          <label for="newPassword"><span>${t('profile.newPasswordLabel')}</span> <span class="required">*</span></label>
          <input type="password" id="newPassword" name="newPassword" autocomplete="new-password">
          <p class="field-hint">${t('auth.passwordHint')}</p>
          <p class="field-error" id="error-newPassword"></p>
        </div>

        <div class="form-group">
          <label for="newPassword2"><span>${t('profile.repeatNewPasswordLabel')}</span> <span class="required">*</span></label>
          <input type="password" id="newPassword2" name="newPassword2" autocomplete="new-password">
          <p class="field-error" id="error-newPassword2"></p>
        </div>

        <button type="submit" class="btn btn-primary" id="passwordButton">${t('profile.changePasswordButton')}</button>

      </form>
      <div id="passwordFormMessage"></div>
    `;

  } catch (error) {
    console.error(error);
    profileContent.innerHTML = `
      <div class="state-message">
        <p>${t('profile.couldNotLoad')}</p>
      </div>
    `;
  }
}


loadProfile();

window.addEventListener('pawfind:langchange', loadProfile);


// ---- Promjena šifre ----
function clearPasswordErrors() {
  document.querySelectorAll('#passwordForm .field-error').forEach(p => { p.textContent = ''; });
  const message = document.querySelector('#passwordFormMessage');
  if (message) message.innerHTML = '';
}

profileContent.addEventListener('submit', async (event) => {
  const form = event.target.closest('#passwordForm');
  if (!form) return;

  event.preventDefault();
  clearPasswordErrors();

  const currentPassword = document.querySelector('#currentPassword').value;
  const newPassword     = document.querySelector('#newPassword').value;
  const newPassword2    = document.querySelector('#newPassword2').value;
  const passwordMessage = document.querySelector('#passwordFormMessage');

  let valid = true;

  if (!currentPassword) {
    document.querySelector('#error-currentPassword').textContent = t('profile.currentPasswordRequired');
    valid = false;
  }

  if (newPassword.length < 8) {
    document.querySelector('#error-newPassword').textContent = t('auth.passwordTooShort');
    valid = false;
  }

  if (newPassword !== newPassword2) {
    document.querySelector('#error-newPassword2').textContent = t('auth.passwordsMismatch');
    valid = false;
  }

  if (!valid) return;

  const passwordButton = document.querySelector('#passwordButton');
  passwordButton.disabled = true;

  try {
    await changePassword(currentPassword, newPassword);

    form.reset();
    passwordMessage.innerHTML = `<div class="success-box"><p>${t('profile.passwordUpdated')}</p></div>`;

  } catch (error) {
    console.error(error);

    if (error.data && error.data.errors && error.data.errors.includes('Current password is incorrect.')) {
      document.querySelector('#error-currentPassword').textContent = t('profile.currentPasswordIncorrect');
    } else if (error.data && error.data.errors) {
      passwordMessage.innerHTML = `<div class="error-box"><ul>${error.data.errors.map(e => `<li>${e}</li>`).join('')}</ul></div>`;
    } else {
      passwordMessage.innerHTML = `<div class="error-box"><p>${t('auth.genericError')}</p></div>`;
    }

  } finally {
    passwordButton.disabled = false;
  }
});

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

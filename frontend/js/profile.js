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
          ${app.pet_species} · 📍 ${app.pet_location}
        </p>
        <p class="application-date">Applied ${formatDate(app.created_at)}</p>
      </div>

      <div class="application-side">
        <span class="status-badge ${statusClass(app.status)}">${app.status}</span>
        <a href="pet.html?id=${app.pet_id}" class="application-link">View pet →</a>
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
          <p>Log in to see your profile, favourites and applications.</p>
          <a href="login.html" class="btn btn-primary">Log in</a>
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
           <p>You have not applied for any pet yet.</p>
           <a href="pets.html" class="btn btn-primary">Browse pets</a>
         </div>`
      : applications.map(createApplicationCard).join('');

    profileContent.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1 class="profile-name">${user.name}</h1>
          <p class="profile-email">${user.email}</p>
          <p class="profile-since">Member since ${formatDate(user.created_at)}</p>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <span class="stat-number">${favorites.length}</span>
          <span class="stat-label">Saved pets</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${applications.length}</span>
          <span class="stat-label">Applications</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${applications.filter(a => a.status === 'Approved').length}</span>
          <span class="stat-label">Approved</span>
        </div>
      </div>

      <h2 class="section-subtitle">My applications</h2>
      <div class="applications-list">
        ${applicationsHtml}
      </div>

      <h2 class="section-subtitle">Saved pets</h2>
      <p class="profile-hint">
        You have ${favorites.length} saved ${favorites.length === 1 ? 'pet' : 'pets'}.
        <a href="favorites.html">See all favourites →</a>
      </p>
    `;

  } catch (error) {
    console.error(error);
    profileContent.innerHTML = `
      <div class="state-message">
        <p>Could not load your profile. Is the server running?</p>
      </div>
    `;
  }
}


loadProfile();
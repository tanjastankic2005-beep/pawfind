// ---- Mobilna navigacija ----
const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
}


// ---- Navigacija za prijavljenog korisnika ----
async function updateNav() {
  if (!mainNav) return;

  try {
    const user = await getCurrentUser();

    // Nije prijavljena — ostavi navigaciju kakva jeste
    if (!user) return;

    const firstName = user.name.split(' ')[0];

    const adminLink = user.role === 'admin'
      ? '<a href="admin.html" class="nav-link">Admin</a>'
      : '';

    mainNav.innerHTML = `
      <a href="index.html" class="nav-link">Home</a>
      <a href="pets.html" class="nav-link">Browse Pets</a>
      <a href="favorites.html" class="nav-link">Favorites</a>
      ${adminLink}
      <a href="profile.html" class="nav-link">Hi, ${firstName}</a>
      <button class="nav-logout" id="logoutButton">Log out</button>
    `;

    document.querySelector('#logoutButton').addEventListener('click', async () => {
      await logoutUser();
      window.location.href = 'index.html';
    });

  } catch (error) {
    console.error(error);
  }
}


// Pokreni tek kad su svi skriptovi učitani
window.addEventListener('DOMContentLoaded', updateNav);
// ---- Kratke poruke u uglu ekrana ----
function showToast(message, type = 'error') {
  let container = document.querySelector('#toastContainer');

  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}
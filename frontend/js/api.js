// SVA komunikacija sa backendom ide kroz ovaj fajl.

// =========================================
//  POMOĆNA FUNKCIJA ZA SVE POST POZIVE
// =========================================
async function postJson(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error('Request failed');
    error.status = response.status;
    error.data = result;
    throw error;
  }

  return result;
}


// =========================================
//  LJUBIMCI
// =========================================
async function getPets(filters = {}) {
  const params = new URLSearchParams();

  for (const key in filters) {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  }

  const query = params.toString();
  const url = query ? `/api/pets?${query}` : '/api/pets';

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Server je odgovorio sa ${response.status}`);
  }

  return response.json();
}


async function getPetById(id) {
  const response = await fetch(`/api/pets/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Server je odgovorio sa ${response.status}`);
  }

  return response.json();
}


// =========================================
//  PRIJAVE ZA UDOMLJAVANJE
// =========================================
async function createApplication(data) {
  return postJson('/api/applications', data);
}


// =========================================
//  NALOZI, PRIJAVA I ODJAVA
// =========================================
async function registerUser(data) {
  return postJson('/api/auth/register', data);
}


async function loginUser(data) {
  return postJson('/api/auth/login', data);
}


async function logoutUser() {
  return postJson('/api/auth/logout', {});
}


async function getCurrentUser() {
  const response = await fetch('/api/auth/me');

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Server je odgovorio sa ${response.status}`);
  }

  return response.json();
}
// =========================================
//  FAVORITI
// =========================================
async function getFavorites() {
  const response = await fetch('/api/favorites');

  if (response.status === 401) return null;

  if (!response.ok) {
    throw new Error(`Server je odgovorio sa ${response.status}`);
  }

  return response.json();
}


async function getFavoriteIds() {
  const response = await fetch('/api/favorites/ids');

  if (response.status === 401) return null;

  if (!response.ok) {
    throw new Error(`Server je odgovorio sa ${response.status}`);
  }

  return response.json();
}


async function addFavorite(petId) {
  return postJson('/api/favorites', { pet_id: petId });
}


async function removeFavorite(petId) {
  const response = await fetch(`/api/favorites/${petId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(`Server je odgovorio sa ${response.status}`);
  }

  return response.json();
}
// =========================================
//  MOJE PRIJAVE
// =========================================
async function getMyApplications() {
  const response = await fetch('/api/applications/me');

  if (response.status === 401) return null;

  if (!response.ok) {
    throw new Error(`Server je odgovorio sa ${response.status}`);
  }

  return response.json();
}
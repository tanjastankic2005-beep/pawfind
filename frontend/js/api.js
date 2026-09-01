// SVA komunikacija sa backendom ide kroz ovaj fajl.

// =========================================
//  JEDNA FUNKCIJA ZA SVE ZAHTJEVE
// =========================================
async function request(method, url, data = null) {
  const options = { method };

  if (data instanceof FormData) {
    // Ne postavljaj Content-Type ručno — browser sam doda multipart boundary.
    options.body = data;
  } else if (data !== null) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(data);
  }

  let response;

  // 1. Je li request uopšte stigao do servera?
  try {
    response = await fetch(url, options);
  } catch (networkError) {
    const error = new Error('Cannot reach the server. Is it running?');
    error.status = 0;
    throw error;
  }

  // 2. Pokušaj pročitati tijelo (može biti prazno)
  let result = null;
  const text = await response.text();

  if (text) {
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      result = null;
    }
  }

  // 3. Je li server odgovorio greškom?
  if (!response.ok) {
    const message = (result && result.error)
      ? result.error
      : `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.data = result;
    throw error;
  }

  return result;
}


// Za rute gdje neki status NIJE greška nego odgovor
async function requestOrNull(url, ...okStatuses) {
  try {
    return await request('GET', url);
  } catch (error) {
    if (okStatuses.includes(error.status)) return null;
    throw error;
  }
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

  return request('GET', url);
}


async function getPetById(id) {
  return requestOrNull(`/api/pets/${id}`, 404);
}


async function getAdoptedPets() {
  return request('GET', '/api/pets/adopted');
}


// =========================================
//  PRIJAVE ZA UDOMLJAVANJE
// =========================================
async function createApplication(data) {
  return request('POST', '/api/applications', data);
}


async function getMyApplications() {
  return requestOrNull('/api/applications/me', 401);
}


// =========================================
//  NALOZI, PRIJAVA I ODJAVA
// =========================================
async function registerUser(data) {
  return request('POST', '/api/auth/register', data);
}


async function loginUser(data) {
  return request('POST', '/api/auth/login', data);
}


async function logoutUser() {
  return request('POST', '/api/auth/logout', {});
}


async function getCurrentUser() {
  return requestOrNull('/api/auth/me', 401);
}


// =========================================
//  FAVORITI
// =========================================
async function getFavorites() {
  return requestOrNull('/api/favorites', 401);
}


async function getFavoriteIds() {
  return requestOrNull('/api/favorites/ids', 401);
}


async function addFavorite(petId) {
  return request('POST', '/api/favorites', { pet_id: petId });
}


async function removeFavorite(petId) {
  return request('DELETE', `/api/favorites/${petId}`);
}


// =========================================
//  ADMIN
// =========================================
async function getAdminStats() {
  return request('GET', '/api/admin/stats');
}


async function getAdminPets() {
  return request('GET', '/api/admin/pets');
}


async function getAdminApplications() {
  return request('GET', '/api/admin/applications');
}


async function createPet(data) {
  return request('POST', '/api/pets', data);
}


async function updatePet(id, data) {
  return request('PUT', `/api/pets/${id}`, data);
}


async function deletePet(id) {
  return request('DELETE', `/api/pets/${id}`);
}


async function updateApplicationStatus(id, status) {
  return request('PATCH', `/api/applications/${id}/status`, { status });
}


// =========================================
//  KONTAKT
// =========================================
async function sendContactMessage(data) {
  return request('POST', '/api/contact', data);
}


async function getAdminMessages() {
  return request('GET', '/api/admin/messages');
}


async function deleteAdminMessage(id) {
  return request('DELETE', `/api/admin/messages/${id}`);
}


async function replyToAdminMessage(id, reply) {
  return request('PATCH', `/api/admin/messages/${id}/reply`, { reply });
}


// =========================================
//  PODEŠAVANJA SAJTA
// =========================================
async function getSettings() {
  return request('GET', '/api/settings');
}


async function getAdminImages() {
  return request('GET', '/api/admin/images');
}


async function updateHeroImage(image) {
  return request('PUT', '/api/admin/settings/hero-image', { image });
}


async function uploadHeroImage(file) {
  const data = new FormData();
  data.append('image', file);
  return request('POST', '/api/admin/settings/hero-image/upload', data);
}


async function getSuccessStories() {
  return request('GET', '/api/success-stories');
}


async function getAdminSuccessStories() {
  return request('GET', '/api/admin/success-stories');
}


async function createSuccessStory(text, textSr) {
  return request('POST', '/api/admin/success-stories', { text, text_sr: textSr });
}


async function updateSuccessStory(id, text, textSr) {
  return request('PUT', `/api/admin/success-stories/${id}`, { text, text_sr: textSr });
}


async function deleteSuccessStory(id) {
  return request('DELETE', `/api/admin/success-stories/${id}`);
}


async function addSuccessStoryImage(storyId, image) {
  return request('POST', `/api/admin/success-stories/${storyId}/images`, { image });
}


async function uploadSuccessStoryImage(storyId, file) {
  const data = new FormData();
  data.append('image', file);
  return request('POST', `/api/admin/success-stories/${storyId}/images/upload`, data);
}


async function removeSuccessStoryImage(storyId, imageId) {
  return request('DELETE', `/api/admin/success-stories/${storyId}/images/${imageId}`);
}


// =========================================
//  DODAVANJE LJUBIMCA (prijavljeni korisnici)
// =========================================
async function submitPet(data) {
  return request('POST', '/api/pets/submit', data);
}
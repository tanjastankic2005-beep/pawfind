// SVA komunikacija sa backendom ide kroz ovaj fajl.

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
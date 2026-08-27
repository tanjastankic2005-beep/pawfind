// SVA komunikacija sa backendom ide kroz ovaj fajl.

async function getPets() {
  const response = await fetch('/api/pets');

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
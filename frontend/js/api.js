// SVA komunikacija sa backendom ide kroz ovaj fajl.

async function getPets() {
  const response = await fetch('/api/pets');

  if (!response.ok) {
    throw new Error(`Server je odgovorio sa ${response.status}`);
  }

  return response.json();
}
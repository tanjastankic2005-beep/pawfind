// PRIVREMENI PODACI
// U Fazi 6 ovo zamjenjuje prava SQLite baza,
// a ovaj fajl brišemo.

const pets = [
  {
    id: 1,
    name: "Luna",
    species: "dog",
    breed: "Border Collie mix",
    age: 2,
    gender: "female",
    size: "medium",
    location: "Banja Luka",
    description: "Gentle, smart and endlessly curious. Luna loves long walks and learns tricks in minutes.",
    image: "images/pet-1.jpg",
    vaccinated: true,
    status: "available"
  },
  {
    id: 2,
    name: "Max",
    species: "dog",
    breed: "Labrador mix",
    age: 5,
    gender: "male",
    size: "large",
    location: "Sarajevo",
    description: "A calm big guy who has been waiting far too long. Great with children.",
    image: "images/pet-2.jpg",
    vaccinated: true,
    status: "available"
  },
  {
    id: 3,
    name: "Mia",
    species: "cat",
    breed: "Domestic shorthair",
    age: 1,
    gender: "female",
    size: "small",
    location: "Banja Luka",
    description: "Playful and talkative. Mia will supervise everything you do, closely.",
    image: "images/pet-3.jpg",
    vaccinated: true,
    status: "available"
  },
  {
    id: 4,
    name: "Rex",
    species: "dog",
    breed: "German Shepherd mix",
    age: 7,
    gender: "male",
    size: "large",
    location: "Tuzla",
    description: "A senior with a soft heart. Rex asks for little: a warm bed and a slow walk.",
    image: "images/pet-4.jpg",
    vaccinated: true,
    status: "available"
  },
  {
    id: 5,
    name: "Nala",
    species: "cat",
    breed: "Tabby",
    age: 3,
    gender: "female",
    size: "small",
    location: "Mostar",
    description: "Independent but affectionate on her own terms. Loves sunny windowsills.",
    image: "images/pet-5.jpg",
    vaccinated: false,
    status: "available"
  },
  {
    id: 6,
    name: "Oscar",
    species: "cat",
    breed: "Domestic shorthair",
    age: 1,
    gender: "male",
    size: "small",
    location: "Sarajevo",
    description: "Pure kitten energy. Oscar has never met a cardboard box he did not love.",
    image: "images/pet-6.jpg",
    vaccinated: true,
    status: "available"
  }
];
module.exports = pets;
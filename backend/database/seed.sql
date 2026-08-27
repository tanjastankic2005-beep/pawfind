USE pawfind;

INSERT INTO pets
  (name, species, breed, age, gender, size, location, description, image,
   personality, vaccinated, neutered, good_with_kids, good_with_dogs, good_with_cats, status)
VALUES
  ('Luna', 'dog', 'Border Collie mix', 2, 'female', 'medium', 'Banja Luka',
   'Gentle, smart and endlessly curious. Luna loves long walks and learns tricks in minutes.',
   'images/pet-1.jpg', 'friendly', TRUE, TRUE, TRUE, TRUE, FALSE, 'available'),

  ('Max', 'dog', 'Labrador mix', 5, 'male', 'large', 'Sarajevo',
   'A calm big guy who has been waiting far too long. Great with children.',
   'images/pet-2.jpg', 'calm', TRUE, TRUE, TRUE, TRUE, TRUE, 'available'),

  ('Mia', 'cat', 'Domestic shorthair', 1, 'female', 'small', 'Banja Luka',
   'Playful and talkative. Mia will supervise everything you do, closely.',
   'images/pet-3.jpg', 'playful', TRUE, FALSE, TRUE, FALSE, TRUE, 'available'),

  ('Rex', 'dog', 'German Shepherd mix', 7, 'male', 'large', 'Tuzla',
   'A senior with a soft heart. Rex asks for little: a warm bed and a slow walk.',
   'images/pet-4.jpg', 'calm', TRUE, TRUE, TRUE, FALSE, FALSE, 'available'),

  ('Nala', 'cat', 'Tabby', 3, 'female', 'small', 'Mostar',
   'Independent but affectionate on her own terms. Loves sunny windowsills.',
   'images/pet-5.jpg', 'affectionate', FALSE, TRUE, TRUE, FALSE, TRUE, 'available'),

  ('Oscar', 'cat', 'Domestic shorthair', 1, 'male', 'small', 'Sarajevo',
   'Pure kitten energy. Oscar has never met a cardboard box he did not love.',
   'images/pet-6.jpg', 'energetic', TRUE, FALSE, TRUE, TRUE, TRUE, 'available');
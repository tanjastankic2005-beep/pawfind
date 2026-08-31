USE pawfind;

INSERT INTO pets
  (name, species, breed, age, gender, size, location, description, description_sr, image,
   personality, vaccinated, neutered, good_with_kids, good_with_dogs, good_with_cats, status)
VALUES
  ('Luna', 'dog', 'Border Collie mix', 2, 'female', 'medium', 'Banja Luka',
   'Gentle, smart and endlessly curious. Luna loves long walks and learns tricks in minutes.',
   'Nježna, pametna i beskrajno radoznala. Luna voli duge šetnje i trikove uči za minut.',
   'images/pet-1.jpg', 'friendly', TRUE, TRUE, TRUE, TRUE, FALSE, 'available'),

  ('Max', 'dog', 'Labrador mix', 5, 'male', 'large', 'Sarajevo',
   'A calm big guy who has been waiting far too long. Great with children.',
   'Miran krupni momak koji je predugo čekao. Odličan sa djecom.',
   'images/pet-2.jpg', 'calm', TRUE, TRUE, TRUE, TRUE, TRUE, 'available'),

  ('Mia', 'cat', 'Domestic shorthair', 1, 'female', 'small', 'Banja Luka',
   'Playful and talkative. Mia will supervise everything you do, closely.',
   'Razigrana i pričljiva. Mia će pažljivo nadgledati sve što radite.',
   'images/pet-4.jpg', 'playful', TRUE, FALSE, TRUE, FALSE, TRUE, 'available'),

  ('Rex', 'dog', 'Mixed breed', 1, 'male', 'small', 'Tuzla',
   'A small, playful pup still full of puppy energy. Rex loves to explore and is eager to learn.',
   'Mali, razigrani štenac još uvijek pun energije. Rex voli da istražuje i željan je učenja.',
   'images/pet-3.jpg', 'calm', TRUE, TRUE, TRUE, FALSE, FALSE, 'available'),

  ('Nala', 'cat', 'Tabby', 3, 'female', 'small', 'Mostar',
   'Independent but affectionate on her own terms. Loves sunny windowsills.',
   'Samostalna, ali nježna na svoj način. Voli sunčane prozore.',
   'images/pet-5.jpg', 'affectionate', FALSE, TRUE, TRUE, FALSE, TRUE, 'available'),

  ('Oscar', 'cat', 'Domestic shorthair', 1, 'male', 'small', 'Sarajevo',
   'Pure kitten energy. Oscar has never met a cardboard box he did not love.',
   'Čista mačja energija. Oscar nikad nije sreo karton koji nije zavolio.',
   'images/pet-6.jpg', 'energetic', TRUE, FALSE, TRUE, TRUE, TRUE, 'available');

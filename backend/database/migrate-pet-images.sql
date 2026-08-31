USE pawfind;

-- Dodaje podršku za više slika po ljubimcu (pokreni ovo ako baza već postoji).
CREATE TABLE IF NOT EXISTS pet_images (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  pet_id     INT NOT NULL,
  image      VARCHAR(255) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- Prebacuje postojeću sliku svakog ljubimca u novu tabelu, kao naslovnu sliku.
INSERT INTO pet_images (pet_id, image, sort_order)
SELECT id, image, 0 FROM pets
WHERE image IS NOT NULL
  AND id NOT IN (SELECT pet_id FROM pet_images);

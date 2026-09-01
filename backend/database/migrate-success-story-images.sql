USE pawfind;

-- Dodaje tabelu za slajd (više slika) u sekciji "success story" na početnoj
-- (pokreni ako baza već postoji).
CREATE TABLE IF NOT EXISTS success_story_images (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  image      VARCHAR(255) NOT NULL UNIQUE,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Ako je ranije bila izabrana jedna slika za ovu sekciju, prebaci je u slajd.
INSERT IGNORE INTO success_story_images (image, sort_order)
SELECT setting_value, 0 FROM settings WHERE setting_key = 'success_story_image';

DELETE FROM settings WHERE setting_key = 'success_story_image';

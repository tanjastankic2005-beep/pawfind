USE pawfind;

-- Prebacuje sekciju "success story" sa jedne priče (više slika, jedan natpis)
-- na više nezavisnih priča koje se mogu listati na početnoj stranici.

CREATE TABLE IF NOT EXISTS success_stories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  text       VARCHAR(255) NOT NULL,
  text_sr    VARCHAR(255),
  sort_order INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Ako success_story_images već postoji u starijem obliku (bez story_id), dodaj kolonu.
-- Bezopasno je pokrenuti i ako kolona već postoji — MySQL će samo prijaviti grešku.
ALTER TABLE success_story_images ADD COLUMN story_id INT NULL AFTER id;

-- Ako ima slika bez priče (stariji oblik), spoji ih u jednu priču koristeći stari natpis.
INSERT INTO success_stories (text, text_sr, sort_order)
SELECT
  COALESCE((SELECT setting_value FROM settings WHERE setting_key = 'success_story_text'), 'They found their new home! 🏡'),
  (SELECT setting_value FROM settings WHERE setting_key = 'success_story_text_sr'),
  0
WHERE EXISTS (SELECT 1 FROM success_story_images WHERE story_id IS NULL);

UPDATE success_story_images
SET story_id = (SELECT id FROM success_stories ORDER BY id DESC LIMIT 1)
WHERE story_id IS NULL;

DELETE FROM settings WHERE setting_key IN ('success_story_text', 'success_story_text_sr', 'success_story_image');

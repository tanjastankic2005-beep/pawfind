USE pawfind;

-- Dodaje tabelu za opšta podešavanja sajta, npr. sliku na početnoj stranici
-- (pokreni ako baza već postoji).
CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(50)  PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('hero_image', 'images/hero.jpg');

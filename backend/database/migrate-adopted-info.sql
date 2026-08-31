USE pawfind;

-- Dodaje kolone za datum udomljavanja i ime udomitelja (pokreni ako baza već postoji).
-- Ako kolone već postoje, MySQL će prijaviti grešku "Duplicate column name" — to je bezopasno.
ALTER TABLE pets ADD COLUMN adopted_at TIMESTAMP NULL AFTER status;
ALTER TABLE pets ADD COLUMN adopted_by VARCHAR(150) AFTER adopted_at;

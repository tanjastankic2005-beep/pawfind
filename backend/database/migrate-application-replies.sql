USE pawfind;

-- Dodaje kolone za admin odgovor na prijavu za udomljavanje (pokreni ako baza već postoji).
-- Ako kolone već postoje, MySQL će prijaviti grešku "Duplicate column name" — to je bezopasno.
ALTER TABLE applications ADD COLUMN reply TEXT AFTER preferred_contact;
ALTER TABLE applications ADD COLUMN replied_at TIMESTAMP NULL AFTER reply;

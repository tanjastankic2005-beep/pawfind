USE pawfind;

-- Dodaje kolone za admin odgovor na kontakt poruku (pokreni ako baza već postoji).
-- Ako kolone već postoje, MySQL će prijaviti grešku "Duplicate column name" — to je bezopasno.
ALTER TABLE messages ADD COLUMN reply TEXT AFTER message;
ALTER TABLE messages ADD COLUMN replied_at TIMESTAMP NULL AFTER reply;

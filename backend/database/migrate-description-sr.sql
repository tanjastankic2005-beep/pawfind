USE pawfind;

-- Dodaje kolonu za srpski opis ljubimca (pokreni ako baza već postoji).
-- Ako kolona već postoji, MySQL će prijaviti grešku "Duplicate column name" — to je bezopasno, samo znači da je migracija već pokrenuta.
ALTER TABLE pets ADD COLUMN description_sr TEXT AFTER description;

-- Srpski prevod opisa za ljubimce iz seed.sql (bezopasno za pokretanje i ako ih nema).
UPDATE pets SET description_sr = 'Nježna, pametna i beskrajno radoznala. Luna voli duge šetnje i trikove uči za minut.' WHERE name = 'Luna' AND description_sr IS NULL;
UPDATE pets SET description_sr = 'Miran krupni momak koji je predugo čekao. Odličan sa djecom.' WHERE name = 'Max' AND description_sr IS NULL;
UPDATE pets SET description_sr = 'Razigrana i pričljiva. Mia će pažljivo nadgledati sve što radite.' WHERE name = 'Mia' AND description_sr IS NULL;
UPDATE pets SET description_sr = 'Mali, razigrani štenac još uvijek pun energije. Rex voli da istražuje i željan je učenja.' WHERE name = 'Rex' AND description_sr IS NULL;
UPDATE pets SET description_sr = 'Samostalna, ali nježna na svoj način. Voli sunčane prozore.' WHERE name = 'Nala' AND description_sr IS NULL;
UPDATE pets SET description_sr = 'Čista mačja energija. Oscar nikad nije sreo karton koji nije zavolio.' WHERE name = 'Oscar' AND description_sr IS NULL;

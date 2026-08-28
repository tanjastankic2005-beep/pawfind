USE pawfind;

-- Popravlja pobrkane slike: Mia (mačka) je imala sliku štenceta, Rex (pas) sliku mačke.
UPDATE pets SET image = 'images/pet-4.jpg' WHERE name = 'Mia';
UPDATE pets SET image = 'images/pet-3.jpg' WHERE name = 'Rex';

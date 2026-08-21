-- Оборудование на результате. Для существующей БД: npm run db:migrate

ALTER TABLE result ADD COLUMN swimfin INTEGER NOT NULL DEFAULT 0 CHECK (swimfin IN (0, 1));
ALTER TABLE result ADD COLUMN hand_paddle INTEGER NOT NULL DEFAULT 0 CHECK (hand_paddle IN (0, 1));
ALTER TABLE result ADD COLUMN pull_buoy INTEGER NOT NULL DEFAULT 0 CHECK (pull_buoy IN (0, 1));
ALTER TABLE result ADD COLUMN board INTEGER NOT NULL DEFAULT 0 CHECK (board IN (0, 1));
ALTER TABLE result ADD COLUMN wetsuit INTEGER NOT NULL DEFAULT 0 CHECK (wetsuit IN (0, 1));

-- CREATE USER cosmin2 WITH ENCRYPTED PASSWORD 'cosmin2';
-- GRANT ALL PRIVILEGES ON DATABASE cti TO cosmin2;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cosmin2;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cosmin2;
-- GRANT ALL PRIVILEGES ON ALL ENUM IN SCHEMA public to cosmin2;

DROP TYPE IF EXISTS tip_categorie CASCADE;

CREATE TYPE tip_categorie AS ENUM (
    'Jocuri de societate', 
    'Jucarii', 
    'Hobby', 
    'Educativ', 
    'Resigilate'
);

DROP TABLE IF EXISTS produse CASCADE;
DROP TABLE IF EXISTS subcategorii CASCADE;
DROP TABLE IF EXISTS grupe_varsta CASCADE;
DROP TABLE IF EXISTS limbi CASCADE;

CREATE TABLE limbi (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(50) NOT NULL
);


CREATE TABLE grupe_varsta (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    descriere VARCHAR(255)
);

CREATE TABLE subcategorii (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    categorie_parinte tip_categorie NOT NULL
);

CREATE TABLE produse (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(255) NOT NULL,
    descriere TEXT NOT NULL,
    imagine VARCHAR(255) NOT NULL,
    categorie_mare tip_categorie NOT NULL,
    
    subcategorie_id INTEGER REFERENCES subcategorii(id),
    grupa_varsta_id INTEGER REFERENCES grupe_varsta(id),
    limba_id INTEGER REFERENCES limbi(id),
    
    pret DECIMAL(10, 2) NOT NULL,
    durata_minute INTEGER NOT NULL, -- 
    data_adaugare DATE NOT NULL,
    culoare_dominanta VARCHAR(50) NOT NULL, -- 
    componente VARCHAR(255) NOT NULL, -- 
    admite_voucher BOOLEAN NOT NULL
);

INSERT INTO limbi (nume) VALUES ('Română'), ('Engleză'), ('Independent lingvistic');

INSERT INTO grupe_varsta (nume, descriere) VALUES 
('Bebeluși (0-1 ani)', 'Jucării sigure, fără piese mici'),
('Copii mici (1-3 ani)', 'Dezvoltare motorie și cognitivă'),
('Preșcolari (4-6 ani)', 'Învățare prin joacă'),
('Școlari (7-12 ani)', 'Jocuri educative și de strategie ușoară'),
('Adolescenți și Adulți (13+)', 'Strategie complexă, hobby și petrecere');

INSERT INTO subcategorii (nume, categorie_parinte) VALUES 
('Strategie', 'Jocuri de societate'),
('Petrecere', 'Jocuri de societate'),
('Plușuri', 'Jucarii'),
('Construcție', 'Jucarii'),
('Puzzle', 'Hobby'),
('Machete', 'Hobby'),
('Știință și Experimente', 'Educativ'),
('Cutii deteriorate', 'Resigilate');

INSERT INTO produse (nume, descriere, imagine, categorie_mare, subcategorie_id, grupa_varsta_id, limba_id, pret, durata_minute, data_adaugare, culoare_dominanta, componente, admite_voucher) VALUES 
('Catan - Jocul de Baza', 'Joc clasic de negociere și strategie.', '/imagini/produse/catan.jpg', 'Jocuri de societate', 1, 5, 1, 189.99, 90, '2023-01-15', 'Albastru', 'tabla, carti, zaruri, pioni, cartonase', true),
('Activity Original', 'Mimează și desenează.', '/imagini/produse/activity.jpg', 'Jocuri de societate', 2, 5, 1, 120.00, 60, '2023-02-20', 'Verde', 'carti, tabla, pioni, clepsidra', false),
('Ticket to Ride', 'Construiește rețele de trenuri.', '/imagini/produse/ticket.jpg', 'Jocuri de societate', 1, 4, 2, 210.50, 45, '2023-05-10', 'Rosu', 'tabla, vagoane, carti', true),
('Dixit', 'Asocieri de cuvinte și ilustrații.', '/imagini/produse/dixit.jpg', 'Jocuri de societate', 2, 4, 3, 145.00, 30, '2023-11-05', 'Multicolor', 'carti, pioni, tabla', false),
('Urs de plus gigant', 'Ursuleț moale.', '/imagini/produse/urs.jpg', 'Jucarii', 3, 1, 3, 150.00, 0, '2022-12-10', 'Maro', 'plus', false),
('Masinuta teleghidata', 'Off-road cu telecomandă.', '/imagini/produse/masina.jpg', 'Jucarii', 4, 4, 3, 85.99, 20, '2024-03-12', 'Rosu', 'masinuta, telecomanda, acumulator', true),
('Set cuburi lemn', 'Piese pentru construit.', '/imagini/produse/cuburi.jpg', 'Jucarii', 4, 2, 3, 65.00, 0, '2023-08-25', 'Maro', 'cuburi, figurine, indicatoare', true),
('Puzzle 1000 piese', 'Castel medieval noaptea.', '/imagini/produse/puzzle.jpg', 'Hobby', 5, 5, 3, 55.00, 300, '2023-04-18', 'Albastru', 'piese carton', false),
('Macheta Avion', 'Se asamblează fără lipici.', '/imagini/produse/avion.jpg', 'Hobby', 6, 5, 2, 110.00, 180, '2023-09-30', 'Verde', 'piese plastic, instructiuni', true),
('Telescop incepatori', 'Pentru observarea lunii.', '/imagini/produse/telescop.jpg', 'Educativ', 7, 4, 1, 250.00, 0, '2023-06-01', 'Multicolor', 'telescop, trepied, lentile', true),
('Kit chimie', 'Experimente sigure.', '/imagini/produse/chimie.jpg', 'Educativ', 7, 4, 1, 130.00, 45, '2023-10-22', 'Verde', 'eprubete, substante, ochelari', false),
('Catan Resigilat', 'Cutie lovita.', '/imagini/produse/catan.jpg', 'Resigilate', 8, 5, 1, 140.00, 90, '2024-05-01', 'Albastru', 'tabla, carti, zaruri, pioni', false),
('Activity Junior', 'Versiune pentru cei mici.', '/imagini/produse/act_jr.jpg', 'Jocuri de societate', 2, 4, 1, 99.00, 45, '2024-01-10', 'Albastru', 'carti, pioni, tabla', false),
('Lego Orasul', 'Piese de constructie.', '/imagini/produse/lego.jpg', 'Jucarii', 4, 3, 3, 300.00, 120, '2024-02-15', 'Multicolor', 'piese plastic, manual', true),
('Vopsele acrilice', 'Set de 24 culori.', '/imagini/produse/vopsele.jpg', 'Hobby', 5, 5, 3, 75.00, 0, '2024-03-20', 'Multicolor', 'tuburi vopsea, pensule', false),
('Microscop copii', 'Include lamele pregatite.', '/imagini/produse/microscop.jpg', 'Educativ', 7, 4, 1, 180.00, 0, '2024-04-10', 'Negru', 'microscop, lamele, penseta', true);
-- =========================================================
-- SEED — FASE 3: categorías de insumos y unidades de medida
-- =========================================================

insert into supply_categories (name) values
    ('Alcohol'),
    ('Esencias'),
    ('Fijadores'),
    ('Colorantes'),
    ('Envases'),
    ('Atomizadores'),
    ('Tapas'),
    ('Cajas'),
    ('Etiquetas'),
    ('Cintas'),
    ('Bolsas'),
    ('Frascos');

insert into units_of_measure (name, abbreviation) values
    ('Mililitro', 'ml'),
    ('Litro', 'l'),
    ('Gramo', 'g'),
    ('Kilogramo', 'kg'),
    ('Unidad', 'u');

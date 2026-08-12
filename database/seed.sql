-- Sample catalog data for Lustre Homeware

INSERT INTO Categories (Name, Slug, Description) VALUES
('Lighting', 'lighting', 'Table, floor and pendant lighting in brass, glass and ceramic'),
('Vases & Bowls', 'vases-bowls', 'Hand-thrown ceramics and blown glass vessels'),
('Textiles', 'textiles', 'Linen throws, cushions and table runners'),
('Tableware', 'tableware', 'Stoneware and porcelain for everyday and entertaining');

INSERT INTO Products (CategoryId, Sku, Name, Slug, Description, Price, Currency, Material, ImageUrl, StockQuantity) VALUES
(1, 'LST-LMP-001', 'Aurelia Brass Table Lamp', 'aurelia-brass-table-lamp', 'A softly curved brushed-brass lamp with a linen shade, cast to catch the light at any hour.', 189.00, 'USD', 'Brushed brass, linen', '/images/aurelia-lamp.jpg', 24),
(1, 'LST-LMP-002', 'Solene Glass Pendant', 'solene-glass-pendant', 'Hand-blown amber glass pendant with a warm, honeyed glow.', 145.00, 'USD', 'Blown glass, brass fittings', '/images/solene-pendant.jpg', 15),
(2, 'LST-VSE-001', 'Marne Stoneware Vase', 'marne-stoneware-vase', 'A tall, hand-thrown vase glazed in a warm oatmeal tone with subtle throwing rings.', 68.00, 'USD', 'Stoneware', '/images/marne-vase.jpg', 40),
(2, 'LST-BWL-001', 'Fen Ceramic Bowl Set', 'fen-ceramic-bowl-set', 'Set of three nesting bowls with a soft matte glaze, ideal for everyday serving.', 92.00, 'USD', 'Ceramic', '/images/fen-bowls.jpg', 30),
(3, 'LST-THR-001', 'Aldern Linen Throw', 'aldern-linen-throw', 'Pre-washed heavyweight linen throw with a relaxed drape and frayed edge finish.', 118.00, 'USD', '100% linen', '/images/aldern-throw.jpg', 50),
(4, 'LST-PLT-001', 'Rivage Dinner Plate Set', 'rivage-dinner-plate-set', 'Set of four porcelain dinner plates with a hand-painted rim in soft bronze.', 156.00, 'USD', 'Porcelain', '/images/rivage-plates.jpg', 20);

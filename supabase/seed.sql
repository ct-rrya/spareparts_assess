-- seed data for spare parts (3 categories, 12 products, 2 sample orders)
-- includes 1 active zero-stock product (SP-02.3) and 1 inactive product (SP-03.4)

insert into categories (code, name, slug, description) values
  ('01', 'Anatomy & Physiology', 'anatomy-physiology', 'Scale anatomical models and dissection study aids for classroom and lab reference.'),
  ('02', 'Lab Essentials', 'lab-essentials', 'Borosilicate glassware, measuring cylinders, racks, and precision pipettes.'),
  ('03', 'Specimens & Study Tools', 'specimens-study-tools', 'Prepared microscope slides, petri dishes, optical kits, and specimen containers.')
on conflict (slug) do nothing;

insert into products (specimen_code, name, slug, category_id, description, price, stock, image_url, is_active, is_featured)
select
  v.specimen_code,
  v.name,
  v.slug,
  c.id,
  v.description,
  v.price,
  v.stock,
  v.image_url,
  v.is_active,
  v.is_featured
from (
  values
    ('SP-01.1', 'Human Skeleton Model', 'human-skeleton-model', 'anatomy-physiology', 'Full-scale 170cm articulated PVC human skeleton model on a rolling 5-caster stand with removable skull cap and articulated jaw.', 4850.00, 6, '/images/products/human-skeleton-model.jpg', true, true),
    ('SP-01.2', 'Removable Heart Model', 'removable-heart-model', 'anatomy-physiology', '2x life-size 2-part anatomical heart model showing chambers, valves, coronary vessels, and aortic arch on a display base.', 1650.00, 12, '/images/products/removable-heart-model.jpg', true, true),
    ('SP-01.3', 'Brain Anatomy Model', 'brain-anatomy-model', 'anatomy-physiology', '8-part life-size human brain model with color-coded functional regions, cerebellum, and brainstem.', 1980.00, 8, '/images/products/brain-anatomy-model.jpg', true, true),
    ('SP-01.4', 'Human Torso Model', 'human-torso-model', 'anatomy-physiology', 'Half-size 15-part unisex human torso model with removable lungs, heart, liver, stomach, and intestines.', 3200.00, 5, '/images/products/human-torso-model.jpg', true, true),
    ('SP-02.1', 'Borosilicate Beaker Set', 'borosilicate-beaker-set', 'lab-essentials', '5-piece heavy-wall 3.3 borosilicate glass beaker set (50ml, 100ml, 250ml, 500ml, 1000ml) with printed graduations.', 1250.00, 18, '/images/products/borosilicate-beaker-set.jpg', true, true),
    ('SP-02.2', 'Graduated Cylinder', 'graduated-cylinder', 'lab-essentials', 'Class A 250ml borosilicate glass graduated cylinder with hexagonal base and pouring spout.', 480.00, 24, '/images/products/graduated-cylinder.jpg', true, true),
    ('SP-02.3', 'Test Tube Rack', 'test-tube-rack', 'lab-essentials', '24-well autoclavable polypropylene and stainless test tube rack for 16mm–20mm tubes. Currently awaiting restock.', 360.00, 0, '/images/products/test-tube-rack.jpg', true, true),
    ('SP-02.4', 'Laboratory Pipette Set', 'laboratory-pipette-set', 'lab-essentials', 'Variable volume micropipette (100-1000uL) with calibration certificate and sterile tip box.', 2450.00, 9, '/images/products/laboratory-pipette-set.jpg', true, true),
    ('SP-03.1', 'Prepared Microscope Slides', 'prepared-microscope-slides', 'specimens-study-tools', '25-piece prepared glass slide set covering plant histology, mitosis, and mammalian tissues in a wooden case.', 890.00, 15, '/images/products/prepared-microscope-slides.jpg', true, true),
    ('SP-03.2', 'Petri Dish Set', 'petri-dish-set', 'specimens-study-tools', 'Pack of 20 sterile 90mm x 15mm optically clear polystyrene petri dishes with vented lids.', 320.00, 30, '/images/products/petri-dish-set.jpg', true, true),
    ('SP-03.3', 'Microscope Accessory Kit', 'microscope-accessory-kit', 'specimens-study-tools', 'Complete optical maintenance and prep kit with lens tissue, immersion oil, cover slips, and stainless forceps.', 640.00, 11, '/images/products/microscope-accessory-kit.jpg', true, true),
    ('SP-03.4', 'Specimen Storage Jars', 'specimen-storage-jars', 'specimens-study-tools', 'Set of 6 wide-mouth 500ml amber glass specimen jars with chemical-resistant PTFE-lined caps (discontinued batch).', 750.00, 4, '/images/products/specimen-storage-jars.jpg', false, false)
) as v(specimen_code, name, slug, cat_slug, description, price, stock, image_url, is_active, is_featured)
join categories c on c.slug = v.cat_slug
on conflict (specimen_code) do nothing;

-- sample orders so admin dashboard has initial data on first load
insert into orders (order_number, customer_name, customer_email, contact_number, delivery_address, payment_method, order_notes, status, subtotal, total)
values
  ('ORD-0001', 'Elena Santos', 'elena.santos@example.com', '+63 917 555 0101', '42 Katipunan Ave, Quezon City, Metro Manila', 'Cash on Delivery', 'Deliver to science dept receiving desk', 'Completed', 2900.00, 2900.00),
  ('ORD-0002', 'Marco Reyes', 'marco.reyes@example.com', '+63 918 555 0202', '18 Taft Ave, Malate, Manila', 'E-Wallet', 'Call upon arrival', 'Pending', 1210.00, 1210.00)
on conflict (order_number) do nothing;

insert into order_items (order_id, product_id, product_name_snapshot, specimen_code_snapshot, unit_price_snapshot, quantity, line_total)
select o.id, p.id, p.name, p.specimen_code, p.price, 1, p.price
from orders o
join products p on p.specimen_code = 'SP-01.2'
where o.order_number = 'ORD-0001'
and not exists (select 1 from order_items oi where oi.order_id = o.id and oi.product_id = p.id);

insert into order_items (order_id, product_id, product_name_snapshot, specimen_code_snapshot, unit_price_snapshot, quantity, line_total)
select o.id, p.id, p.name, p.specimen_code, p.price, 1, p.price
from orders o
join products p on p.specimen_code = 'SP-02.1'
where o.order_number = 'ORD-0001'
and not exists (select 1 from order_items oi where oi.order_id = o.id and oi.product_id = p.id);

insert into order_items (order_id, product_id, product_name_snapshot, specimen_code_snapshot, unit_price_snapshot, quantity, line_total)
select o.id, p.id, p.name, p.specimen_code, p.price, 1, p.price
from orders o
join products p on p.specimen_code = 'SP-03.1'
where o.order_number = 'ORD-0002'
and not exists (select 1 from order_items oi where oi.order_id = o.id and oi.product_id = p.id);

insert into order_items (order_id, product_id, product_name_snapshot, specimen_code_snapshot, unit_price_snapshot, quantity, line_total)
select o.id, p.id, p.name, p.specimen_code, p.price, 1, p.price
from orders o
join products p on p.specimen_code = 'SP-03.2'
where o.order_number = 'ORD-0002'
and not exists (select 1 from order_items oi where oi.order_id = o.id and oi.product_id = p.id);

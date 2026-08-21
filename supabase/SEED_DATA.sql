-- ============================================================================
-- NITRAM LOGISTICS - SEED DATA
-- Run this AFTER running FIX_DATABASE.sql and creating the admin user
-- ============================================================================

-- ============================================================================
-- CUSTOMERS
-- ============================================================================
INSERT INTO customers (company_name, contact_person, email, phone, country, address, status, created_by)
SELECT 
  'Mining Group Co.',
  'John Banda',
  'john@mininggroup.co.zm',
  '+260 976 123 456',
  'Zambia',
  'Kitwe, Copperbelt',
  'active',
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

INSERT INTO customers (company_name, contact_person, email, phone, country, address, status, created_by)
SELECT 
  'Manufacturing Ltd',
  'Grace Mwansa',
  'grace@manufacturing.co.zm',
  '+260 977 234 567',
  'Zambia',
  'Lusaka',
  'active',
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

INSERT INTO customers (company_name, contact_person, email, phone, country, address, status, created_by)
SELECT 
  'AgriExport Zambia',
  'Peter Tembo',
  'peter@agriexport.co.zm',
  '+260 978 345 678',
  'Zambia',
  'Ndola',
  'prospect',
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LEADS
-- ============================================================================
INSERT INTO leads (contact_name, email, phone, company_name, service_needed, status, score, approved, source, notes, created_by)
SELECT 
  'Sarah Phiri',
  'sarah@newcompany.co.zm',
  '+260 961 111 222',
  'New Company Ltd',
  'Customs Clearing',
  'new',
  85,
  true,
  'Website Assessment',
  'High-value prospect from mining sector. Needs urgent clearance.',
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

INSERT INTO leads (contact_name, email, phone, company_name, service_needed, status, score, approved, source, notes, created_by)
SELECT 
  'James Mulenga',
  'james@logisticspartner.co.zm',
  '+260 962 222 333',
  'Logistics Partner',
  'Transit Cargo Management',
  'qualified',
  72,
  true,
  'Referral',
  'Referred by existing client. Interested in RIT procedures.',
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

INSERT INTO leads (contact_name, email, phone, company_name, service_needed, status, score, approved, source, notes, created_by)
SELECT 
  'Mary Sakala',
  'mary@exportfirm.co.zm',
  '+260 963 333 444',
  'Export Firm Zambia',
  'Export Management',
  'quote_sent',
  90,
  true,
  'Website Assessment',
  'Awaiting quote response. Follow up scheduled.',
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

INSERT INTO leads (contact_name, email, phone, company_name, service_needed, status, score, approved, source, notes, created_by)
SELECT 
  'David Chanda',
  'david@trucking.co.zm',
  '+260 964 444 555',
  'Fast Trucking',
  'Trucking Services',
  'contacted',
  65,
  false,
  'LinkedIn',
  'Initial contact made. Needs follow-up call.',
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

INSERT INTO leads (contact_name, email, phone, company_name, service_needed, status, score, approved, source, notes, created_by)
SELECT 
  'Grace Bwalya',
  'grace@constructionzm.co.zm',
  '+260 965 555 666',
  'Construction ZM',
  'Customs Clearing',
  'won',
  95,
  true,
  'Referral',
  'Converted to customer. Large account.',
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- QUOTES
-- ============================================================================
INSERT INTO quotes (quote_number, customer_id, lead_id, service_type, origin, destination, cargo_description, estimated_cost, currency, status, approved, created_by)
SELECT 
  'Q2601001',
  c.id,
  l.id,
  'Customs Clearing',
  'Durban, South Africa',
  'Lusaka, Zambia',
  'General cargo - electronics and machinery parts',
  15000,
  'ZMW',
  'submitted',
  false,
  p.id
FROM profiles p
JOIN customers c ON c.created_by = p.id AND c.email = 'john@mininggroup.co.zm'
JOIN leads l ON l.created_by = p.id AND l.email = 'sarah@newcompany.co.zm'
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT (quote_number) DO NOTHING;

INSERT INTO quotes (quote_number, customer_id, lead_id, service_type, origin, destination, cargo_description, estimated_cost, currency, status, approved, created_by)
SELECT 
  'Q2601002',
  c.id,
  l.id,
  'Transit Cargo Management',
  'Dar es Salaam, Tanzania',
  'Lusaka, Zambia',
  'Transit cargo - mining equipment',
  45000,
  'ZMW',
  'review',
  false,
  p.id
FROM profiles p
JOIN customers c ON c.created_by = p.id AND c.email = 'grace@manufacturing.co.zm'
JOIN leads l ON l.created_by = p.id AND l.email = 'james@logisticspartner.co.zm'
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT (quote_number) DO NOTHING;

INSERT INTO quotes (quote_number, customer_id, lead_id, service_type, origin, destination, cargo_description, estimated_cost, currency, status, approved, created_by)
SELECT 
  'Q2601003',
  c.id,
  l.id,
  'Export Management',
  'Lusaka, Zambia',
  'Gaborone, Botswana',
  'Agricultural exports - maize and copper cathodes',
  28000,
  'ZMW',
  'approved',
  true,
  p.id
FROM profiles p
JOIN customers c ON c.created_by = p.id AND c.email = 'peter@agriexport.co.zm'
JOIN leads l ON l.created_by = p.id AND l.email = 'mary@exportfirm.co.zm'
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT (quote_number) DO NOTHING;

-- ============================================================================
-- SHIPMENTS FOR APPROVED QUOTES
-- ============================================================================
INSERT INTO shipments (shipment_number, customer_id, quote_id, origin, destination, current_location, cargo_description, status, eta, created_by)
SELECT 
  'S2601003',
  c.id,
  q.id,
  'Lusaka, Zambia',
  'Gaborone, Botswana',
  'Waiting for collection',
  'Agricultural exports - maize and copper cathodes',
  'awaiting_collection',
  '2026-08-25',
  p.id
FROM profiles p
JOIN customers c ON c.created_by = p.id AND c.email = 'peter@agriexport.co.zm'
JOIN quotes q ON q.created_by = p.id AND q.quote_number = 'Q2601003'
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT (shipment_number) DO NOTHING;

-- ============================================================================
-- SHIPMENTS
-- ============================================================================
INSERT INTO shipments (shipment_number, customer_id, quote_id, origin, destination, current_location, cargo_description, status, eta, created_by)
SELECT 
  'S2601001',
  c.id,
  q.id,
  'Durban, South Africa',
  'Lusaka, Zambia',
  'Chirundu Border Post',
  'General cargo - electronics and machinery parts',
  'in_transit',
  '2026-08-20',
  p.id
FROM profiles p
JOIN customers c ON c.created_by = p.id AND c.email = 'john@mininggroup.co.zm'
JOIN quotes q ON q.created_by = p.id AND q.quote_number = 'Q2601001'
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT (shipment_number) DO NOTHING;

INSERT INTO shipments (shipment_number, customer_id, quote_id, origin, destination, current_location, cargo_description, status, eta, created_by)
SELECT 
  'S2601002',
  c.id,
  q.id,
  'Dar es Salaam, Tanzania',
  'Lusaka, Zambia',
  'Nakonde Border Post',
  'Transit cargo - mining equipment',
  'border_processing',
  '2026-08-22',
  p.id
FROM profiles p
JOIN customers c ON c.created_by = p.id AND c.email = 'grace@manufacturing.co.zm'
JOIN quotes q ON q.created_by = p.id AND q.quote_number = 'Q2601002'
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT (shipment_number) DO NOTHING;

-- ============================================================================
-- BLOG POSTS
-- ============================================================================
INSERT INTO blog_posts (title, slug, excerpt, content, status, published, view_count, created_by)
SELECT 
  'Understanding ZRA Customs Procedures in 2025',
  'understanding-zra-customs-procedures-2025',
  'A comprehensive guide to navigating Zambia Revenue Authority customs procedures for importers and exporters.',
  '<p>Customs clearance in Zambia requires careful preparation and understanding of ZRA regulations. This guide covers the essential steps for smooth clearance.</p><h2>Key Requirements</h2><p>Proper documentation is the foundation of successful customs clearance. Ensure all invoices, packing lists, and bills of lading are accurate and complete.</p>',
  'published',
  true,
  245,
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (title, slug, excerpt, content, status, published, view_count, created_by)
SELECT 
  'SADC Trade Corridors: A Practical Overview',
  'sadc-trade-corridors-practical-overview',
  'Exploring the major trade corridors connecting Zambia to Southern African markets and what logistics professionals need to know.',
  '<p>The SADC region offers multiple trade corridors that connect Zambia to major markets. Understanding these routes is essential for efficient logistics planning.</p>',
  'published',
  true,
  189,
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================
INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
SELECT 
  p.id,
  'LEAD_CREATED',
  'lead',
  (SELECT id FROM leads WHERE email = 'sarah@newcompany.co.zm' LIMIT 1),
  '{"contact_name": "Sarah Phiri", "source": "Website Assessment"}'
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
SELECT 
  p.id,
  'QUOTE_CREATED',
  'quote',
  (SELECT id FROM quotes WHERE quote_number = 'Q2601001' LIMIT 1),
  '{"quote_number": "Q2601001", "service_type": "Customs Clearing"}'
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
SELECT 
  p.id,
  'SHIPMENT_CREATED',
  'shipment',
  (SELECT id FROM shipments WHERE shipment_number = 'S2601001' LIMIT 1),
  '{"shipment_number": "S2601001", "status": "in_transit"}'
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SETTINGS
-- ============================================================================
INSERT INTO settings (key, value, description, updated_by)
SELECT 
  'company_profile',
  '{"name": "Nitram Logistics Limited", "tagline": "Intelligent, Innovative, Customised Logistics", "phone": "+260 776 833 956", "email": "info@nitramclearing.co.zm", "address": "Lusaka, Zambia"}',
  'Company profile information',
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, description, updated_by)
SELECT 
  'email_settings',
  '{"assessment_email": "info@nitramclearing.co.zm", "from_email": "Nitram Assessments <noreply@nitramclearing.co.zm>"}',
  'Email configuration settings',
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- FAQS
-- ============================================================================
INSERT INTO faqs (question, answer, category, order_index, published, created_by)
SELECT 
  'What documents are needed for customs clearance?',
  'Typically a commercial invoice, packing list, bill of lading or airway bill, and any certificates of origin. We will guide you through the full list for your cargo type.',
  'Customs',
  1,
  true,
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

INSERT INTO faqs (question, answer, category, order_index, published, created_by)
SELECT 
  'Do you handle bonded transit through Zambia?',
  'Yes. We provide full transit cargo management with bond cover, escorts where required and corridor coordination across SADC.',
  'Transit',
  2,
  true,
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

INSERT INTO faqs (question, answer, category, order_index, published, created_by)
SELECT 
  'Which borders do you operate at?',
  'All major Zambian border posts including Chirundu, Kasumbalesa, Nakonde, Katima Mulilo, Mwami and Kazungula.',
  'Operations',
  3,
  true,
  p.id
FROM profiles p
WHERE p.email = 'admin@nitramclearing.co.zm'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TRACKING TOKENS
-- ============================================================================
INSERT INTO tracking_tokens (token, shipment_id, customer_id, current_step, status)
SELECT 
  'ABC12345',
  s.id,
  c.id,
  3,
  'active'
FROM shipments s
JOIN profiles p ON s.created_by = p.id
JOIN customers c ON c.id = s.customer_id
WHERE p.email = 'admin@nitramclearing.co.zm' AND s.shipment_number = 'S2601001'
ON CONFLICT (token) DO NOTHING;

INSERT INTO tracking_tokens (token, shipment_id, customer_id, current_step, status)
SELECT 
  'XYZ67890',
  s.id,
  c.id,
  5,
  'active'
FROM shipments s
JOIN profiles p ON s.created_by = p.id
JOIN customers c ON c.id = s.customer_id
WHERE p.email = 'admin@nitramclearing.co.zm' AND s.shipment_number = 'S2601002'
ON CONFLICT (token) DO NOTHING;

/* INSERT INTO tracking_tokens (token, shipment_id, current_step, status)
SELECT 
  s.id,
  c.id,
  5,
  'active'
FROM shipments s
JOIN customers c ON c.id = s.customer_id
WHERE p.email = 'admin@nitramclearing.co.zm' AND s.shipment_number = 'S2601003'
ON CONFLICT (token) DO NOTHING; */

INSERT INTO tracking_tokens (token, shipment_id, customer_id, current_step, status)
SELECT 
  'JKL01234',
  s.id,
  c.id,
  5,
  'active'
FROM shipments s
JOIN profiles p ON s.created_by = p.id
JOIN customers c ON c.id = s.customer_id
WHERE p.email = 'admin@nitramclearing.co.zm' AND s.shipment_number = 'S2601003'
ON CONFLICT (token) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these to verify seed data was created:
-- SELECT COUNT(*) FROM customers; -- should be 3
-- SELECT COUNT(*) FROM leads; -- should be 5
-- SELECT COUNT(*) FROM quotes; -- should be 3
-- SELECT COUNT(*) FROM shipments; -- should be 2
-- SELECT COUNT(*) FROM blog_posts; -- should be 2
-- SELECT COUNT(*) FROM activity_log; -- should be 3

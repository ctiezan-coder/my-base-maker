-- =============================================
-- EXPORT BASE DE DONNÉES CI EXPORT
-- Date: 2025-12-08
-- =============================================

-- Note: Cet export contient les données principales.
-- Pour un export complet, utilisez les requêtes SQL ci-dessous
-- dans votre outil de base de données.

-- =============================================
-- DIRECTIONS (11 enregistrements)
-- =============================================
INSERT INTO directions (id, name, description, icon_name, priority, volume_estimate, created_at) VALUES
('182895be-80f9-4c51-942b-fa9e4a12e797', 'Communication', 'Marketing & Média', 'Megaphone', 'Très élevé', '~500 Mo/mois', '2025-10-30 10:35:17.821133+00'),
('7d617f76-7d5d-4009-9b24-9f5bd1bd1781', 'Digitalisation', 'Transformation digitale', 'FileText', 'Très élevé', '~5,5 Go', '2025-10-30 10:35:17.821133+00'),
('652155d2-7267-4a2a-8e5a-71e24682a3c0', 'Dir Développement de la Compétitivité des Entreprises et du renforcement des capacités', 'Direction dédiée au renforcement des capacités et à l''amélioration de la compétitivité des PME', 'TrendingUp', 'Très élevé', NULL, '2025-11-05 10:41:20.428445+00'),
('7d8f8baa-e521-4186-863e-1144d657fc66', 'Dir Développement des marchés', 'Direction en charge de l''identification et du développement de nouveaux marchés à l''export', 'Globe', 'Très élevé', NULL, '2025-11-05 10:41:20.428445+00'),
('42597052-187d-4787-a892-2226b2958bff', 'Dir Intelligence Économique', 'Direction dédiée à la veille économique, l''analyse de marché et l''intelligence stratégique', 'Brain', 'Élevé', NULL, '2025-11-05 10:41:20.428445+00'),
('5ab7f631-9d2d-425d-bf38-756df1376d41', 'Dir Juridique', 'Direction en charge des aspects juridiques, conformité et accompagnement légal', 'Scale', 'Élevé', NULL, '2025-11-05 10:41:20.428445+00'),
('a0d86ae7-1742-47e7-86e5-44c085fda59b', 'Dir Partenariats et Mobilisation des Ressources', 'Direction en charge des partenariats stratégiques et de la mobilisation des ressources financières et techniques', 'Handshake', 'Élevé', NULL, '2025-11-05 10:41:20.428445+00'),
('56e22651-e7c3-41d6-97f9-33ed87b50d55', 'Direction Administrative et Financière', 'Direction en charge de la gestion administrative, financière et comptable de l''organisation', 'Calculator', 'Très élevé', NULL, '2025-11-19 12:14:41.427945+00'),
('a69a401e-8a3f-45da-8810-353f587c6aa3', 'Direction Générale', 'Direction Générale pour la coordination et le suivi stratégique', 'UserCog', 'Élevé', NULL, '2025-11-05 10:41:20.428445+00'),
('4ac19c9b-58dc-419b-9f85-f3b1e1a0e03c', 'Service Manifestations commerciales', 'Service en charge de l''organisation et participation aux événements et manifestations commerciales', 'Calendar', 'Élevé', NULL, '2025-11-05 10:41:20.428445+00'),
('8dad4f86-4e1c-488b-9f08-4585acd40beb', 'Suivi & Évaluation', 'Pilotage et analyse de performance', 'BarChart3', 'Élevé', NULL, '2025-10-30 10:35:17.821133+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- PARTNERSHIPS (10 enregistrements)
-- =============================================
INSERT INTO partnerships (id, partner_name, partner_type, description, status, direction_id, start_date, priority_level, contact_person, contact_email, contact_phone, created_at) VALUES
('217abe21-1a3a-492a-a9c0-17bf64145e43', 'Projet des Chaînes de valeur Compétitives pour l''Emploi et la Transformation économique (PCCET)', 'PROGRAMME', '', 'actif', 'a0d86ae7-1742-47e7-86e5-44c085fda59b', '2024-01-19', '1', '', '', '', '2025-11-19 15:06:20.846277+00'),
('a47a1095-495a-4563-bc82-7cb098241ddd', 'AFD / Projet Choose Africa 2', 'PROGRAMME', '', 'actif', 'a0d86ae7-1742-47e7-86e5-44c085fda59b', '2024-03-14', '1', '', '', '', '2025-11-19 15:06:50.596072+00'),
('9f401ea2-e4c3-48cf-b46f-941d6baf14bf', 'GIZ ZLECAF', 'PROGRAMME', '', 'actif', 'a0d86ae7-1742-47e7-86e5-44c085fda59b', '2024-05-14', '1', '', '', '', '2025-11-19 15:07:18.455927+00'),
('fbc07476-4a88-4ace-a669-d5560d8dfe5b', 'GIZ CEDEAO', 'PROGRAMME', '', 'actif', 'a0d86ae7-1742-47e7-86e5-44c085fda59b', '2024-07-14', '1', '', '', '', '2025-11-19 15:07:52.982058+00'),
('5099bcad-2927-4352-b591-8f90af4d7474', 'FREMIN', 'PROGRAMME', '', 'actif', 'a0d86ae7-1742-47e7-86e5-44c085fda59b', '2024-07-14', '1', '', '', '', '2025-11-19 15:08:09.708456+00'),
('08c44934-c6ff-4a73-8dad-addc5a5a4806', 'ONUFEMMES', 'PROGRAMME', '0706956088 / 0709124430', 'actif', '7d617f76-7d5d-4009-9b24-9f5bd1bd1781', '2025-07-19', '1', 'ALEX KOUASSI', 'alex.kouassi@unwomen.org', '0706956088 / 0709124430', '2025-11-19 15:10:19.825935+00'),
('e6281ac5-7d9b-47c4-a139-23b1e15404f6', 'Fonds de Développement de la Formation Professionnelle (FDFP)', 'PROGRAMME', '', 'actif', 'a0d86ae7-1742-47e7-86e5-44c085fda59b', '2024-03-19', '1', '', '', '', '2025-11-19 15:11:38.943136+00'),
('df0b44cf-e441-4927-85d7-2d1e738db62b', 'Afreximbank', 'PROGRAMME', '', 'actif', 'a0d86ae7-1742-47e7-86e5-44c085fda59b', '2024-02-19', '1', '', '', '', '2025-11-19 15:12:07.010427+00'),
('607a8766-2c6a-4cf1-bb5e-0ae05e6bb130', 'Fondation SEPHIS', 'PROGRAMME', '', 'actif', 'a0d86ae7-1742-47e7-86e5-44c085fda59b', '2024-07-19', '1', '', '', '', '2025-11-19 15:12:29.68279+00'),
('dd88dd67-2535-4ef4-b098-a173d2aeb049', 'DMIF-AFRICA', 'ENTREPRISE', '', 'actif', '7d617f76-7d5d-4009-9b24-9f5bd1bd1781', '2025-11-10', '1', '', '', '', '2025-11-19 15:51:18.732633+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- TRAININGS (2 enregistrements)
-- =============================================
INSERT INTO trainings (id, title, training_type, description, location, direction_id, start_date, end_date, created_at) VALUES
('86974cda-ac10-4233-92c1-2ef0027b7117', 'LES MATINALES DE L''EXPORT', 'Formation', '', 'Abidjan CCI', '652155d2-7267-4a2a-8e5a-71e24682a3c0', '2025-11-17 00:00:00+00', '2025-11-21 00:00:00+00', '2025-11-19 15:25:30.185403+00'),
('62af3fc9-fbc8-4c64-89ec-791fa973f633', 'LES VENDREDIS DE L''EXPORT', 'Formation', '', 'PARC EXPO', '652155d2-7267-4a2a-8e5a-71e24682a3c0', '2025-11-18 00:00:00+00', '2025-11-21 00:00:00+00', '2025-11-19 15:26:15.622358+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- BUSINESS_CONNECTIONS (7 enregistrements)
-- =============================================
INSERT INTO business_connections (id, pme_name, partner_name, destination_country, sector, contract_value, currency, status, connection_date, contract_duration_years, jobs_created, social_impact, created_at) VALUES
('607efa93-ce2e-432d-a88c-04d173b4156c', 'Fruits d''Or CI', 'Ghana Food Distribution', 'Ghana', 'Agroalimentaire', 650000, '€', 'En négociation', '2025-10-22', NULL, NULL, NULL, '2025-11-04 11:03:58.805648+00'),
('685983f1-df61-4cd4-a0ef-4e3c4b563218', 'Huiles Essentielles CI', 'Spa Luxe France', 'France', 'Cosmétiques', 450000, '€', 'En cours', '2025-10-10', 2, 15, 'Fourniture d''huiles essentielles pour spas de luxe', '2025-11-04 11:03:58.805648+00'),
('aaad9f3b-c8f4-4048-b23b-f50a57278e43', 'Cacao Excellence CI', 'Chocolat Suisse SA', 'Suisse', 'Agroalimentaire', 2500000, '€', 'Contrat signé', '2025-10-28', 3, 45, 'Export de 500 tonnes de cacao transformé, création de 45 emplois locaux', '2025-11-04 11:04:19.719045+00'),
('a7c8f7f4-6dd7-4517-b111-293992637de7', 'Bio Karité Afrique', 'Nature&Sens France', 'France', 'Cosmétiques', 1800000, '€', 'Contrat signé', '2025-10-25', 5, 200, 'Distribution nationale en France. Impact social: 200 femmes productrices bénéficiaires', '2025-11-04 11:04:19.719045+00'),
('2fee2295-87ec-495b-b9a2-becf4e832c62', 'Textile Tradition', 'Fashion Dubai LLC', 'Émirats Arabes Unis', 'Textile', 1200000, '€', 'Contrat signé', '2025-10-18', 2, 35, 'Distribution textile premium au Moyen-Orient', '2025-11-04 11:04:19.719045+00'),
('27fd9414-f7f9-404a-a9ab-af3b00af3b5a', 'Cajou Premium', 'Asia Trade Vietnam', 'Vietnam', 'Agroalimentaire', 3200000, '€', 'Contrat signé', '2025-10-15', 4, 120, 'Export régulier vers l''Asie du Sud-Est', '2025-11-04 11:04:19.719045+00'),
('168bdf14-e347-4bb2-b8fc-1b0930e771ae', 'Fruits Tropicaux Export', 'European Fresh Ltd', 'Pays-Bas', 'Agroalimentaire', 980000, '€', 'Contrat signé', '2025-10-05', 3, 55, 'Distribution de fruits frais en Europe du Nord', '2025-11-04 11:04:19.719045+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- FOLDERS (5 enregistrements)
-- =============================================
INSERT INTO folders (id, name, direction_id, parent_folder_id, created_at) VALUES
('2225c3c9-4f41-40d2-9838-a33ce6e27a54', 'RAPPORT 2024', '7d617f76-7d5d-4009-9b24-9f5bd1bd1781', NULL, '2025-11-19 12:21:19.326979+00'),
('2293ce35-8416-4f4a-aebd-c56c4176233d', 'RAPPORT 2023', '5ab7f631-9d2d-425d-bf38-756df1376d41', '2225c3c9-4f41-40d2-9838-a33ce6e27a54', '2025-11-19 15:41:27.344384+00'),
('8e411cfc-03e8-46d9-8d02-f3dd9e4ae023', 'RAPPORT 2022', '5ab7f631-9d2d-425d-bf38-756df1376d41', '2225c3c9-4f41-40d2-9838-a33ce6e27a54', '2025-11-19 15:59:56.891135+00'),
('342e660c-9f21-44a4-9d0a-3f10bc3e18b9', 'IMPUTATIONS', '8dad4f86-4e1c-488b-9f08-4585acd40beb', NULL, '2025-11-20 10:44:43.067792+00'),
('1307d149-345b-45fe-beac-46acb88fe324', 'RAPPORT VDE', '652155d2-7267-4a2a-8e5a-71e24682a3c0', NULL, '2025-11-29 22:17:21.329145+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- RÉSUMÉ DES DONNÉES
-- =============================================
-- Tables avec données volumineuses (utilisez les requêtes ci-dessous):
-- 
-- COMPANIES: 146 enregistrements
-- SELECT * FROM companies;
-- 
-- EVENTS: 414 enregistrements
-- SELECT * FROM events;
-- 
-- PROJECTS: 399 enregistrements
-- SELECT * FROM projects;
-- 
-- IMPUTATIONS: 398 enregistrements
-- SELECT * FROM imputations;
-- 
-- EXPORT_OPPORTUNITIES: 87 enregistrements
-- SELECT * FROM export_opportunities;
-- 
-- KPI_TRACKING: 27 enregistrements
-- SELECT * FROM kpi_tracking;
-- 
-- PROFILES: 11 enregistrements (données sensibles - authentification)
-- SELECT * FROM profiles;

-- =============================================
-- FIN DE L'EXPORT
-- =============================================

-- Seed Categories
INSERT INTO categories (name, slug, description)
VALUES
  ('General Discussion', 'general', 'Talk about anything physics related.'),
  ('Homework Help', 'homework', 'Get help with your problem sets.'),
  ('Exams & Study', 'exams', 'Prepare for upcoming midterms and finals.'),
  ('Research & Careers', 'research', 'Discuss effective field theories or effective job markets.'),
  ('Chit-Chat', 'chit-chat', 'Off-topic banter.')
ON CONFLICT (slug) DO NOTHING;

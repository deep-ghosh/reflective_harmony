-- Seed data for development and testing

INSERT INTO anon_students (id, anon_id, gender, course, last_severity, adherence_pct, questionnaire_status)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'ANO-7F3K2', 'F', 'CSE-Y3', 0.82, 65, TRUE),
  ('550e8400-e29b-41d4-a716-446655440002', 'ANO-9M2L8', 'M', 'ECE-Y2', 0.76, 42, FALSE),
  ('550e8400-e29b-41d4-a716-446655440003', 'ANO-4N8P1', 'NB', 'ME-Y4', 0.71, 78, TRUE),
  ('550e8400-e29b-41d4-a716-446655440004', 'ANO-1K5M9', 'F', 'EE-Y3', 0.79, 51, FALSE),
  ('550e8400-e29b-41d4-a716-446655440005', 'ANO-3P7Q2', 'M', 'CSE-Y2', 0.74, 69, TRUE);

INSERT INTO student_severity_history (id, anon_id, severity)
VALUES
  ('550e8400-e29b-41d4-a716-446655440101', 'ANO-7F3K2', 0.45),
  ('550e8400-e29b-41d4-a716-446655440102', 'ANO-7F3K2', 0.52),
  ('550e8400-e29b-41d4-a716-446655440103', 'ANO-7F3K2', 0.82);

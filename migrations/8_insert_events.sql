--example data for events table
--event_id and event_date are automatically generated when data is added to events table

INSERT INTO events (event_title, event_type, event_description, event_date, user_id) VALUES
('Zoo Tour', 'other', 'Going to the zoo', '2025-10-20 10:00:00', 1),
('Conference', 'study', 'Annual tech conference.', '2025-11-15 09:00:00', 2),
('Sport Events', 'sport', 'Schoolwide sports events.', '2025-10-25 14:00:00', 3),
('Book Club', 'study', 'Book club weekly meeting.', '2025-10-22 18:00:00', 4),
('Workshop', 'study', 'Participating in a coding workshop.', '2025-11-01 13:00:00', 5);

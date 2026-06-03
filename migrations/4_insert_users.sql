--insert users data
-- Passwords are all "password123" (bcrypt hashed)
-- admin user: role_id=1 (admin), regular users: role_id=2 (student)

INSERT INTO Users (username, email, password_hash, role_id, role) VALUES
('AlexDean','alex.dean@example.com','$2b$10$YbvnA5nqSklA3C4lXbGdUeDR7lZs8.L8FzE2pAnHcLb7fHwIhzzAG', 1, 'admin'),
('JamesSmith','james.smith@example.com','$2b$10$Q4f8YfUyzW5w76z7Vv6n5uN53U1A1bN2tfuYpEwZC99FqXjNjPsGO', 2, 'student'),
('CharlieBrown','charlie.brown@example.org','$2b$10$kmT86TOLG1ZPaBhtz8wl0OuLhQ84o9kfxcVtp2o9bikzP66t4NRK6', 2, 'student'),
('ElijahHyde','elijah.hyde@example.net','$2b$10$Q8kNmt2hI50gD9nOyaUxeO/YCEyyge.U8j2poQWhrLV3pq5w89Sdi', 2, 'student'),
('HarryLawson','harry.lawson@example.com','$2b$10$1wIFgAzcbz0XjqcM/7iYqOH4QiE6AKmkl.cL3CeD9VOG9oDMX4gB6', 2, 'student'),
('OliverPhillip','oliver.phillip@example.com','$2b$10$Y2HvKxVRMEXNlKswGJdIge5O0UCFm3NHc6zkZEnOdzPpkbZb7JHeK', 2, 'student');

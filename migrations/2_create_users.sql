--Create users table

CREATE TABLE IF NOT EXISTS Users (
    user_id serial PRIMARY KEY,
    username varchar(50) NOT NULL UNIQUE,
    email varchar(100) NOT NULL UNIQUE,
    password_hash varchar(300) NOT NULL,
    role_id INT REFERENCES Roles(role_id),
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX index_username ON Users (username);
CREATE INDEX index_email ON Users (email);

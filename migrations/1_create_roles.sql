--Create roles table

CREATE TABLE IF NOT EXISTS Roles (
    role_id serial PRIMARY KEY,
    roleName varchar(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX index_roleName ON Roles (roleName);
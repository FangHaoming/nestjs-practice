-- Initialize MySQL database for NestJS Practice
CREATE DATABASE IF NOT EXISTS nestjs_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    authorId INT NOT NULL,
    isPublished BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
-- NOTE: These are placeholder users with placeholder passwords.
-- To use these accounts, you need to register them via the /auth/register endpoint first,
-- or manually update the password hash in the database.
-- The password hash format should be a valid bcrypt hash (e.g., generated with bcrypt.hash('password123', 10))
INSERT INTO users (email, password, firstName, lastName, role) VALUES 
('admin@example.com', '$2b$10$example_hashed_password', 'Admin', 'User', 'admin'),
('user@example.com', '$2b$10$example_hashed_password', 'Regular', 'User', 'user');

INSERT INTO posts (title, content, excerpt, authorId) VALUES 
('First Post', 'This is the content of the first post', 'First post excerpt', 1),
('Second Post', 'This is the content of the second post', 'Second post excerpt', 2);
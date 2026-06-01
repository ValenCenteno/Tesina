CREATE DATABASE tesina_db;

USE tesina_db;

CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user VARCHAR(100),
    type VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    status VARCHAR(50),
    image VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

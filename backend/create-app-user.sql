CREATE USER IF NOT EXISTS 'vasma_app'@'localhost' IDENTIFIED BY 'VasmaApp@2026';
CREATE USER IF NOT EXISTS 'vasma_app'@'127.0.0.1' IDENTIFIED BY 'VasmaApp@2026';
GRANT ALL PRIVILEGES ON vasma_db.* TO 'vasma_app'@'localhost';
GRANT ALL PRIVILEGES ON vasma_db.* TO 'vasma_app'@'127.0.0.1';
FLUSH PRIVILEGES;

CREATE DATABASE maintenance_app;
CREATE USER maintenance_user WITH ENCRYPTED PASSWORD 'maintenance_2026';
GRANT ALL PRIVILEGES ON DATABASE maintenance_app TO maintenance_user;
\c maintenance_app
GRANT ALL ON SCHEMA public TO maintenance_user;
\q
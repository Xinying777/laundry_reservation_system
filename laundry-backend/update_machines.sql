-- First clear machines table (if there are existing records)
TRUNCATE machines RESTART IDENTITY CASCADE;

-- Re-insert all 8 washing machine data
INSERT INTO machines (machine_number, location, status) VALUES 
('Machine 1', 'Basement', 'available'),
('Machine 2', 'Basement', 'available'),
('Machine 3', 'Dorm A', 'available'),
('Machine 4', 'Dorm A', 'available'),
('Machine 5', 'Dorm B', 'available'),
('Machine 6', 'Dorm B', 'available'),
('Machine 7', 'Community Center', 'available'),
('Machine 8', 'Community Center', 'available');

-- Query to confirm results
SELECT * FROM machines ORDER BY id;

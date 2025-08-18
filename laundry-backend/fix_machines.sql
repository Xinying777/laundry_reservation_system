-- Fix machine data - add missing machines to match frontend
-- This script can be run safely multiple times

-- Update existing machine location information
UPDATE machines SET location = 'Basement' WHERE machine_number = 'Machine 1';
UPDATE machines SET location = 'Basement' WHERE machine_number = 'Machine 2'; 
UPDATE machines SET location = 'Dorm A', status = 'available' WHERE machine_number = 'Machine 3';

-- Add missing machines (4-8)
INSERT INTO machines (machine_number, location, status) VALUES 
('Machine 4', 'Dorm A', 'available'),
('Machine 5', 'Dorm B', 'available'),
('Machine 6', 'Dorm B', 'available'),
('Machine 7', 'Dorm C', 'available'),
('Machine 8', 'Dorm C', 'available')
ON CONFLICT (machine_number) DO NOTHING;

-- Verify results
SELECT id, machine_number, location, status FROM machines ORDER BY id;

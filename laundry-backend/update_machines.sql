-- 首先清空machines表（如果已有记录）
TRUNCATE machines RESTART IDENTITY CASCADE;

-- 重新插入所有8个洗衣机数据
INSERT INTO machines (machine_number, location, status) VALUES 
('Machine 1', 'Basement', 'available'),
('Machine 2', 'Basement', 'available'),
('Machine 3', 'Dorm A', 'available'),
('Machine 4', 'Dorm A', 'available'),
('Machine 5', 'Dorm B', 'available'),
('Machine 6', 'Dorm B', 'available'),
('Machine 7', 'Community Center', 'available'),
('Machine 8', 'Community Center', 'available');

-- 查询确认结果
SELECT * FROM machines ORDER BY id;

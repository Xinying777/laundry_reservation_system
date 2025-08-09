-- 添加更多测试用户
INSERT INTO users (student_id, password, name, email) VALUES 
('123123', 'password', 'Student One', 'student1@university.edu'),
('456789', 'student123', 'Student Two', 'student2@university.edu'),
('demo', 'demo', 'Demo User', 'demo@university.edu'),
('Ashley12', '20250801', 'Ashley', 'ashley@university.edu'),
('Ben123', '20250802', 'Ben', 'ben@university.edu'),
('Cathy1234', '20250803', 'Cathy', 'cathy@university.edu')
ON CONFLICT (student_id) DO NOTHING;

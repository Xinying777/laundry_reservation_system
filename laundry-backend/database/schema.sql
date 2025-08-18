-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Machines table
CREATE TABLE machines (
    id SERIAL PRIMARY KEY,
    machine_number VARCHAR(10) UNIQUE NOT NULL, -- 'machine1', 'machine2'
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'occupied', 'maintenance'
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    machine_id INTEGER REFERENCES machines(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lost and found table
CREATE TABLE lost_and_found (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id),
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    location_found VARCHAR(100),
    date_found DATE,
    status VARCHAR(20) DEFAULT 'active',
    contact_info VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default machine data
INSERT INTO machines (machine_number, location, status) VALUES 
('Machine 1', 'Basement', 'available'),
('Machine 2', 'Basement', 'available'),
('Machine 3', 'Dorm A', 'available'),
('Machine 4', 'Dorm A', 'available'),
('Machine 5', 'Dorm B', 'available'),
('Machine 6', 'Dorm B', 'available'),
('Machine 7', 'Community Center', 'available'),
('Machine 8', 'Community Center', 'available')
ON CONFLICT DO NOTHING;

-- Insert test user (student ID and password are both 'demo')
INSERT INTO users (student_id, password, name, email) VALUES 
('demo', 'demo', 'Test User', 'test@university.edu')
ON CONFLICT (student_id) DO NOTHING;
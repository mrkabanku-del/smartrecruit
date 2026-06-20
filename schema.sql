-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS applicants;
DROP TABLE IF EXISTS projects;

-- 1. Projects Table
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK(status IN ('open', 'closed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Applicants Table
CREATE TABLE applicants (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    cover_letter TEXT,
    stage TEXT NOT NULL CHECK(stage IN ('new', 'screening', 'interview', 'offer', 'hired', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 3. Interviews Table
CREATE TABLE interviews (
    id TEXT PRIMARY KEY,
    applicant_id TEXT NOT NULL,
    title TEXT,
    scheduled_at DATETIME,

    duration_minutes INTEGER DEFAULT 60,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Insert dummy data for initial setup and demonstration
INSERT INTO projects (id, title, description, status) VALUES
('proj_1', 'Software Engineer (Frontend)', 'รับสมัครผู้พัฒนา Frontend ด้วย React และ CSS ที่มีประสบการณ์การทำงาน 2 ปีขึ้นไป', 'open'),
('proj_2', 'UI/UX Designer', 'รับสมัครผู้ออกแบบเว็บไซต์และโมบายแอปพลิเคชัน มีหัวคิดสร้างสรรค์และทำโปรโตไทป์ได้ดี', 'open'),
('proj_3', 'Product Manager', 'รับสมัครผู้ดูแลผลิตภัณฑ์ ประสานงานระหว่างโปรแกรมเมอร์และลูกค้า', 'closed');

INSERT INTO applicants (id, project_id, name, email, phone, resume_url, portfolio_url, cover_letter, stage) VALUES
('app_1', 'proj_1', 'สมชาย ใจดี', 'somchai@gmail.com', '0812345678', 'https://resume.com/somchai', 'https://github.com/somchai', 'สนใจตำแหน่งนี้มากครับ มีประสบการณ์ทำงาน 3 ปีกับ React', 'new'),
('app_2', 'proj_1', 'สมหญิง สวยงาม', 'somying@gmail.com', '0823456789', 'https://resume.com/somying', '', 'ชอบเขียน CSS และจัดหน้าเว็บให้สวยงาม', 'screening'),
('app_3', 'proj_1', 'วิชัย กล้าหาญ', 'wichai@gmail.com', '0834567890', '', 'https://wichai.dev', '', 'interview'),
('app_4', 'proj_2', 'กิตติศักดิ์ ศรีสุข', 'kittisak@gmail.com', '0845678901', 'https://resume.com/kittisak', 'https://behance.net/kittisak', 'มีผลงานออกแบบแอปพลิเคชัน Fintech ครับ', 'new'),
('app_5', 'proj_2', 'นารี รักดี', 'naree@gmail.com', '0856789012', '', '', '', 'offer'),
('app_6', 'proj_2', 'มานะ มีชัย', 'mana@gmail.com', '0867890123', 'https://resume.com/mana', '', '', 'hired');

INSERT INTO interviews (id, applicant_id, title, scheduled_at, duration_minutes, notes) VALUES
('int_1', 'app_3', 'สัมภาษณ์รอบแรก - วิชัย กล้าหาญ', '2026-06-22 10:00:00', 60, 'สัมภาษณ์ทาง Zoom ลิงก์: zoom.us/j/123456789'),
('int_2', 'app_5', 'คุยข้อเสนองาน - นารี รักดี', '2026-06-23 14:00:00', 30, 'สัมภาษณ์ทางโทรศัพท์');

CREATE DATABASE IF NOT EXISTS ef_enroll;
USE ef_enroll;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  reset_password_token VARCHAR(64) NULL,
  reset_password_expires TIMESTAMP NULL,
  role ENUM('admin', 'professor', 'student') NOT NULL DEFAULT 'student',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emertimi VARCHAR(150) NOT NULL,
  pershkrimi TEXT NOT NULL,
  shefi_departamentit VARCHAR(150) NOT NULL,
  UNIQUE KEY uq_departments_emertimi (emertimi)
);

CREATE TABLE IF NOT EXISTS semesters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emertimi VARCHAR(100) NOT NULL,
  data_fillimit DATE NOT NULL,
  data_perfundimit DATE NOT NULL,
  statusi VARCHAR(50) NOT NULL,
  UNIQUE KEY uq_semesters_emertimi (emertimi),
  CONSTRAINT chk_semesters_dates CHECK (data_perfundimit >= data_fillimit)
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  numri_studentit VARCHAR(50) NOT NULL,
  programi VARCHAR(100) NOT NULL,
  viti_studimit INT NOT NULL,
  UNIQUE KEY uq_students_user (user_id),
  UNIQUE KEY uq_students_numri (numri_studentit),
  CONSTRAINT chk_students_number_format CHECK (numri_studentit REGEXP '^STU-[0-9]{4}-[0-9]{4}$'),
  CONSTRAINT chk_students_year CHECK (viti_studimit BETWEEN 1 AND 5),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS professors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  titulli VARCHAR(100) NOT NULL,
  departamenti VARCHAR(150) NOT NULL,
  UNIQUE KEY uq_professors_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emertimi VARCHAR(150) NOT NULL,
  pershkrimi TEXT NOT NULL,
  kredite INT NOT NULL,
  professor_id INT NOT NULL,
  semester_id INT NOT NULL,
  kapaciteti INT NOT NULL,
  cmimi DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT chk_courses_credits CHECK (kredite > 0),
  CONSTRAINT chk_courses_capacity CHECK (kapaciteti > 0),
  CONSTRAINT chk_courses_price CHECK (cmimi >= 0),
  FOREIGN KEY (professor_id) REFERENCES professors(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  dita VARCHAR(20) NOT NULL,
  ora_fillimit TIME NOT NULL,
  ora_perfundimit TIME NOT NULL,
  salla VARCHAR(50) NOT NULL,
  CONSTRAINT chk_schedules_time CHECK (ora_perfundimit > ora_fillimit),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  data_regjistrimit DATE NOT NULL,
  statusi VARCHAR(50) NOT NULL,
  nota INT,
  kohezgjatja_muaj INT NOT NULL DEFAULT 1,
  cmimi_baze DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  zbritja_perqindje DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  cmimi_final DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  oferta_fillestare TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_enrollments_student_course (student_id, course_id),
  INDEX idx_enrollments_course_status (course_id, statusi),
  CONSTRAINT chk_enrollments_duration CHECK (kohezgjatja_muaj IN (1, 3, 6, 12)),
  CONSTRAINT chk_enrollments_price CHECK (cmimi_baze >= 0 AND zbritja_perqindje >= 0 AND cmimi_final >= 0),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  statusi VARCHAR(50) NOT NULL DEFAULT 'paid',
  payment_method VARCHAR(50) NOT NULL DEFAULT 'simulated',
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  transaction_id VARCHAR(100) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  payer_name VARCHAR(150),
  payer_email VARCHAR(150),
  notes TEXT,
  refunded_at TIMESTAMP NULL,
  data_pageses TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_payments_amount CHECK (amount >= 0),
  CONSTRAINT chk_payments_email_format CHECK (payer_email IS NULL OR payer_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  replaced_by_token_hash VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_refresh_tokens_user_active (user_id, revoked_at, expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS waiting_list (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  data DATE NOT NULL,
  pozicioni INT NOT NULL,
  statusi VARCHAR(30) NOT NULL DEFAULT 'waiting',
  prioriteti VARCHAR(30) NOT NULL DEFAULT 'normal',
  arsyeja TEXT,
  njofto_me_email TINYINT(1) NOT NULL DEFAULT 1,
  data_njoftimit TIMESTAMP NULL,
  afati_pergjigjes TIMESTAMP NULL,
  UNIQUE KEY uq_waiting_list_student_course (student_id, course_id),
  INDEX idx_waiting_list_course_position (course_id, pozicioni),
  INDEX idx_waiting_list_student (student_id),
  CONSTRAINT chk_waiting_list_position CHECK (pozicioni > 0),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  titulli VARCHAR(200) NOT NULL,
  permbajtja TEXT NOT NULL,
  data DATE NOT NULL,
  professor_id INT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (professor_id) REFERENCES professors(id)
);

CREATE TABLE IF NOT EXISTS course_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  professor_id INT NOT NULL,
  titulli VARCHAR(200) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  material_type VARCHAR(30) NOT NULL DEFAULT 'resource',
  pershkrimi TEXT,
  moduli VARCHAR(120),
  java INT,
  duration_minutes INT NOT NULL DEFAULT 0,
  is_required TINYINT(1) NOT NULL DEFAULT 1,
  order_index INT NOT NULL DEFAULT 0,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_course_materials_duration CHECK (duration_minutes >= 0),
  CONSTRAINT chk_course_materials_order CHECK (order_index >= 0),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (professor_id) REFERENCES professors(id)
);

SET @admin_password_hash = '$2b$10$mi.MZVNi/izdcArVX6jCjuvnDSN27tA9lMnlVsWaaMRimTwqWMPV.';
SET @demo_password_hash = '$2b$10$NexA7gIRR59hJaafNb9ywusdRiOS5ZthvNWSJz9h0JNJ4.8nJ0dS2';

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'admin', 'admin@gmail.com', @admin_password_hash, 'admin', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@gmail.com');

UPDATE users
SET username = 'admin',
  password_hash = @admin_password_hash,
  role = 'admin',
  status = 'approved'
WHERE email = 'admin@gmail.com';

INSERT INTO departments (emertimi, pershkrimi, shefi_departamentit)
SELECT 'Computer Science', 'Programming, web, databases, and software courses.', 'Ilir Berisha'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE emertimi = 'Computer Science');

INSERT INTO departments (emertimi, pershkrimi, shefi_departamentit)
SELECT 'Data Science', 'Analytics, statistics, and applied data courses.', 'Nora Kelmendi'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE emertimi = 'Data Science');

INSERT INTO departments (emertimi, pershkrimi, shefi_departamentit)
SELECT 'Business', 'Management and business administration courses.', 'Besart Shala'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE emertimi = 'Business');

INSERT INTO semesters (emertimi, data_fillimit, data_perfundimit, statusi)
SELECT 'Spring 2026', '2026-02-16', '2026-06-19', 'active'
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE emertimi = 'Spring 2026');

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Arta Krasniqi', 'arta.student@ef-enroll.test', @demo_password_hash, 'student', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'arta.student@ef-enroll.test');

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Luan Gashi', 'luan.student@ef-enroll.test', @demo_password_hash, 'student', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'luan.student@ef-enroll.test');

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Diona Hoxha', 'diona.student@ef-enroll.test', @demo_password_hash, 'student', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'diona.student@ef-enroll.test');

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Erion Shala', 'erion.student@ef-enroll.test', @demo_password_hash, 'student', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'erion.student@ef-enroll.test');

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Blerta Morina', 'blerta.student@ef-enroll.test', @demo_password_hash, 'student', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'blerta.student@ef-enroll.test');

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Ilir Berisha', 'ilir.professor@ef-enroll.test', @demo_password_hash, 'professor', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ilir.professor@ef-enroll.test');

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Elira Hoxha', 'elira.professor@ef-enroll.test', @demo_password_hash, 'professor', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'elira.professor@ef-enroll.test');

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Besart Shala', 'besart.professor@ef-enroll.test', @demo_password_hash, 'professor', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'besart.professor@ef-enroll.test');

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Nora Kelmendi', 'nora.professor@ef-enroll.test', @demo_password_hash, 'professor', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nora.professor@ef-enroll.test');

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Arben Dervishi', 'arben.professor@ef-enroll.test', @demo_password_hash, 'professor', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'arben.professor@ef-enroll.test');

UPDATE users
SET password_hash = @demo_password_hash, role = 'student', status = 'approved'
WHERE email IN (
  'arta.student@ef-enroll.test',
  'luan.student@ef-enroll.test',
  'diona.student@ef-enroll.test',
  'erion.student@ef-enroll.test',
  'blerta.student@ef-enroll.test'
);

UPDATE users
SET password_hash = @demo_password_hash, role = 'professor', status = 'approved'
WHERE email IN (
  'ilir.professor@ef-enroll.test',
  'elira.professor@ef-enroll.test',
  'besart.professor@ef-enroll.test',
  'nora.professor@ef-enroll.test',
  'arben.professor@ef-enroll.test'
);

INSERT INTO students (user_id, numri_studentit, programi, viti_studimit)
SELECT id, 'STU-2026-0001', 'Computer Science', 1
FROM users
WHERE email = 'arta.student@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM students WHERE numri_studentit = 'STU-2026-0001');

INSERT INTO students (user_id, numri_studentit, programi, viti_studimit)
SELECT id, 'STU-2026-0002', 'Computer Science', 2
FROM users
WHERE email = 'luan.student@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM students WHERE numri_studentit = 'STU-2026-0002');

INSERT INTO students (user_id, numri_studentit, programi, viti_studimit)
SELECT id, 'STU-2026-0003', 'Data Science', 1
FROM users
WHERE email = 'diona.student@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM students WHERE numri_studentit = 'STU-2026-0003');

INSERT INTO students (user_id, numri_studentit, programi, viti_studimit)
SELECT id, 'STU-2026-0004', 'Business', 3
FROM users
WHERE email = 'erion.student@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM students WHERE numri_studentit = 'STU-2026-0004');

INSERT INTO students (user_id, numri_studentit, programi, viti_studimit)
SELECT id, 'STU-2026-0005', 'Software Engineering', 2
FROM users
WHERE email = 'blerta.student@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM students WHERE numri_studentit = 'STU-2026-0005');

INSERT INTO professors (user_id, titulli, departamenti)
SELECT id, 'Prof. Dr.', 'Computer Science'
FROM users
WHERE email = 'ilir.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM professors WHERE user_id = users.id);

INSERT INTO professors (user_id, titulli, departamenti)
SELECT id, 'Dr.', 'Computer Science'
FROM users
WHERE email = 'elira.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM professors WHERE user_id = users.id);

INSERT INTO professors (user_id, titulli, departamenti)
SELECT id, 'MSc.', 'Business'
FROM users
WHERE email = 'besart.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM professors WHERE user_id = users.id);

INSERT INTO professors (user_id, titulli, departamenti)
SELECT id, 'Dr.', 'Data Science'
FROM users
WHERE email = 'nora.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM professors WHERE user_id = users.id);

INSERT INTO professors (user_id, titulli, departamenti)
SELECT id, 'Prof.', 'Software Engineering'
FROM users
WHERE email = 'arben.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM professors WHERE user_id = users.id);

INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, cmimi)
SELECT 'Introduction to Programming', 'Programming basics, algorithms, and practical exercises.', 6, p.id, s.id, 25, 120.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'ilir.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE emertimi = 'Introduction to Programming');

INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, cmimi)
SELECT 'Web Development', 'Frontend and backend web development with modern tools.', 6, p.id, s.id, 20, 150.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'elira.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE emertimi = 'Web Development');

INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, cmimi)
SELECT 'Database Systems', 'Relational databases, SQL, modeling, and transactions.', 5, p.id, s.id, 22, 130.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'arben.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE emertimi = 'Database Systems');

INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, cmimi)
SELECT 'Data Analytics', 'Data cleaning, dashboards, and decision-focused analytics.', 5, p.id, s.id, 18, 170.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'nora.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE emertimi = 'Data Analytics');

INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, cmimi)
SELECT 'Business Management', 'Management fundamentals, planning, and organizational strategy.', 4, p.id, s.id, 30, 100.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'besart.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE emertimi = 'Business Management');

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Monday', '09:00:00', '10:30:00', 'Room 1'
FROM courses
WHERE emertimi = 'Introduction to Programming'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id AND dita = 'Monday' AND ora_fillimit = '09:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Wednesday', '11:00:00', '12:30:00', 'Room 2'
FROM courses
WHERE emertimi = 'Web Development'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id AND dita = 'Wednesday' AND ora_fillimit = '11:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Tuesday', '10:00:00', '11:30:00', 'Room 3'
FROM courses
WHERE emertimi = 'Database Systems'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id AND dita = 'Tuesday' AND ora_fillimit = '10:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Thursday', '13:00:00', '14:30:00', 'Room 4'
FROM courses
WHERE emertimi = 'Data Analytics'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id AND dita = 'Thursday' AND ora_fillimit = '13:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Friday', '09:00:00', '10:30:00', 'Room 5'
FROM courses
WHERE emertimi = 'Business Management'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id AND dita = 'Friday' AND ora_fillimit = '09:00:00'
  );

INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, cmimi)
SELECT 'Python for Data Science', 'Python, notebooks, data cleaning, visualization, and practical analysis projects.', 6, p.id, s.id, 24, 160.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'nora.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE emertimi = 'Python for Data Science');

INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, cmimi)
SELECT 'UI UX Design', 'User research, wireframes, prototypes, usability testing, and interface design.', 5, p.id, s.id, 18, 140.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'elira.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE emertimi = 'UI UX Design');

INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, cmimi)
SELECT 'Cybersecurity Fundamentals', 'Security basics, authentication, network risks, OWASP concepts, and safe systems.', 6, p.id, s.id, 20, 180.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'arben.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE emertimi = 'Cybersecurity Fundamentals');

INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, cmimi)
SELECT 'Cloud Computing', 'Cloud services, deployment models, scaling, storage, containers, and monitoring.', 5, p.id, s.id, 22, 190.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'ilir.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE emertimi = 'Cloud Computing');

INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, cmimi)
SELECT 'Digital Marketing', 'Campaign planning, audience research, SEO, analytics, and marketing funnels.', 4, p.id, s.id, 28, 110.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'besart.professor@ef-enroll.test'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE emertimi = 'Digital Marketing');

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Monday', '14:00:00', '15:30:00', 'Data Lab'
FROM courses
WHERE emertimi = 'Python for Data Science'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id AND dita = 'Monday' AND ora_fillimit = '14:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Tuesday', '12:00:00', '13:30:00', 'Design Studio'
FROM courses
WHERE emertimi = 'UI UX Design'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id AND dita = 'Tuesday' AND ora_fillimit = '12:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Wednesday', '15:00:00', '16:30:00', 'Security Lab'
FROM courses
WHERE emertimi = 'Cybersecurity Fundamentals'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id AND dita = 'Wednesday' AND ora_fillimit = '15:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Thursday', '10:00:00', '11:30:00', 'Cloud Lab'
FROM courses
WHERE emertimi = 'Cloud Computing'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id AND dita = 'Thursday' AND ora_fillimit = '10:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Friday', '12:00:00', '13:30:00', 'Room 6'
FROM courses
WHERE emertimi = 'Digital Marketing'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id AND dita = 'Friday' AND ora_fillimit = '12:00:00'
  );

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'Week 1 Slides - Variables and Control Flow', 'https://example.com/materials/programming-week-1-slides.pdf', 'slides', 'Programming Basics material for Introduction to Programming.', 'Programming Basics', 1, 45, 1, 1
FROM courses c
WHERE c.emertimi = 'Introduction to Programming'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'Week 1 Slides - Variables and Control Flow');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'Assignment - Build a Console Calculator', 'https://example.com/materials/programming-calculator-assignment.pdf', 'assignment', 'Practice material for Introduction to Programming.', 'Practice', 2, 120, 1, 2
FROM courses c
WHERE c.emertimi = 'Introduction to Programming'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'Assignment - Build a Console Calculator');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'HTML CSS Starter Pack', 'https://example.com/materials/web-html-css-starter.zip', 'resource', 'Frontend Foundations material for Web Development.', 'Frontend Foundations', 1, 60, 1, 1
FROM courses c
WHERE c.emertimi = 'Web Development'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'HTML CSS Starter Pack');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'React Components Reading', 'https://example.com/materials/react-components-reading.pdf', 'reading', 'React material for Web Development.', 'React', 3, 50, 1, 2
FROM courses c
WHERE c.emertimi = 'Web Development'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'React Components Reading');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'ER Diagram Workshop', 'https://example.com/materials/database-er-diagram-workshop.pdf', 'slides', 'Data Modeling material for Database Systems.', 'Data Modeling', 2, 70, 1, 1
FROM courses c
WHERE c.emertimi = 'Database Systems'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'ER Diagram Workshop');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'SQL Joins Quiz', 'https://example.com/materials/sql-joins-quiz', 'quiz', 'SQL material for Database Systems.', 'SQL', 4, 30, 1, 2
FROM courses c
WHERE c.emertimi = 'Database Systems'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'SQL Joins Quiz');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'Dashboard Design Checklist', 'https://example.com/materials/dashboard-design-checklist.pdf', 'resource', 'Dashboards material for Data Analytics.', 'Dashboards', 3, 40, 0, 1
FROM courses c
WHERE c.emertimi = 'Data Analytics'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'Dashboard Design Checklist');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'Case Study - Team Planning', 'https://example.com/materials/business-team-planning-case.pdf', 'reading', 'Management Cases material for Business Management.', 'Management Cases', 2, 55, 1, 1
FROM courses c
WHERE c.emertimi = 'Business Management'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'Case Study - Team Planning');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'Python Notebook Setup', 'https://example.com/materials/python-notebook-setup.pdf', 'resource', 'Environment Setup material for Python for Data Science.', 'Environment Setup', 1, 35, 1, 1
FROM courses c
WHERE c.emertimi = 'Python for Data Science'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'Python Notebook Setup');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'Pandas Cleaning Assignment', 'https://example.com/materials/pandas-cleaning-assignment.ipynb', 'assignment', 'Data Cleaning material for Python for Data Science.', 'Data Cleaning', 3, 120, 1, 2
FROM courses c
WHERE c.emertimi = 'Python for Data Science'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'Pandas Cleaning Assignment');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'Wireframe Template Pack', 'https://example.com/materials/wireframe-template-pack.fig', 'resource', 'Wireframes material for UI UX Design.', 'Wireframes', 2, 45, 0, 1
FROM courses c
WHERE c.emertimi = 'UI UX Design'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'Wireframe Template Pack');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'Usability Testing Guide', 'https://example.com/materials/usability-testing-guide.pdf', 'reading', 'Testing material for UI UX Design.', 'Testing', 4, 65, 1, 2
FROM courses c
WHERE c.emertimi = 'UI UX Design'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'Usability Testing Guide');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'OWASP Top 10 Overview', 'https://example.com/materials/owasp-top-10-overview.pdf', 'slides', 'Web Security material for Cybersecurity Fundamentals.', 'Web Security', 3, 75, 1, 1
FROM courses c
WHERE c.emertimi = 'Cybersecurity Fundamentals'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'OWASP Top 10 Overview');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'Deployment Architecture Video', 'https://example.com/materials/cloud-deployment-architecture-video', 'video', 'Cloud Architecture material for Cloud Computing.', 'Cloud Architecture', 2, 50, 1, 1
FROM courses c
WHERE c.emertimi = 'Cloud Computing'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'Deployment Architecture Video');

INSERT INTO course_materials (course_id, professor_id, titulli, file_url, material_type, pershkrimi, moduli, java, duration_minutes, is_required, order_index)
SELECT c.id, c.professor_id, 'SEO Audit Checklist', 'https://example.com/materials/seo-audit-checklist.pdf', 'resource', 'SEO material for Digital Marketing.', 'SEO', 3, 40, 1, 1
FROM courses c
WHERE c.emertimi = 'Digital Marketing'
  AND NOT EXISTS (SELECT 1 FROM course_materials WHERE course_id = c.id AND titulli = 'SEO Audit Checklist');

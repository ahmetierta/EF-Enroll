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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emertimi VARCHAR(150),
  pershkrimi TEXT,
  shefi_departamentit VARCHAR(150),
  UNIQUE KEY uq_departments_emertimi (emertimi)
);

CREATE TABLE IF NOT EXISTS semesters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emertimi VARCHAR(100),
  data_fillimit DATE,
  data_perfundimit DATE,
  statusi VARCHAR(50),
  UNIQUE KEY uq_semesters_emertimi (emertimi)
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  numri_studentit VARCHAR(50),
  programi VARCHAR(100),
  viti_studimit INT,
  UNIQUE KEY uq_students_user (user_id),
  UNIQUE KEY uq_students_numri (numri_studentit),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS professors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  titulli VARCHAR(100),
  departamenti VARCHAR(150),
  UNIQUE KEY uq_professors_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emertimi VARCHAR(150),
  pershkrimi TEXT,
  kredite INT,
  professor_id INT,
  semester_id INT,
  kapaciteti INT,
  cmimi DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (professor_id) REFERENCES professors(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT,
  dita VARCHAR(20),
  ora_fillimit TIME,
  ora_perfundimit TIME,
  salla VARCHAR(50),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  course_id INT,
  data_regjistrimit DATE,
  statusi VARCHAR(50),
  nota INT,
  kohezgjatja_muaj INT NOT NULL DEFAULT 1,
  cmimi_baze DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  zbritja_perqindje DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  cmimi_final DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  oferta_fillestare TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_enrollments_course_status (course_id, statusi),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT,
  amount DECIMAL(10,2) NOT NULL,
  statusi VARCHAR(50) DEFAULT 'paid',
  payment_method VARCHAR(50) DEFAULT 'simulated',
  invoice_number VARCHAR(50) UNIQUE,
  transaction_id VARCHAR(100),
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  payer_name VARCHAR(150),
  payer_email VARCHAR(150),
  notes TEXT,
  refunded_at TIMESTAMP NULL,
  data_pageses TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
  student_id INT,
  course_id INT,
  data DATE,
  pozicioni INT,
  statusi VARCHAR(30) NOT NULL DEFAULT 'waiting',
  prioriteti VARCHAR(30) NOT NULL DEFAULT 'normal',
  arsyeja TEXT,
  njofto_me_email TINYINT(1) NOT NULL DEFAULT 1,
  data_njoftimit TIMESTAMP NULL,
  afati_pergjigjes TIMESTAMP NULL,
  UNIQUE KEY uq_waiting_list_student_course (student_id, course_id),
  INDEX idx_waiting_list_course_position (course_id, pozicioni),
  INDEX idx_waiting_list_student (student_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT,
  titulli VARCHAR(200),
  permbajtja TEXT,
  data DATE,
  professor_id INT,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (professor_id) REFERENCES professors(id)
);

CREATE TABLE IF NOT EXISTS course_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT,
  professor_id INT,
  titulli VARCHAR(200),
  file_url VARCHAR(500),
  material_type VARCHAR(30) NOT NULL DEFAULT 'resource',
  pershkrimi TEXT,
  moduli VARCHAR(120),
  java INT,
  duration_minutes INT NOT NULL DEFAULT 0,
  is_required TINYINT(1) NOT NULL DEFAULT 1,
  order_index INT NOT NULL DEFAULT 0,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

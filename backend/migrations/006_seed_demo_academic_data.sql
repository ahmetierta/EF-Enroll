USE ef_enroll;

SET @demo_password_hash = '$2b$10$NexA7gIRR59hJaafNb9ywusdRiOS5ZthvNWSJz9h0JNJ4.8nJ0dS2';

INSERT INTO departments (emertimi, pershkrimi, shefi_departamentit)
SELECT 'Computer Science', 'Programming, web, databases, and software courses.', 'Ilir Berisha'
WHERE NOT EXISTS (
  SELECT 1 FROM departments WHERE emertimi = 'Computer Science'
);

INSERT INTO departments (emertimi, pershkrimi, shefi_departamentit)
SELECT 'Data Science', 'Analytics, statistics, and applied data courses.', 'Nora Kelmendi'
WHERE NOT EXISTS (
  SELECT 1 FROM departments WHERE emertimi = 'Data Science'
);

INSERT INTO departments (emertimi, pershkrimi, shefi_departamentit)
SELECT 'Business', 'Management and business administration courses.', 'Besart Shala'
WHERE NOT EXISTS (
  SELECT 1 FROM departments WHERE emertimi = 'Business'
);

INSERT INTO semesters (emertimi, data_fillimit, data_perfundimit, statusi)
SELECT 'Spring 2026', '2026-02-16', '2026-06-19', 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM semesters WHERE emertimi = 'Spring 2026'
);

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Arta Krasniqi', 'arta.student@ef-enroll.test', @demo_password_hash, 'student', 'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'arta.student@ef-enroll.test'
);

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Luan Gashi', 'luan.student@ef-enroll.test', @demo_password_hash, 'student', 'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'luan.student@ef-enroll.test'
);

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Diona Hoxha', 'diona.student@ef-enroll.test', @demo_password_hash, 'student', 'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'diona.student@ef-enroll.test'
);

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Erion Shala', 'erion.student@ef-enroll.test', @demo_password_hash, 'student', 'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'erion.student@ef-enroll.test'
);

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Blerta Morina', 'blerta.student@ef-enroll.test', @demo_password_hash, 'student', 'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'blerta.student@ef-enroll.test'
);

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Ilir Berisha', 'ilir.professor@ef-enroll.test', @demo_password_hash, 'professor', 'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'ilir.professor@ef-enroll.test'
);

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Elira Hoxha', 'elira.professor@ef-enroll.test', @demo_password_hash, 'professor', 'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'elira.professor@ef-enroll.test'
);

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Besart Shala', 'besart.professor@ef-enroll.test', @demo_password_hash, 'professor', 'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'besart.professor@ef-enroll.test'
);

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Nora Kelmendi', 'nora.professor@ef-enroll.test', @demo_password_hash, 'professor', 'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'nora.professor@ef-enroll.test'
);

INSERT INTO users (username, email, password_hash, role, status)
SELECT 'Arben Dervishi', 'arben.professor@ef-enroll.test', @demo_password_hash, 'professor', 'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'arben.professor@ef-enroll.test'
);

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
  AND NOT EXISTS (
    SELECT 1 FROM students WHERE numri_studentit = 'STU-2026-0001'
  );

INSERT INTO students (user_id, numri_studentit, programi, viti_studimit)
SELECT id, 'STU-2026-0002', 'Computer Science', 2
FROM users
WHERE email = 'luan.student@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM students WHERE numri_studentit = 'STU-2026-0002'
  );

INSERT INTO students (user_id, numri_studentit, programi, viti_studimit)
SELECT id, 'STU-2026-0003', 'Data Science', 1
FROM users
WHERE email = 'diona.student@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM students WHERE numri_studentit = 'STU-2026-0003'
  );

INSERT INTO students (user_id, numri_studentit, programi, viti_studimit)
SELECT id, 'STU-2026-0004', 'Business', 3
FROM users
WHERE email = 'erion.student@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM students WHERE numri_studentit = 'STU-2026-0004'
  );

INSERT INTO students (user_id, numri_studentit, programi, viti_studimit)
SELECT id, 'STU-2026-0005', 'Software Engineering', 2
FROM users
WHERE email = 'blerta.student@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM students WHERE numri_studentit = 'STU-2026-0005'
  );

INSERT INTO professors (user_id, titulli, departamenti)
SELECT id, 'Prof. Dr.', 'Computer Science'
FROM users
WHERE email = 'ilir.professor@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM professors WHERE user_id = users.id
  );

INSERT INTO professors (user_id, titulli, departamenti)
SELECT id, 'Dr.', 'Computer Science'
FROM users
WHERE email = 'elira.professor@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM professors WHERE user_id = users.id
  );

INSERT INTO professors (user_id, titulli, departamenti)
SELECT id, 'MSc.', 'Business'
FROM users
WHERE email = 'besart.professor@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM professors WHERE user_id = users.id
  );

INSERT INTO professors (user_id, titulli, departamenti)
SELECT id, 'Dr.', 'Data Science'
FROM users
WHERE email = 'nora.professor@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM professors WHERE user_id = users.id
  );

INSERT INTO professors (user_id, titulli, departamenti)
SELECT id, 'Prof.', 'Software Engineering'
FROM users
WHERE email = 'arben.professor@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM professors WHERE user_id = users.id
  );

INSERT INTO courses (
  emertimi,
  pershkrimi,
  kredite,
  professor_id,
  semester_id,
  kapaciteti,
  cmimi
)
SELECT
  'Introduction to Programming',
  'Programming basics, algorithms, and practical exercises.',
  6,
  p.id,
  s.id,
  25,
  120.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'ilir.professor@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM courses WHERE emertimi = 'Introduction to Programming'
  );

INSERT INTO courses (
  emertimi,
  pershkrimi,
  kredite,
  professor_id,
  semester_id,
  kapaciteti,
  cmimi
)
SELECT
  'Web Development',
  'Frontend and backend web development with modern tools.',
  6,
  p.id,
  s.id,
  20,
  150.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'elira.professor@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM courses WHERE emertimi = 'Web Development'
  );

INSERT INTO courses (
  emertimi,
  pershkrimi,
  kredite,
  professor_id,
  semester_id,
  kapaciteti,
  cmimi
)
SELECT
  'Database Systems',
  'Relational databases, SQL, modeling, and transactions.',
  5,
  p.id,
  s.id,
  22,
  130.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'arben.professor@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM courses WHERE emertimi = 'Database Systems'
  );

INSERT INTO courses (
  emertimi,
  pershkrimi,
  kredite,
  professor_id,
  semester_id,
  kapaciteti,
  cmimi
)
SELECT
  'Data Analytics',
  'Data cleaning, dashboards, and decision-focused analytics.',
  5,
  p.id,
  s.id,
  18,
  170.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'nora.professor@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM courses WHERE emertimi = 'Data Analytics'
  );

INSERT INTO courses (
  emertimi,
  pershkrimi,
  kredite,
  professor_id,
  semester_id,
  kapaciteti,
  cmimi
)
SELECT
  'Business Management',
  'Management fundamentals, planning, and organizational strategy.',
  4,
  p.id,
  s.id,
  30,
  100.00
FROM professors p
JOIN users u ON u.id = p.user_id
JOIN semesters s ON s.emertimi = 'Spring 2026'
WHERE u.email = 'besart.professor@ef-enroll.test'
  AND NOT EXISTS (
    SELECT 1 FROM courses WHERE emertimi = 'Business Management'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Monday', '09:00:00', '10:30:00', 'Room 1'
FROM courses
WHERE emertimi = 'Introduction to Programming'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id
      AND dita = 'Monday'
      AND ora_fillimit = '09:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Wednesday', '11:00:00', '12:30:00', 'Room 2'
FROM courses
WHERE emertimi = 'Web Development'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id
      AND dita = 'Wednesday'
      AND ora_fillimit = '11:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Tuesday', '10:00:00', '11:30:00', 'Room 3'
FROM courses
WHERE emertimi = 'Database Systems'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id
      AND dita = 'Tuesday'
      AND ora_fillimit = '10:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Thursday', '13:00:00', '14:30:00', 'Room 4'
FROM courses
WHERE emertimi = 'Data Analytics'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id
      AND dita = 'Thursday'
      AND ora_fillimit = '13:00:00'
  );

INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla)
SELECT id, 'Friday', '09:00:00', '10:30:00', 'Room 5'
FROM courses
WHERE emertimi = 'Business Management'
  AND NOT EXISTS (
    SELECT 1 FROM schedules
    WHERE course_id = courses.id
      AND dita = 'Friday'
      AND ora_fillimit = '09:00:00'
  );

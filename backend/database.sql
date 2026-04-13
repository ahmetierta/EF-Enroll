
USE ef_enroll;
CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE departments (
 id INT AUTO_INCREMENT PRIMARY KEY,
 emertimi VARCHAR(150),
 pershkrimi TEXT,
 shefi_departamentit VARCHAR(150)
);
CREATE TABLE semesters (
 id INT AUTO_INCREMENT PRIMARY KEY,
 emertimi VARCHAR(100),
 data_fillimit DATE,
 data_perfundimit DATE,
 statusi VARCHAR(50)
);
CREATE TABLE students (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 numri_studentit VARCHAR(50),
 programi VARCHAR(100),
 viti_studimit INT,
 FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE professors (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 titulli VARCHAR(100),
 departamenti VARCHAR(150),
 FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE courses (
 id INT AUTO_INCREMENT PRIMARY KEY,
 emertimi VARCHAR(150),
 pershkrimi TEXT,
 kredite INT,
 professor_id INT,
 semester_id INT,
 kapaciteti INT,
 FOREIGN KEY (professor_id) REFERENCES professors(id),
 FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
CREATE TABLE schedules (
 id INT AUTO_INCREMENT PRIMARY KEY,
 course_id INT,
 dita VARCHAR(20),
 ora_fillimit TIME,
 ora_perfundimit TIME,
 salla VARCHAR(50),
 FOREIGN KEY (course_id) REFERENCES courses(id)
);
CREATE TABLE enrollments (
 id INT AUTO_INCREMENT PRIMARY KEY,
 student_id INT,
 course_id INT,
 data_regjistrimit DATE,
 statusi VARCHAR(50),
 nota INT,
 FOREIGN KEY (student_id) REFERENCES students(id),
 FOREIGN KEY (course_id) REFERENCES courses(id)
);
CREATE TABLE waiting_list (
 id INT AUTO_INCREMENT PRIMARY KEY,
 student_id INT,
 course_id INT,
 data DATE,
 pozicioni INT,
 FOREIGN KEY (student_id) REFERENCES students(id),
 FOREIGN KEY (course_id) REFERENCES courses(id)
);
CREATE TABLE announcements (
 id INT AUTO_INCREMENT PRIMARY KEY,
 course_id INT,
 titulli VARCHAR(200),
 permbajtja TEXT,
 data DATE,
 professor_id INT,
 FOREIGN KEY (course_id) REFERENCES courses(id),
 FOREIGN KEY (professor_id) REFERENCES professors(id)
);
SHOW TABLES;
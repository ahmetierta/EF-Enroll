USE ef_enroll;

CREATE TABLE IF NOT EXISTS waiting_list (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  course_id INT,
  data DATE,
  pozicioni INT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE INDEX idx_waiting_list_course_position
  ON waiting_list (course_id, pozicioni);

CREATE INDEX idx_waiting_list_student
  ON waiting_list (student_id);

ALTER TABLE waiting_list
  ADD CONSTRAINT uq_waiting_list_student_course UNIQUE (student_id, course_id);

CREATE INDEX idx_enrollments_course_status
  ON enrollments (course_id, statusi);

USE ef_enroll;

CREATE TABLE course_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT,
  professor_id INT,
  titulli VARCHAR(200),
  file_url VARCHAR(500),
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (professor_id) REFERENCES professors(id)
);

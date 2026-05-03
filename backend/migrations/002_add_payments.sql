USE ef_enroll;

ALTER TABLE courses
  ADD COLUMN cmimi DECIMAL(10,2) DEFAULT 0.00;

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT,
  amount DECIMAL(10,2) NOT NULL,
  statusi VARCHAR(50) DEFAULT 'paid',
  payment_method VARCHAR(50) DEFAULT 'simulated',
  data_pageses TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
);

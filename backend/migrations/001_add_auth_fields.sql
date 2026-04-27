USE ef_enroll;

ALTER TABLE users
  ADD COLUMN role ENUM('admin', 'professor', 'student') NOT NULL DEFAULT 'student',
  ADD COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending';

UPDATE users
SET status = 'approved'
WHERE status = 'pending';

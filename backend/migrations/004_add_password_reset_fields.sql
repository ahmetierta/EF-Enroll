USE ef_enroll;

ALTER TABLE users
  ADD COLUMN reset_password_token VARCHAR(64) NULL,
  ADD COLUMN reset_password_expires TIMESTAMP NULL;

USE dental_clinic;

INSERT INTO roles (name) VALUES
  ('Admin'),
  ('Subadmin'),
  ('Client');

INSERT INTO users (name, email, password, phone, role_id, status) VALUES
  ('System Administrator', 'admin@dentalclinic.com', '$2a$10$wYf9Kz6ImjP8PplxWgD0s.8Yq3kldQ7mL3Vq0mY6I0QY0r8tJt7aK', '+1234567890', 1, 'active'),
  ('Dr. Sarah Collins', 'subadmin@dentalclinic.com', '$2a$10$wYf9Kz6ImjP8PplxWgD0s.8Yq3kldQ7mL3Vq0mY6I0QY0r8tJt7aK', '+1234567891', 2, 'active'),
  ('Mina Patel', 'client@dentalclinic.com', '$2a$10$wYf9Kz6ImjP8PplxWgD0s.8Yq3kldQ7mL3Vq0mY6I0QY0r8tJt7aK', '+1234567892', 3, 'active');

INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, created_by) VALUES
  ('John', 'Smith', 'john@example.com', '+12223334444', '1985-04-12', 'Male', '123 Main St', 1),
  ('Emily', 'Johnson', 'emily@example.com', '+12223335555', '1992-08-20', 'Female', '456 Oak Ave', 2);

INSERT INTO appointments (patient_id, client_user_id, title, appointment_date, status, notes, created_by, approved_by) VALUES
  (1, 3, 'Dental Cleaning', '2026-07-03 10:00:00', 'Pending', 'Routine cleaning', 1, 1),
  (2, NULL, 'Root Canal Consultation', '2026-07-05 14:30:00', 'Approved', 'Needs follow-up', 2, 2);

INSERT INTO inventory (item_name, category, quantity, unit_price, supplier, date_added) VALUES
  ('Dental Mirror', 'Tools', 4, 15.50, 'MedSupply', '2026-06-01'),
  ('Anesthetic', 'Medication', 20, 45.00, 'PharmaCare', '2026-06-05'),
  ('Gloves', 'Supplies', 100, 7.25, 'MedSupply', '2026-06-10');

INSERT INTO settings (setting_key, setting_value, description) VALUES
  ('clinic_name', 'BrightSmile Dental Clinic', 'Clinic display name'),
  ('dark_mode', 'true', 'Enable dark mode by default'),
  ('email_notifications', 'true', 'Enable email reminders'),
  ('sms_notifications', 'true', 'Enable SMS reminders');

-- ========================================
-- DATABASE: athi_river_sda
-- ========================================
USE athi_river_sda;

-- Users table (admins)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor', 'viewer') DEFAULT 'editor',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sermons table
CREATE TABLE IF NOT EXISTS sermons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  speaker VARCHAR(100) NOT NULL,
  scripture VARCHAR(100),
  description TEXT,
  audio_url VARCHAR(500),
  video_url VARCHAR(500),
  date DATE NOT NULL,
  duration INT,
  downloads INT DEFAULT 0,
  views INT DEFAULT 0,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATETIME NOT NULL,
  end_date DATETIME,
  location VARCHAR(255),
  is_recurring BOOLEAN DEFAULT 0,
  recurrence_rule TEXT,
  image_url VARCHAR(500),
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Ministries table
CREATE TABLE IF NOT EXISTS ministries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  leader VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  meeting_day VARCHAR(20),
  meeting_time VARCHAR(20),
  description TEXT,
  image_url VARCHAR(500),
  sort_order INT DEFAULT 0
);

-- Prayer requests
CREATE TABLE IF NOT EXISTS prayer_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  request TEXT NOT NULL,
  is_public BOOLEAN DEFAULT 0,
  is_answered BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Church settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT,
  updated_by INT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Media library
CREATE TABLE IF NOT EXISTS media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size INT,
  url VARCHAR(500) NOT NULL,
  uploaded_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(20),
  table_name VARCHAR(50),
  record_id INT,
  details TEXT,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- Default settings
-- ========================================
INSERT INTO settings (`key`, `value`) VALUES
('church_name', 'Athi River East SDA Church'),
('church_address', 'Next to East Gate Mall, Athi River, Kenya'),
('church_phone', '+254 712 345 678'),
('church_email', 'info@athirivereastsda.or.ke'),
('sabbath_school_time', '08:30 AM'),
('divine_service_time', '09:30 AM'),
('vespers_time', '05:30 PM'),
('ay_time', '04:00 PM'),
('paybill_number', '803300'),
('paybill_account', 'ATHI RIVER EAST'),
('welcome_message', 'Karibu to Athi River East SDA Church!')
ON DUPLICATE KEY UPDATE value = VALUES(value);
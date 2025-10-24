CREATE DATABASE IF NOT EXISTS frontdash CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE frontdash;

CREATE TABLE login_credentials (
  username VARCHAR(100) PRIMARY KEY,
  password_hash CHAR(64) NOT NULL,
  role ENUM('ADMIN','STAFF','RESTAURANT') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE address (
  address_id INT AUTO_INCREMENT PRIMARY KEY,
  building_number VARCHAR(20) NOT NULL,
  street_name VARCHAR(200) NOT NULL,
  unit_number VARCHAR(50),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(20)
) ENGINE=InnoDB;

CREATE TABLE phone_number (
  phone_id INT AUTO_INCREMENT PRIMARY KEY,
  owner_type ENUM('RESTAURANT','CONTACT') NOT NULL,
  owner_key VARCHAR(200) NOT NULL,
  phone CHAR(10) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE restaurant_registration (
  reg_id INT AUTO_INCREMENT PRIMARY KEY,
  rest_name VARCHAR(150) NOT NULL,
  picture VARCHAR(500),
  address_id INT NOT NULL,
  contact_person VARCHAR(120) NOT NULL,
  contact_email VARCHAR(120) NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  status_changed_at TIMESTAMP,
  UNIQUE KEY uq_reg_rest_name (rest_name),
  FOREIGN KEY (address_id) REFERENCES address(address_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE restaurant (
  rest_name VARCHAR(150) PRIMARY KEY,
  picture VARCHAR(500),
  address_id INT NOT NULL,
  contact_person VARCHAR(120) NOT NULL,
  contact_email VARCHAR(120) NOT NULL,
  username VARCHAR(100) UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (address_id) REFERENCES address(address_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (username) REFERENCES login_credentials(username)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE hours (
  hours_id INT AUTO_INCREMENT PRIMARY KEY,
  rest_name VARCHAR(150) NOT NULL,
  day_of_week ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (rest_name) REFERENCES restaurant(rest_name)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE restaurant_withdrawal (
  withdraw_id INT AUTO_INCREMENT PRIMARY KEY,
  rest_name VARCHAR(150) NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('PENDING','APPROVED','DENIED') NOT NULL DEFAULT 'PENDING',
  status_note VARCHAR(500),
  status_changed_at TIMESTAMP,
  FOREIGN KEY (rest_name) REFERENCES restaurant(rest_name)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE menu_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  rest_name VARCHAR(150) NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  item_description TEXT,
  item_price DECIMAL(10,2) NOT NULL,
  item_picture VARCHAR(500),
  availability ENUM('AVAILABLE','UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
  UNIQUE KEY uq_menu_item_per_rest (rest_name, item_name),
  FOREIGN KEY (rest_name) REFERENCES restaurant(rest_name)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE staff (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  employment_status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (username) REFERENCES login_credentials(username)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE driver (
  driver_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_name VARCHAR(150) NOT NULL UNIQUE,
  employment_status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  availability ENUM('OPEN','BUSY') NOT NULL DEFAULT 'OPEN',
  hired_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE orders (
  order_number INT AUTO_INCREMENT PRIMARY KEY,
  rest_name VARCHAR(150) NOT NULL,
  order_date_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('QUEUED','PROCESSING','DRIVER_ASSIGNED','OUT_FOR_DELIVERY','DELIVERED','CANCELED','REJECTED_PAYMENT')
    NOT NULL DEFAULT 'QUEUED',
  staff_id_claimed INT,
  driver_id INT,
  estimated_delivery_time DATETIME,
  delivery_date_time DATETIME,
  subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tip_amount DECIMAL(10,2),
  service_charge DECIMAL(10,2),
  grand_total DECIMAL(10,2),
  FOREIGN KEY (rest_name) REFERENCES restaurant(rest_name)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (staff_id_claimed) REFERENCES staff(staff_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (driver_id) REFERENCES driver(driver_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE order_delivery_address (
  order_number INT PRIMARY KEY,
  address_id INT NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_phone CHAR(10) NOT NULL,
  FOREIGN KEY (order_number) REFERENCES orders(order_number)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES address(address_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE order_items (
  order_number INT NOT NULL,
  item_id INT NOT NULL,
  item_name_at_order VARCHAR(200) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  line_subtotal DECIMAL(10,2),
  PRIMARY KEY (order_number, item_id),
  FOREIGN KEY (order_number) REFERENCES orders(order_number)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE order_payment (
  order_number INT PRIMARY KEY,
  card_type ENUM('VISA','MASTERCARD','DISCOVER','AMEX','OTHER') NOT NULL,
  card_number_hash CHAR(64) NOT NULL,
  card_last4 CHAR(4) NOT NULL,
  name_on_card VARCHAR(200) NOT NULL,
  billing_address_id INT NOT NULL,
  expiry_month TINYINT NOT NULL,
  expiry_year SMALLINT NOT NULL,
  cvv_hash CHAR(64) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at DATETIME,
  FOREIGN KEY (order_number) REFERENCES orders(order_number)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (billing_address_id) REFERENCES address(address_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;



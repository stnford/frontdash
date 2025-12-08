-- ===========================================================
--  FRONTDASH DATABASE SCHEMA  (clean rebuild)
-- ===========================================================

DROP DATABASE IF EXISTS frontdash;
CREATE DATABASE frontdash CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE frontdash;

-- -----------------------------------------------------------
-- LoginCredentials
-- -----------------------------------------------------------
CREATE TABLE LoginCredentials (
  username   VARCHAR(100) PRIMARY KEY,
  password   VARCHAR(255) NOT NULL,
  userType   ENUM('Admin','Staff','Restaurant') NOT NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- Address
-- -----------------------------------------------------------
CREATE TABLE Address (
  addressID       INT AUTO_INCREMENT PRIMARY KEY,
  streetAddress1  VARCHAR(100) NOT NULL,
  streetAddress2  VARCHAR(100),
  city            VARCHAR(50),
  state           VARCHAR(50),
  zip             VARCHAR(10)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- Restaurant
-- -----------------------------------------------------------
CREATE TABLE Restaurant (
  restName              VARCHAR(100) PRIMARY KEY,
  picture               VARCHAR(255),
  addressID             INT NOT NULL,
  contactName           VARCHAR(100),
  contactEmail          VARCHAR(100),
  contactPhone          VARCHAR(20),
  isActive              ENUM('Y','N') DEFAULT 'Y',
  approvalByAdminStatus ENUM('Approved','Pending','Rejected') DEFAULT 'Pending',
  pendingWithdraw       ENUM('Y','N') DEFAULT 'N',
  FOREIGN KEY (addressID) REFERENCES Address(addressID)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- Hours
-- -----------------------------------------------------------
CREATE TABLE Hours (
  hoursID       INT AUTO_INCREMENT PRIMARY KEY,
  dayOfWeek     ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
  openTime      TIME,
  closeTime     TIME,
  isClosed      ENUM('Y','N') DEFAULT 'N'
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- RestaurantToHours (Link Table)
-- -----------------------------------------------------------
CREATE TABLE RestaurantToHours (
  restName VARCHAR(100),
  hoursID  INT,
  PRIMARY KEY (restName, hoursID),
  FOREIGN KEY (restName) REFERENCES Restaurant(restName),
  FOREIGN KEY (hoursID)  REFERENCES Hours(hoursID)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- MenuItems
-- -----------------------------------------------------------
CREATE TABLE MenuItems (
  itemID          INT AUTO_INCREMENT PRIMARY KEY,
  itemName        VARCHAR(100) NOT NULL,
  itemDescription VARCHAR(255),
  itemPrice       DECIMAL(8,2) NOT NULL,
  itemPicture     VARCHAR(255),
  isAvailable     ENUM('Y','N') DEFAULT 'Y'
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- RestaurantToMenu (Link Table)
-- -----------------------------------------------------------
CREATE TABLE RestaurantToMenu (
  restName VARCHAR(100),
  itemID   INT,
  PRIMARY KEY (restName, itemID),
  FOREIGN KEY (restName) REFERENCES Restaurant(restName),
  FOREIGN KEY (itemID)   REFERENCES MenuItems(itemID)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- Driver
-- -----------------------------------------------------------
CREATE TABLE Driver (
  driverName        VARCHAR(100) PRIMARY KEY,
  employementStatus ENUM('Active','Inactive') DEFAULT 'Active',
  isAvailable       ENUM('Busy','Open') DEFAULT 'Open'
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- Staff
-- -----------------------------------------------------------
CREATE TABLE Staff (
  username          VARCHAR(100) PRIMARY KEY,
  firstName         VARCHAR(100),
  lastName          VARCHAR(100),
  employementStatus ENUM('Active','Inactive') DEFAULT 'Active',
  FOREIGN KEY (username) REFERENCES LoginCredentials(username)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- Orders
-- -----------------------------------------------------------
CREATE TABLE Orders (
  orderNumber     INT AUTO_INCREMENT PRIMARY KEY,
  restName        VARCHAR(100) NOT NULL,
  driverName      VARCHAR(100),
  orderDate       DATE NOT NULL,
  orderTime       TIME NOT NULL,
  subtotalAmount  DECIMAL(8,2) DEFAULT 0.00,
  serviceCharge   DECIMAL(8,2) DEFAULT 0.00,
  tipAmount       DECIMAL(8,2) DEFAULT 0.00,
  grandTotal      DECIMAL(8,2) DEFAULT 0.00,
  orderStatus     ENUM('In Progress','AssignedDriver','Delivered') DEFAULT 'In Progress',
  deliveryDate    DATE,
  deliveryTime    TIME,
  FOREIGN KEY (restName)   REFERENCES Restaurant(restName),
  FOREIGN KEY (driverName) REFERENCES Driver(driverName)
) ENGINE=InnoDB;

-- Keep totals consistent whenever order rows change
DELIMITER $$
CREATE TRIGGER before_orders_insert
BEFORE INSERT ON Orders
FOR EACH ROW
BEGIN
  SET NEW.serviceCharge = ROUND(NEW.subtotalAmount * 0.0825, 2);
  SET NEW.grandTotal   = ROUND(NEW.subtotalAmount + NEW.serviceCharge + IFNULL(NEW.tipAmount,0), 2);
END$$

CREATE TRIGGER before_orders_update
BEFORE UPDATE ON Orders
FOR EACH ROW
BEGIN
  SET NEW.serviceCharge = ROUND(NEW.subtotalAmount * 0.0825, 2);
  SET NEW.grandTotal   = ROUND(NEW.subtotalAmount + NEW.serviceCharge + IFNULL(NEW.tipAmount,0), 2);
END$$
DELIMITER ;

-- -----------------------------------------------------------
-- OrderToItems
-- -----------------------------------------------------------
CREATE TABLE OrderToItems (
  orderNumber  INT,
  itemID       INT,
  quantity     INT DEFAULT 1,
  lineSubtotal DECIMAL(8,2),
  PRIMARY KEY (orderNumber, itemID),
  FOREIGN KEY (orderNumber) REFERENCES Orders(orderNumber),
  FOREIGN KEY (itemID)      REFERENCES MenuItems(itemID)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- OrderDeliveryAddress
-- -----------------------------------------------------------
CREATE TABLE OrderDeliveryAddress (
  orderNumber  INT PRIMARY KEY,
  addressID    INT NOT NULL,
  contactName  VARCHAR(100),
  contactPhone VARCHAR(20),
  FOREIGN KEY (orderNumber) REFERENCES Orders(orderNumber),
  FOREIGN KEY (addressID)   REFERENCES Address(addressID)
) ENGINE=InnoDB;
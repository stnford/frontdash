USE frontdash;

-- Drop first (idempotent)
DROP PROCEDURE IF EXISTS proc_login_staff;
DROP PROCEDURE IF EXISTS proc_login_restaurant;
DROP PROCEDURE IF EXISTS proc_create_order;
DROP PROCEDURE IF EXISTS proc_assign_driver;
DROP PROCEDURE IF EXISTS proc_set_delivery_time;
DROP PROCEDURE IF EXISTS proc_create_staff;
DROP PROCEDURE IF EXISTS proc_set_staff_status;
DROP PROCEDURE IF EXISTS proc_create_driver;
DROP PROCEDURE IF EXISTS proc_set_driver_status;
DROP PROCEDURE IF EXISTS proc_owner_update_menu_item;
DROP PROCEDURE IF EXISTS proc_owner_update_hours;
DROP PROCEDURE IF EXISTS proc_request_restaurant_registration;
DROP PROCEDURE IF EXISTS proc_admin_set_restaurant_approval;
DROP PROCEDURE IF EXISTS proc_request_withdrawal;
DROP PROCEDURE IF EXISTS proc_admin_set_withdrawal;
DROP PROCEDURE IF EXISTS proc_list_restaurants;
DROP PROCEDURE IF EXISTS proc_list_staff;
DROP PROCEDURE IF EXISTS proc_list_drivers;
DROP PROCEDURE IF EXISTS proc_list_orders;
DROP PROCEDURE IF EXISTS proc_get_order_summary;

DELIMITER $$

-- 1) Staff login (returns 1 when valid + active)
CREATE PROCEDURE proc_login_staff(
  IN  p_username VARCHAR(100),
  IN  p_password VARCHAR(255),
  OUT p_ok       TINYINT
)
BEGIN
  SELECT COUNT(*) INTO p_ok
  FROM LoginCredentials lc
  JOIN Staff s ON s.username = lc.username
  WHERE lc.username = p_username
    AND lc.password = p_password
    AND lc.userType = 'Staff'
    AND s.employementStatus = 'Active';
END$$

-- 2) Restaurant owner login (returns 1 when valid)
CREATE PROCEDURE proc_login_restaurant(
  IN  p_username VARCHAR(100),
  IN  p_password VARCHAR(255),
  OUT p_ok       TINYINT
)
BEGIN
  SELECT COUNT(*) INTO p_ok
  FROM LoginCredentials
  WHERE username = p_username
    AND password = p_password
    AND userType = 'Restaurant';
END$$

-- 3) Create a new order for a restaurant
CREATE PROCEDURE proc_create_order(
  IN  p_restName    VARCHAR(100),
  OUT p_orderNumber INT
)
BEGIN
  INSERT INTO Orders(restName, orderDate, orderTime, subtotalAmount, tipAmount, orderStatus)
  VALUES (p_restName, CURDATE(), CURTIME(), 0.00, 0.00, 'In Progress');
  SET p_orderNumber = LAST_INSERT_ID();
END$$

-- 4) Assign a driver: set new driver Busy, free any previous driver
CREATE PROCEDURE proc_assign_driver(
  IN p_orderNumber INT,
  IN p_driverName  VARCHAR(100)
)
BEGIN
  DECLARE v_oldDriver VARCHAR(100);

  SELECT driverName INTO v_oldDriver
  FROM Orders WHERE orderNumber = p_orderNumber;

  IF v_oldDriver IS NOT NULL AND v_oldDriver <> '' THEN
    UPDATE Driver SET isAvailable='Open' WHERE driverName=v_oldDriver;
  END IF;

  UPDATE Driver SET isAvailable='Busy' WHERE driverName=p_driverName;

  UPDATE Orders
     SET driverName = p_driverName,
         orderStatus = 'AssignedDriver'
   WHERE orderNumber = p_orderNumber;
END$$

-- 5) Set delivery time: mark Delivered and free driver
CREATE PROCEDURE proc_set_delivery_time(
  IN p_orderNumber INT,
  IN p_date DATE,
  IN p_time TIME
)
BEGIN
  DECLARE v_driver VARCHAR(100);

  SELECT driverName INTO v_driver
  FROM Orders WHERE orderNumber = p_orderNumber;

  UPDATE Orders
     SET deliveryDate = p_date,
         deliveryTime = p_time,
         orderStatus  = 'Delivered'
   WHERE orderNumber = p_orderNumber;

  IF v_driver IS NOT NULL AND v_driver <> '' THEN
    UPDATE Driver SET isAvailable='Open' WHERE driverName=v_driver;
  END IF;
END$$

-- 6) Create staff account (active)
CREATE PROCEDURE proc_create_staff(
  IN p_username  VARCHAR(100),
  IN p_password  VARCHAR(255),
  IN p_firstName VARCHAR(100),
  IN p_lastName  VARCHAR(100)
)
BEGIN
  INSERT INTO LoginCredentials(username, password, userType)
  VALUES (p_username, p_password, 'Staff');

  INSERT INTO Staff(username, firstName, lastName, employementStatus)
  VALUES (p_username, p_firstName, p_lastName, 'Active');
END$$

-- 7) Inactivate / reactivate staff
CREATE PROCEDURE proc_set_staff_status(
  IN p_username VARCHAR(100),
  IN p_status   ENUM('Active','Inactive')
)
BEGIN
  UPDATE Staff
     SET employementStatus = p_status
   WHERE username = p_username;
END$$

-- 8) Create driver (active, open)
CREATE PROCEDURE proc_create_driver(
  IN p_driverName VARCHAR(100)
)
BEGIN
  INSERT INTO Driver(driverName, employementStatus, isAvailable)
  VALUES (p_driverName, 'Active', 'Open');
END$$

-- 9) Inactivate / reactivate driver
CREATE PROCEDURE proc_set_driver_status(
  IN p_driverName VARCHAR(100),
  IN p_status     ENUM('Active','Inactive')
)
BEGIN
  UPDATE Driver
     SET employementStatus = p_status
   WHERE driverName = p_driverName;
END$$

-- 10) Owner modifies a linked menu item
CREATE PROCEDURE proc_owner_update_menu_item(
  IN p_restName     VARCHAR(100),
  IN p_itemID       INT,
  IN p_itemName     VARCHAR(100),
  IN p_itemDesc     VARCHAR(255),
  IN p_itemPrice    DECIMAL(8,2),
  IN p_isAvailable  ENUM('Y','N')
)
BEGIN
  IF EXISTS (SELECT 1 FROM RestaurantToMenu WHERE restName=p_restName AND itemID=p_itemID) THEN
    UPDATE MenuItems
       SET itemName        = p_itemName,
           itemDescription = p_itemDesc,
           itemPrice       = p_itemPrice,
           isAvailable     = p_isAvailable
     WHERE itemID = p_itemID;
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Item not linked to this restaurant';
  END IF;
END$$

-- 11) Owner upserts operating hours for a day
CREATE PROCEDURE proc_owner_update_hours(
  IN p_restName  VARCHAR(100),
  IN p_dayOfWeek ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
  IN p_openTime  TIME,
  IN p_closeTime TIME,
  IN p_isClosed  ENUM('Y','N')
)
BEGIN
  DECLARE v_hoursID INT;

  SELECT h.hoursID INTO v_hoursID
  FROM RestaurantToHours rth
  JOIN Hours h ON h.hoursID=rth.hoursID
  WHERE rth.restName=p_restName AND h.dayOfWeek=p_dayOfWeek
  LIMIT 1;

  IF v_hoursID IS NULL THEN
    INSERT INTO Hours(dayOfWeek, openTime, closeTime, isClosed)
    VALUES (p_dayOfWeek, p_openTime, p_closeTime, p_isClosed);
    SET v_hoursID = LAST_INSERT_ID();
    INSERT INTO RestaurantToHours(restName, hoursID) VALUES (p_restName, v_hoursID);
  ELSE
    UPDATE Hours
       SET openTime=p_openTime, closeTime=p_closeTime, isClosed=p_isClosed
     WHERE hoursID=v_hoursID;
  END IF;
END$$

-- 12) New restaurant registration request (Pending, not active)
CREATE PROCEDURE proc_request_restaurant_registration(
  IN p_restName     VARCHAR(100),
  IN p_addressID    INT,
  IN p_contactName  VARCHAR(100),
  IN p_contactEmail VARCHAR(100),
  IN p_contactPhone VARCHAR(20)
)
BEGIN
  INSERT INTO Restaurant(
    restName,addressID,contactName,contactEmail,contactPhone,
    isActive,approvalByAdminStatus,pendingWithdraw
  ) VALUES (
    p_restName,p_addressID,p_contactName,p_contactEmail,p_contactPhone,
    'N','Pending','N'
  );
END$$

-- 13) Admin approves/rejects registration
CREATE PROCEDURE proc_admin_set_restaurant_approval(
  IN p_restName VARCHAR(100),
  IN p_decision ENUM('Approved','Rejected')
)
BEGIN
  UPDATE Restaurant
     SET approvalByAdminStatus = p_decision,
         isActive = CASE WHEN p_decision='Approved' THEN 'Y' ELSE 'N' END
   WHERE restName = p_restName;
END$$

-- 14) Owner requests withdrawal (mark pending)
CREATE PROCEDURE proc_request_withdrawal(
  IN p_restName VARCHAR(100)
)
BEGIN
  UPDATE Restaurant
     SET pendingWithdraw = 'Y'
   WHERE restName = p_restName;
END$$

-- 15) Admin resolves withdrawal (approve -> inactivate)
CREATE PROCEDURE proc_admin_set_withdrawal(
  IN p_restName VARCHAR(100),
  IN p_decision ENUM('Approved','Rejected')
)
BEGIN
  UPDATE Restaurant
     SET pendingWithdraw = 'N',
         isActive = CASE WHEN p_decision='Approved' THEN 'N' ELSE isActive END
   WHERE restName = p_restName;
END$$

-- 16) List restaurants (includePending/includeInactive as 0/1 flags)
CREATE PROCEDURE proc_list_restaurants(
  IN p_includePending   TINYINT UNSIGNED,
  IN p_includeInactive  TINYINT UNSIGNED
)
BEGIN
  SET p_includePending  = IFNULL(p_includePending, 0);
  SET p_includeInactive = IFNULL(p_includeInactive, 0);

  SELECT
    restName,
    isActive,
    approvalByAdminStatus,
    pendingWithdraw,
    contactName,
    contactEmail,
    contactPhone
  FROM Restaurant
  WHERE approvalByAdminStatus = 'Approved'
    AND (p_includeInactive = 1 OR isActive = 'Y')
    AND (p_includePending  = 1 OR pendingWithdraw = 'N')
  ORDER BY restName;
END$$

-- 17) Simple list helpers
CREATE PROCEDURE proc_list_staff()
BEGIN
  SELECT username, firstName, lastName, employementStatus
  FROM Staff
  ORDER BY username;
END$$

CREATE PROCEDURE proc_list_drivers()
BEGIN
  SELECT driverName, employementStatus, isAvailable
  FROM Driver
  ORDER BY driverName;
END$$

CREATE PROCEDURE proc_list_orders()
BEGIN
  SELECT orderNumber, restName, driverName, orderStatus, orderDate, orderTime,
         deliveryDate, deliveryTime, grandTotal
  FROM Orders
  ORDER BY orderNumber DESC;
END$$

-- Helper: full order view
CREATE PROCEDURE proc_get_order_summary(IN p_orderNumber INT)
BEGIN
  SELECT * FROM Orders WHERE orderNumber=p_orderNumber;
  SELECT oi.itemID, mi.itemName, mi.itemPrice, oi.quantity, oi.lineSubtotal
    FROM OrderToItems oi JOIN MenuItems mi ON mi.itemID=oi.itemID
   WHERE oi.orderNumber=p_orderNumber;
  SELECT a.* FROM OrderDeliveryAddress oda JOIN Address a ON a.addressID=oda.addressID
   WHERE oda.orderNumber=p_orderNumber;
END$$

DELIMITER ;
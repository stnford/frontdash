USE frontdash;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET collation_connection = 'utf8mb4_unicode_ci';

-- Minimal seed to ensure references exist (re-runnable)
SET @rest := 'Pasta Place';

-- Address for Pasta Place
INSERT INTO Address(streetAddress1,city,state,zip)
SELECT '10 Elm St','Dallas','TX','75201'
WHERE NOT EXISTS (SELECT 1 FROM Address WHERE streetAddress1='10 Elm St' AND city='Dallas');
SET @addr := (SELECT addressID FROM Address WHERE streetAddress1='10 Elm St' AND city='Dallas' LIMIT 1);

-- Restaurant approved & active
INSERT INTO Restaurant(restName,addressID,contactName,contactEmail,contactPhone,isActive,approvalByAdminStatus,pendingWithdraw)
SELECT @rest,@addr,'Pat Owner','owner@pasta.com','214-555-1000','Y','Approved','N'
WHERE NOT EXISTS (SELECT 1 FROM Restaurant WHERE restName=@rest);

-- Menu items + link
INSERT INTO MenuItems(itemName,itemDescription,itemPrice,isAvailable)
SELECT 'Spaghetti','Pasta w/ sauce',12.50,'Y'
WHERE NOT EXISTS (SELECT 1 FROM MenuItems WHERE itemName='Spaghetti');
INSERT INTO MenuItems(itemName,itemDescription,itemPrice,isAvailable)
SELECT 'Salad','House salad',7.25,'Y'
WHERE NOT EXISTS (SELECT 1 FROM MenuItems WHERE itemName='Salad');

SET @itemSpag := (SELECT itemID FROM MenuItems WHERE itemName='Spaghetti' LIMIT 1);
SET @itemSal  := (SELECT itemID FROM MenuItems WHERE itemName='Salad'     LIMIT 1);

INSERT IGNORE INTO RestaurantToMenu(restName,itemID) VALUES
(@rest,@itemSpag),(@rest,@itemSal);

-- Staff (jim/x) and Owner (owner1/pw)
INSERT INTO LoginCredentials(username,password,userType)
SELECT 'jim','x','Staff'
WHERE NOT EXISTS (SELECT 1 FROM LoginCredentials WHERE username='jim');
INSERT INTO Staff(username,firstName,lastName,employementStatus)
SELECT 'jim','JimBob','Jones','Active'
WHERE NOT EXISTS (SELECT 1 FROM Staff WHERE username='jim');

INSERT INTO LoginCredentials(username,password,userType)
SELECT 'owner1','pw','Restaurant'
WHERE NOT EXISTS (SELECT 1 FROM LoginCredentials WHERE username='owner1');

-- Driver (Alex Rider)
INSERT INTO Driver(driverName,employementStatus,isAvailable)
SELECT 'Alex Rider','Active','Open'
WHERE NOT EXISTS (SELECT 1 FROM Driver WHERE driverName='Alex Rider');

-- ========== DEMO START ==========

-- Successful login by a staff member
SET @ok := 0; CALL proc_login_staff('jim','x',@ok);        SELECT 'Staff login OK' AS step, @ok AS ok;

-- Invalid login by a staff member
SET @ok := 0; CALL proc_login_staff('jim','wrong',@ok);    SELECT 'Staff login INVALID' AS step, @ok AS ok;

-- A new order is created and saved
SET @ord := NULL; CALL proc_create_order(@rest, @ord);      SELECT 'New order' AS step, @ord AS orderNumber; CALL proc_get_order_summary(@ord);

-- Existing order: assign a driver and save
CALL proc_assign_driver(@ord,'Alex Rider');                 SELECT 'Assigned driver' AS step; CALL proc_get_order_summary(@ord);

-- Existing order: set delivery time and save
CALL proc_set_delivery_time(@ord, CURDATE(), ADDTIME(CURTIME(),'00:45:00'));
SELECT 'Set delivery time' AS step; CALL proc_get_order_summary(@ord);

-- A new staff member account is created and saved
CALL proc_create_staff('sarah','pw','Sarah','Lee');
SELECT 'Created staff' AS step; SELECT username,employementStatus FROM Staff WHERE username='sarah';

-- Staff member account is inactivated
CALL proc_set_staff_status('sarah','Inactive');
SELECT 'Staff inactivated' AS step; SELECT username,employementStatus FROM Staff WHERE username='sarah';

-- A new driver record added to the system
CALL proc_create_driver('Blake Trent');
SELECT 'Driver created' AS step; SELECT driverName,employementStatus FROM Driver WHERE driverName='Blake Trent';

-- A driver record is inactivated
CALL proc_set_driver_status('Blake Trent','Inactive');
SELECT 'Driver inactivated' AS step; SELECT driverName,employementStatus FROM Driver WHERE driverName='Blake Trent';

-- ===== Additional (regular students) =====

-- Successful login by a restaurant owner
SET @ok := 0; CALL proc_login_restaurant('owner1','pw',@ok);    SELECT 'Owner login OK' AS step, @ok AS ok;

-- Invalid login by a restaurant owner
SET @ok := 0; CALL proc_login_restaurant('owner1','nope',@ok);  SELECT 'Owner login INVALID' AS step, @ok AS ok;

-- Owner modifies a menu item and saves
CALL proc_owner_update_menu_item(@rest, @itemSpag, 'Spaghetti','Pasta w/ sauce', 13.25, 'Y');
SELECT 'Owner updated menu' AS step; SELECT itemID,itemName,itemPrice FROM MenuItems WHERE itemID=@itemSpag;

-- Owner modifies operating hours and saves (Monday 10–20)
CALL proc_owner_update_hours(@rest,'Mon','10:00:00','20:00:00','N');
SELECT 'Owner updated hours' AS step;
SELECT h.dayOfWeek,h.openTime,h.closeTime,h.isClosed
FROM RestaurantToHours rth JOIN Hours h ON h.hoursID=rth.hoursID
WHERE rth.restName=@rest AND h.dayOfWeek='Mon';

-- New restaurant registration request is created and saved
INSERT INTO Address(streetAddress1,city,state,zip)
SELECT '22 Oak St','Dallas','TX','75202'
WHERE NOT EXISTS (SELECT 1 FROM Address WHERE streetAddress1='22 Oak St' AND city='Dallas');
SET @addr2 := (SELECT addressID FROM Address WHERE streetAddress1='22 Oak St' AND city='Dallas' LIMIT 1);

CALL proc_request_restaurant_registration('New Bistro', @addr2, 'Nina', 'nina@bistro.com', '214-555-2000');
SELECT 'Registration requested' AS step; SELECT restName,approvalByAdminStatus,isActive FROM Restaurant WHERE restName='New Bistro';

-- Administrator approves a restaurant registration request
CALL proc_admin_set_restaurant_approval('New Bistro','Approved');
SELECT 'Registration approved' AS step; SELECT restName,approvalByAdminStatus,isActive FROM Restaurant WHERE restName='New Bistro';

-- A restaurant withdrawal request is created and saved
CALL proc_request_withdrawal(@rest);
SELECT 'Withdrawal requested' AS step; SELECT restName,pendingWithdraw FROM Restaurant WHERE restName=@rest;

-- Administrator rejects a restaurant withdrawal request
CALL proc_admin_set_withdrawal(@rest,'Rejected');
SELECT 'Withdrawal rejected' AS step; SELECT restName,pendingWithdraw,isActive FROM Restaurant WHERE restName=@rest;
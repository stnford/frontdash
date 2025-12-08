USE frontdash;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET collation_connection = 'utf8mb4_unicode_ci';

-- ---------- minimal seed (re-runnable) ----------
SET @rest := 'Pasta Place';

-- Address + restaurant
INSERT INTO Address(streetAddress1,city,state,zip)
SELECT '10 Elm St','Dallas','TX','75201'
WHERE NOT EXISTS (SELECT 1 FROM Address WHERE streetAddress1='10 Elm St' AND city='Dallas');
SET @addr := (SELECT addressID FROM Address WHERE streetAddress1='10 Elm St' AND city='Dallas' LIMIT 1);

INSERT INTO Restaurant(restName,addressID,contactName,contactEmail,contactPhone,isActive,approvalByAdminStatus,pendingWithdraw)
SELECT @rest,@addr,'Pat Owner','owner@pasta.com','214-555-1000','Y','Approved','N'
WHERE NOT EXISTS (SELECT 1 FROM Restaurant WHERE restName=@rest);

-- Menu + mapping
INSERT INTO MenuItems(itemName,itemDescription,itemPrice,isAvailable)
SELECT 'Spaghetti','Pasta w/ sauce',12.50,'Y'
WHERE NOT EXISTS (SELECT 1 FROM MenuItems WHERE itemName='Spaghetti');
INSERT INTO MenuItems(itemName,itemDescription,itemPrice,isAvailable)
SELECT 'Salad','House salad',7.25,'Y'
WHERE NOT EXISTS (SELECT 1 FROM MenuItems WHERE itemName='Salad');

SET @itemSpag := (SELECT itemID FROM MenuItems WHERE itemName='Spaghetti' LIMIT 1);
SET @itemSal  := (SELECT itemID FROM MenuItems WHERE itemName='Salad'     LIMIT 1);
INSERT IGNORE INTO RestaurantToMenu(restName,itemID) VALUES (@rest,@itemSpag),(@rest,@itemSal);

-- Staff + owner
INSERT INTO LoginCredentials(username,password,userType)
SELECT 'jim','x','Staff'
WHERE NOT EXISTS (SELECT 1 FROM LoginCredentials WHERE username='jim');
INSERT INTO Staff(username,firstName,lastName,employementStatus)
SELECT 'jim','JimBob','Jones','Active'
WHERE NOT EXISTS (SELECT 1 FROM Staff WHERE username='jim');

INSERT INTO LoginCredentials(username,password,userType)
SELECT 'owner1','pw','Restaurant'
WHERE NOT EXISTS (SELECT 1 FROM LoginCredentials WHERE username='owner1');

-- Driver
INSERT INTO Driver(driverName,employementStatus,isAvailable)
SELECT 'Alex Rider','Active','Open'
WHERE NOT EXISTS (SELECT 1 FROM Driver WHERE driverName='Alex Rider');

-- ---------- DEMO START ----------

-- 1) Staff login (OK and invalid)
SET @ok := 0; CALL proc_login_staff('jim','x',@ok);
SELECT 'Staff login (expected OK)' AS section, 'jim' AS username, @ok AS ok_flag;

SET @ok := 0; CALL proc_login_staff('jim','wrong',@ok);
SELECT 'Staff login (expected INVALID)' AS section, 'jim/wrong' AS username, @ok AS ok_flag;

-- 2) Create a new order
SET @ord := NULL; CALL proc_create_order(@rest, @ord);
SELECT 'New order created' AS section, @ord AS orderNumber;
CALL proc_get_order_summary(@ord);

-- 3) Retrieve most recent order for this restaurant
SET @existing := (SELECT MAX(orderNumber) FROM Orders WHERE restName=@rest);
SELECT 'Retrieved existing order' AS section, @existing AS orderNumber;
CALL proc_get_order_summary(@existing);

-- 4) Assign a driver (driver becomes Busy)
CALL proc_assign_driver(@existing,'Alex Rider');
SELECT 'After assign driver' AS section; 
CALL proc_get_order_summary(@existing);
SELECT 'Driver status (Alex Rider should be Busy)' AS section, driverName,isAvailable FROM Driver WHERE driverName='Alex Rider';

-- 5) Set delivery time (driver becomes Open again)
CALL proc_set_delivery_time(@existing, CURDATE(), ADDTIME(CURTIME(),'00:45:00'));
SELECT 'After set delivery time (driver should be Open again)' AS section;
CALL proc_get_order_summary(@existing);
SELECT driverName,isAvailable FROM Driver WHERE driverName='Alex Rider';

-- 6) Create + inactivate staff
CALL proc_create_staff('sarah','pw','Sarah','Lee');
SELECT 'Created staff' AS section; 
SELECT username,employementStatus FROM Staff WHERE username='sarah';

CALL proc_set_staff_status('sarah','Inactive');
SELECT 'Staff inactivated' AS section; 
SELECT username,employementStatus FROM Staff WHERE username='sarah';

-- 7) Add + inactivate driver
CALL proc_create_driver('Blake Trent');
SELECT 'Driver created' AS section; 
SELECT driverName,employementStatus,isAvailable FROM Driver WHERE driverName='Blake Trent';

CALL proc_set_driver_status('Blake Trent','Inactive');
SELECT 'Driver inactivated' AS section; 
SELECT driverName,employementStatus,isAvailable FROM Driver WHERE driverName='Blake Trent';

-- 8) Owner login (OK and invalid)
SET @ok := 0; CALL proc_login_restaurant('owner1','pw',@ok);
SELECT 'Owner login (expected OK)' AS section, 'owner1' AS username, @ok AS ok_flag;

SET @ok := 0; CALL proc_login_restaurant('owner1','nope',@ok);
SELECT 'Owner login (expected INVALID)' AS section, 'owner1/nope' AS username, @ok AS ok_flag;

-- 9) Owner modifies a menu item
CALL proc_owner_update_menu_item(@rest, @itemSpag, 'Spaghetti','Pasta w/ sauce', 13.25, 'Y');
SELECT 'Owner updated menu' AS section; 
SELECT itemID,itemName,itemPrice FROM MenuItems WHERE itemID=@itemSpag;

-- 10) Owner modifies hours: update Mon and add Sun
CALL proc_owner_update_hours(@rest,'Mon','10:00:00','20:00:00','N');
CALL proc_owner_update_hours(@rest,'Sun','11:00:00','22:00:00','N');
SELECT 'Owner updated hours' AS section;
SELECT h.hoursID,h.dayOfWeek,h.openTime,h.closeTime,h.isClosed
FROM RestaurantToHours rth JOIN Hours h ON h.hoursID=rth.hoursID
WHERE rth.restName=@rest ORDER BY FIELD(h.dayOfWeek,'Sun','Mon','Tue','Wed','Thu','Fri','Sat');

-- 11) Registration: one approve, one reject
INSERT INTO Address(streetAddress1,city,state,zip)
SELECT '22 Oak St','Dallas','TX','75202'
WHERE NOT EXISTS (SELECT 1 FROM Address WHERE streetAddress1='22 Oak St' AND city='Dallas');
SET @addr2 := (SELECT addressID FROM Address WHERE streetAddress1='22 Oak St' AND city='Dallas' LIMIT 1);

CALL proc_request_restaurant_registration('New Bistro', @addr2, 'Nina', 'nina@bistro.com', '214-555-2000');
SELECT 'Registration requested (New Bistro, should be Pending/N)' AS section; 
SELECT restName,isActive,approvalByAdminStatus FROM Restaurant WHERE restName='New Bistro';

CALL proc_admin_set_restaurant_approval('New Bistro','Approved');
SELECT 'Registration approved (New Bistro, now Y/Approved)' AS section; 
SELECT restName,isActive,approvalByAdminStatus FROM Restaurant WHERE restName='New Bistro';

CALL proc_request_restaurant_registration('Reject Me Cafe', @addr2, 'Rob', 'rob@reject.com', '214-555-3000');
CALL proc_admin_set_restaurant_approval('Reject Me Cafe','Rejected');
SELECT 'Registration rejected (Reject Me Cafe, N/Rejected)' AS section; 
SELECT restName,isActive,approvalByAdminStatus FROM Restaurant WHERE restName='Reject Me Cafe';

-- 12) Withdrawal: request then admin approves (becomes inactive + cleared flag)
CALL proc_request_withdrawal(@rest);
SELECT 'Withdrawal requested (Pasta Place, pendingWithdraw=Y)' AS section; 
SELECT restName,pendingWithdraw,isActive FROM Restaurant WHERE restName=@rest;

CALL proc_admin_set_withdrawal(@rest,'Approved');
SELECT 'Withdrawal approved (Pasta Place, pendingWithdraw=N, isActive=N)' AS section; 
SELECT restName,pendingWithdraw,isActive FROM Restaurant WHERE restName=@rest;

-- lists
CALL proc_list_restaurants(0,0);  -- hide pending withdrawals & inactive
CALL proc_list_staff();
CALL proc_list_drivers();
CALL proc_list_orders();
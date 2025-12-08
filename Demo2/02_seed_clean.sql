USE frontdash;

-- Make deletes easy in Workbench
SET SQL_SAFE_UPDATES = 0;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET collation_connection = 'utf8mb4_unicode_ci';

SET @rest := 'Pasta Place';

-- Clean old runs (ok if zero rows)
DELETE oda FROM OrderDeliveryAddress oda JOIN Orders o ON o.orderNumber = oda.orderNumber WHERE o.restName = @rest;
DELETE oi  FROM OrderToItems       oi  JOIN Orders o ON o.orderNumber = oi.orderNumber  WHERE o.restName = @rest;
DELETE FROM Orders WHERE restName = @rest;

DELETE rtm FROM RestaurantToMenu rtm WHERE rtm.restName = @rest;
DELETE FROM MenuItems WHERE itemName IN ('Spaghetti','Salad');

DELETE FROM Restaurant WHERE restName = @rest;
DELETE a FROM Address a LEFT JOIN Restaurant r ON r.addressID = a.addressID WHERE r.addressID IS NULL;

DELETE FROM Staff WHERE username='jim';
DELETE FROM LoginCredentials WHERE username='jim';
DELETE FROM Driver WHERE driverName='Alex Rider';

-- Seed: restaurant + address
INSERT INTO Address(streetAddress1, streetAddress2, city, state, zip)
VALUES ('10 Elm St', NULL, 'Dallas', 'TX', '75201');
SET @addr := LAST_INSERT_ID();

INSERT INTO Restaurant(restName, addressID, contactName, contactEmail, contactPhone, isActive)
VALUES (@rest, @addr, 'Pat Owner', 'owner@pasta.com', '214-555-1000', 'Y');

-- Seed: menu items + link
INSERT INTO MenuItems(itemName, itemDescription, itemPrice, itemPicture, isAvailable)
VALUES ('Spaghetti', 'Pasta w/ sauce', 12.50, NULL, 'Y'),
       ('Salad',     'House salad',     7.25,  NULL, 'Y');

SET @itemSpag := (SELECT itemID FROM MenuItems WHERE itemName='Spaghetti' LIMIT 1);
SET @itemSal  := (SELECT itemID FROM MenuItems WHERE itemName='Salad'     LIMIT 1);

INSERT INTO RestaurantToMenu(restName, itemID) VALUES
(@rest, @itemSpag), (@rest, @itemSal);

-- Seed: driver + staff
INSERT INTO Driver(driverName, employementStatus, isAvailable)
VALUES('Alex Rider', 'Active', 'Open');

INSERT INTO LoginCredentials(username, password, userType)
VALUES('jim', 'x', 'Staff');

INSERT INTO Staff(username, firstName, lastName, employementStatus)
VALUES('jim', 'JimBob', 'Jones', 'Active');

-- Show starting state (optional)
SELECT 'START Orders' AS section;               SELECT * FROM Orders ORDER BY orderNumber DESC LIMIT 5;
SELECT 'START Items'  AS section;               SELECT * FROM OrderToItems ORDER BY orderNumber DESC LIMIT 5;
SELECT 'START Addr'   AS section;               SELECT * FROM OrderDeliveryAddress ORDER BY orderNumber DESC LIMIT 5;
SELECT 'START Staff'  AS section;               SELECT username, firstName, lastName, employementStatus FROM Staff WHERE username='jim';
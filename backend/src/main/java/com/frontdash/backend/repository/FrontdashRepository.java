package com.frontdash.backend.repository;

import org.springframework.jdbc.core.ColumnMapRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Time;
import java.sql.Statement;
import java.sql.Types;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class FrontdashRepository {

    private final JdbcTemplate jdbcTemplate;
    private final SimpleJdbcCall createOrderCall;
    private final SimpleJdbcCall listRestaurantsCall;
    private final SimpleJdbcCall listStaffCall;
    private final SimpleJdbcCall listDriversCall;
    private final SimpleJdbcCall listOrdersCall;

    public FrontdashRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.createOrderCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("proc_create_order")
                .withoutProcedureColumnMetaDataAccess()
                .declareParameters(
                        new SqlParameter("p_restName", Types.VARCHAR),
                        new SqlOutParameter("p_orderNumber", Types.INTEGER)
                );
        this.listRestaurantsCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("proc_list_restaurants")
                .returningResultSet("rs", new ColumnMapRowMapper());
        this.listStaffCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("proc_list_staff")
                .returningResultSet("rs", new ColumnMapRowMapper());
        this.listDriversCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("proc_list_drivers")
                .returningResultSet("rs", new ColumnMapRowMapper());
        this.listOrdersCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("proc_list_orders")
                .returningResultSet("rs", new ColumnMapRowMapper());
    }

    public int createAddress(String street1, String street2, String city, String state, String zip) {
        KeyHolder kh = new GeneratedKeyHolder();
        jdbcTemplate.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO Address(streetAddress1, streetAddress2, city, state, zip) VALUES (?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, street1);
            ps.setString(2, street2);
            ps.setString(3, city);
            ps.setString(4, state);
            ps.setString(5, zip);
            return ps;
        }, kh);
        Number key = kh.getKey();
        return key == null ? 0 : key.intValue();
    }

    public void requestRestaurantRegistration(String restName, int addressId, String contactName, String contactEmail, String contactPhone) {
        jdbcTemplate.update("CALL proc_request_restaurant_registration(?,?,?,?,?)",
                restName, addressId, contactName, contactEmail, contactPhone);
    }

    public void setRestaurantApproval(String restName, String decision) {
        jdbcTemplate.update("CALL proc_admin_set_restaurant_approval(?,?)", restName, decision);
    }

    public void requestWithdrawal(String restName) {
        jdbcTemplate.update("CALL proc_request_withdrawal(?)", restName);
    }

    public void setWithdrawalDecision(String restName, String decision) {
        jdbcTemplate.update("CALL proc_admin_set_withdrawal(?,?)", restName, decision);
    }

    public List<Map<String, Object>> listRestaurants(boolean includePending, boolean includeInactive) {
        Map<String, Object> in = new HashMap<>();
        in.put("p_includePending", includePending ? 1 : 0);
        in.put("p_includeInactive", includeInactive ? 1 : 0);
        Map<String, Object> out = listRestaurantsCall.execute(in);
        return (List<Map<String, Object>>) out.get("rs");
    }

    public List<Map<String, Object>> listPendingRegistrations() {
        return jdbcTemplate.queryForList(
                "SELECT r.restName, r.contactName, r.contactEmail, r.contactPhone, a.streetAddress1, a.streetAddress2, a.city, a.state, a.zip " +
                        "FROM Restaurant r LEFT JOIN Address a ON a.addressID = r.addressID WHERE r.approvalByAdminStatus='Pending'");
    }

    public void createStaff(String username, String password, String firstName, String lastName) {
        jdbcTemplate.update("CALL proc_create_staff(?,?,?,?)", username, password, firstName, lastName);
    }

    public void setStaffStatus(String username, String status) {
        jdbcTemplate.update("CALL proc_set_staff_status(?,?)", username, status);
    }

    public List<Map<String, Object>> listStaff() {
        Map<String, Object> out = listStaffCall.execute();
        return (List<Map<String, Object>>) out.get("rs");
    }

    public void createDriver(String driverName) {
        jdbcTemplate.update("CALL proc_create_driver(?)", driverName);
    }

    public void setDriverStatus(String driverName, String status) {
        jdbcTemplate.update("CALL proc_set_driver_status(?,?)", driverName, status);
    }

    public List<Map<String, Object>> listDrivers() {
        Map<String, Object> out = listDriversCall.execute();
        return (List<Map<String, Object>>) out.get("rs");
    }

    public int createOrder(String restName) {
        Map<String, Object> in = new HashMap<>();
        in.put("p_restName", restName);
        Map<String, Object> out = createOrderCall.execute(in);
        Number orderNumber = (Number) out.get("p_orderNumber");
        return orderNumber == null ? 0 : orderNumber.intValue();
    }

    public int createOrderWithTotals(String restName, double subtotal, double tipAmount) {
        KeyHolder kh = new GeneratedKeyHolder();
        jdbcTemplate.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO Orders(restName, orderDate, orderTime, subtotalAmount, tipAmount, orderStatus) " +
                            "VALUES (?,?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, restName);
            ps.setDate(2, Date.valueOf(java.time.LocalDate.now()));
            ps.setTime(3, Time.valueOf(java.time.LocalTime.now()));
            ps.setDouble(4, subtotal);
            ps.setDouble(5, tipAmount);
            ps.setString(6, "In Progress");
            return ps;
        }, kh);
        Number key = kh.getKey();
        return key == null ? 0 : key.intValue();
    }

    public Map<Integer, Map<String, Object>> getMenuItemsForRestaurant(String restName, List<Integer> itemIds) {
        if (itemIds == null || itemIds.isEmpty()) {
            return Map.of();
        }
        String placeholders = itemIds.stream().map(id -> "?").collect(Collectors.joining(","));
        List<Object> params = itemIds.stream().map(id -> (Object) id).collect(Collectors.toList());
        params.add(0, restName);
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT mi.itemID, mi.itemName, mi.itemPrice " +
                        "FROM RestaurantToMenu rtm JOIN MenuItems mi ON mi.itemID = rtm.itemID " +
                        "WHERE rtm.restName = ? AND mi.itemID IN (" + placeholders + ")",
                params.toArray()
        );
        Map<Integer, Map<String, Object>> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Number id = (Number) row.get("itemID");
            if (id != null) {
                result.put(id.intValue(), row);
            }
        }
        return result;
    }

    public void addOrderItem(int orderNumber, int itemId, int quantity, double lineSubtotal) {
        jdbcTemplate.update(
                "INSERT INTO OrderToItems(orderNumber, itemID, quantity, lineSubtotal) VALUES (?,?,?,?)",
                orderNumber, itemId, quantity, lineSubtotal
        );
    }

    public void setOrderDeliveryAddress(int orderNumber, int addressId, String contactName, String contactPhone) {
        jdbcTemplate.update(
                "INSERT INTO OrderDeliveryAddress(orderNumber, addressID, contactName, contactPhone) VALUES (?,?,?,?)",
                orderNumber, addressId, contactName, contactPhone
        );
    }

    public void assignDriver(int orderNumber, String driverName) {
        jdbcTemplate.update("CALL proc_assign_driver(?,?)", orderNumber, driverName);
    }

    public void setDeliveryTime(int orderNumber, java.sql.Date date, java.sql.Time time) {
        jdbcTemplate.update("CALL proc_set_delivery_time(?,?,?)", orderNumber, date, time);
    }

    public List<Map<String, Object>> listOrders() {
        Map<String, Object> out = listOrdersCall.execute();
        return (List<Map<String, Object>>) out.get("rs");
    }

    public void updateMenuItem(String restName, int itemId, String name, String desc, double price, String isAvailable) {
        jdbcTemplate.update("CALL proc_owner_update_menu_item(?,?,?,?,?,?)",
                restName, itemId, name, desc, price, isAvailable);
    }

    public int createMenuItem(String restName, String name, String desc, double price, String isAvailable) {
        KeyHolder kh = new GeneratedKeyHolder();
        jdbcTemplate.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO MenuItems(itemName, itemDescription, itemPrice, isAvailable) VALUES (?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, name);
            ps.setString(2, desc);
            ps.setDouble(3, price);
            ps.setString(4, isAvailable);
            return ps;
        }, kh);
        Number key = kh.getKey();
        int itemId = key == null ? 0 : key.intValue();
        if (itemId > 0) {
            jdbcTemplate.update("INSERT INTO RestaurantToMenu(restName, itemID) VALUES (?,?)", restName, itemId);
        }
        return itemId;
    }

    public void updateHours(String restName, String dayOfWeek, String openTime, String closeTime, String isClosed) {
        jdbcTemplate.update("CALL proc_owner_update_hours(?,?,?,?,?)",
                restName, dayOfWeek, openTime, closeTime, isClosed);
    }

    public void deleteMenuItem(String restName, int itemId) {
        jdbcTemplate.update("DELETE FROM RestaurantToMenu WHERE restName=? AND itemID=?", restName, itemId);
        jdbcTemplate.update("DELETE FROM MenuItems WHERE itemID=?", itemId);
    }

    public Map<String, Object> getOrderSummary(int orderNumber) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> header = jdbcTemplate.queryForList(
                "SELECT * FROM Orders WHERE orderNumber=?", orderNumber);
        List<Map<String, Object>> items = jdbcTemplate.queryForList(
                "SELECT oi.itemID, mi.itemName, mi.itemPrice, oi.quantity, oi.lineSubtotal " +
                        "FROM OrderToItems oi JOIN MenuItems mi ON mi.itemID=oi.itemID WHERE oi.orderNumber=?",
                orderNumber);
        List<Map<String, Object>> address = jdbcTemplate.queryForList(
                "SELECT a.* FROM OrderDeliveryAddress oda JOIN Address a ON a.addressID=oda.addressID WHERE oda.orderNumber=?",
                orderNumber);
        result.put("order", header);
        result.put("items", items);
        result.put("address", address);
        return result;
    }

    public List<Map<String, Object>> getMenuByRestaurant(String restName) {
        return jdbcTemplate.queryForList(
                "SELECT mi.itemID, mi.itemName, mi.itemPrice, mi.isAvailable " +
                        "FROM RestaurantToMenu rtm JOIN MenuItems mi ON mi.itemID = rtm.itemID " +
                        "WHERE rtm.restName = ?", restName);
    }

    public List<Map<String, Object>> getHoursByRestaurant(String restName) {
        return jdbcTemplate.queryForList(
                "SELECT h.hoursID, h.dayOfWeek, h.openTime, h.closeTime, h.isClosed " +
                        "FROM RestaurantToHours rth JOIN Hours h ON h.hoursID = rth.hoursID " +
                        "WHERE rth.restName = ?", restName);
    }
}

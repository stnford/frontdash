package com.frontdash.backend.repository;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Types;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AuthRepository {

    private final JdbcTemplate jdbcTemplate;

    public AuthRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean loginStaff(String username, String password) {
        return executeLoginProc("{call proc_login_staff(?,?,?)}", username, password);
    }

    public boolean loginRestaurant(String username, String password) {
        return executeLoginProc("{call proc_login_restaurant(?,?,?)}", username, password);
    }

    public UserRecord findStaff(String username) {
        return jdbcTemplate.query(
                "SELECT lc.username, lc.password, lc.userType, s.employementStatus " +
                        "FROM LoginCredentials lc JOIN Staff s ON s.username = lc.username " +
                        "WHERE lc.username = ? AND lc.userType='Staff'",
                rs -> rs.next() ? new UserRecord(
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("userType"),
                        rs.getString("employementStatus")
                ) : null,
                username
        );
    }

    public UserRecord findRestaurantUser(String username) {
        return jdbcTemplate.query(
                "SELECT lc.username, lc.password, lc.userType, r.approvalByAdminStatus " +
                        "FROM LoginCredentials lc LEFT JOIN Restaurant r ON r.restName = lc.username " +
                        "WHERE lc.username = ? AND lc.userType='Restaurant'",
                rs -> rs.next() ? new UserRecord(
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("userType"),
                        rs.getString("approvalByAdminStatus")
                ) : null,
                username
        );
    }

    public void updatePassword(String username, String newPassword) {
        jdbcTemplate.update("UPDATE LoginCredentials SET password=? WHERE username=?", newPassword, username);
    }

    private boolean executeLoginProc(String procCall, String username, String password) {
        return jdbcTemplate.execute((Connection connection) -> {
            try (CallableStatement cs = connection.prepareCall(procCall)) {
                cs.setString(1, username);
                cs.setString(2, password);
                cs.registerOutParameter(3, Types.TINYINT);
                cs.execute();
                return cs.getByte(3) == 1;
            }
        });
    }

    public record UserRecord(String username, String password, String userType, String status) {}
}

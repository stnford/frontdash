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
}

package com.frontdash.backend.dto;

public class LoginResponse {
    private boolean success;
    private String role;
    private String message;

    public LoginResponse(boolean success, String role, String message) {
        this.success = success;
        this.role = role;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }
}

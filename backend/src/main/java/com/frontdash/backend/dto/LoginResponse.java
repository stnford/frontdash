package com.frontdash.backend.dto;

public class LoginResponse {
    private boolean success;
    private String role;
    private String message;
    private boolean mustChangePassword;

    public LoginResponse(boolean success, String role, String message) {
        this(success, role, message, false);
    }

    public LoginResponse(boolean success, String role, String message, boolean mustChangePassword) {
        this.success = success;
        this.role = role;
        this.message = message;
        this.mustChangePassword = mustChangePassword;
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

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }
}

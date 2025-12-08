package com.frontdash.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class StaffStatusRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String status; // Active or Inactive

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

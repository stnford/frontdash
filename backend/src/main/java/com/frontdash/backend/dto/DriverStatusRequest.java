package com.frontdash.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class DriverStatusRequest {
    @NotBlank
    private String driverName;

    @NotBlank
    private String status; // Active or Inactive

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

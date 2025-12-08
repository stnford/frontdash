package com.frontdash.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class DriverCreateRequest {
    @NotBlank
    private String driverName;

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }
}

package com.frontdash.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class WithdrawalDecisionRequest {
    @NotBlank
    private String restName;

    @NotBlank
    private String decision; // Approved or Rejected

    public String getRestName() {
        return restName;
    }

    public void setRestName(String restName) {
        this.restName = restName;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }
}

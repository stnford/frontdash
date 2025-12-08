package com.frontdash.backend.controller;

import com.frontdash.backend.dto.*;
import com.frontdash.backend.service.FrontdashService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final FrontdashService service;

    public AdminController(FrontdashService service) {
        this.service = service;
    }

    @GetMapping("/restaurants")
  public List<Map<String, Object>> listRestaurants(
          @RequestParam(name = "includePending", defaultValue = "0") int includePending,
          @RequestParam(name = "includeInactive", defaultValue = "0") int includeInactive) {
    return service.listRestaurants(includePending == 1, includeInactive == 1);
  }

  @GetMapping("/restaurants/pending")
  public List<Map<String, Object>> listPendingRestaurants() {
    return service.listPendingRegistrations();
  }

    @PostMapping("/restaurants/approval")
    public ResponseEntity<Map<String, String>> approveRestaurant(@Valid @RequestBody RestaurantApprovalRequest request) {
        service.approveRestaurant(request.getRestName(), request.getDecision());
        return ResponseEntity.ok(Map.of("message", "Restaurant decision saved"));
    }

    @PostMapping("/restaurants/withdrawal")
    public ResponseEntity<Map<String, String>> withdrawalDecision(@Valid @RequestBody WithdrawalDecisionRequest request) {
        service.resolveWithdrawal(request.getRestName(), request.getDecision());
        return ResponseEntity.ok(Map.of("message", "Withdrawal decision saved"));
    }

    @GetMapping("/staff")
    public List<Map<String, Object>> listStaff() {
        return service.listStaff();
    }

    @PostMapping("/staff")
    public ResponseEntity<Map<String, String>> createStaff(@Valid @RequestBody StaffCreateRequest request) {
        service.createStaff(request.getUsername(), request.getPassword(), request.getFirstName(), request.getLastName());
        return ResponseEntity.ok(Map.of("message", "Staff created"));
    }

    @PutMapping("/staff/status")
    public ResponseEntity<Map<String, String>> setStaffStatus(@Valid @RequestBody StaffStatusRequest request) {
        service.setStaffStatus(request.getUsername(), request.getStatus());
        return ResponseEntity.ok(Map.of("message", "Staff status updated"));
    }

    @GetMapping("/drivers")
    public List<Map<String, Object>> listDrivers() {
        return service.listDrivers();
    }

    @PostMapping("/drivers")
    public ResponseEntity<Map<String, String>> createDriver(@Valid @RequestBody DriverCreateRequest request) {
        service.createDriver(request.getDriverName());
        return ResponseEntity.ok(Map.of("message", "Driver created"));
    }

    @PutMapping("/drivers/status")
    public ResponseEntity<Map<String, String>> setDriverStatus(@Valid @RequestBody DriverStatusRequest request) {
        service.setDriverStatus(request.getDriverName(), request.getStatus());
        return ResponseEntity.ok(Map.of("message", "Driver status updated"));
    }
}

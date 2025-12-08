package com.frontdash.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.frontdash.backend.dto.LoginRequest;
import com.frontdash.backend.dto.LoginResponse;
import com.frontdash.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/staff-login")
    public ResponseEntity<LoginResponse> staffLogin(@Validated @RequestBody LoginRequest request) {
        boolean ok = authService.loginStaff(request.getUsername(), request.getPassword());
        if (ok) {
            return ResponseEntity.ok(new LoginResponse(true, "staff", "Staff login successful"));
        }
        return ResponseEntity.status(401).body(new LoginResponse(false, "staff", "Invalid staff credentials or inactive user"));
    }

    @PostMapping("/restaurant-login")
    public ResponseEntity<LoginResponse> restaurantLogin(@Validated @RequestBody LoginRequest request) {
        boolean ok = authService.loginRestaurant(request.getUsername(), request.getPassword());
        if (ok) {
            return ResponseEntity.ok(new LoginResponse(true, "restaurant", "Restaurant login successful"));
        }
        return ResponseEntity.status(401).body(new LoginResponse(false, "restaurant", "Invalid restaurant credentials"));
    }
}

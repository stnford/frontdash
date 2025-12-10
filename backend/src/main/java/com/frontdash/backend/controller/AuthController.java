package com.frontdash.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.frontdash.backend.dto.ChangePasswordRequest;
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
        LoginResponse resp = authService.loginStaff(request.getUsername(), request.getPassword());
        if (resp.isSuccess()) {
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.status(401).body(resp);
    }

    @PostMapping("/restaurant-login")
    public ResponseEntity<LoginResponse> restaurantLogin(@Validated @RequestBody LoginRequest request) {
        LoginResponse resp = authService.loginRestaurant(request.getUsername(), request.getPassword());
        if (resp.isSuccess()) {
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.status(401).body(resp);
    }

    @PostMapping("/change-password")
    public ResponseEntity<LoginResponse> changePassword(@Validated @RequestBody ChangePasswordRequest request) {
        boolean ok = authService.changePassword(request);
        if (ok) {
            return ResponseEntity.ok(new LoginResponse(true, request.getUserType(), "Password updated"));
        }
        return ResponseEntity.status(400).body(new LoginResponse(false, request.getUserType(), "Password update failed"));
    }
}

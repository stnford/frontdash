package com.frontdash.backend.service;

import org.springframework.stereotype.Service;

import com.frontdash.backend.dto.ChangePasswordRequest;
import com.frontdash.backend.dto.LoginResponse;
import com.frontdash.backend.repository.AuthRepository;
import com.frontdash.backend.repository.AuthRepository.UserRecord;

@Service
public class AuthService {

    private final AuthRepository authRepository;

    public AuthService(AuthRepository authRepository) {
        this.authRepository = authRepository;
    }

    public LoginResponse loginStaff(String username, String password) {
        UserRecord rec = authRepository.findStaff(username);
        if (rec == null) {
            return new LoginResponse(false, "staff", "Invalid staff credentials");
        }
        if (!"Active".equalsIgnoreCase(rec.status())) {
            return new LoginResponse(false, "staff", "Inactive staff user");
        }
        boolean matches = rec.password().equals(password);
        boolean mustChange = matches && rec.password().startsWith("temp-");
        if (matches) {
            return new LoginResponse(true, "staff", mustChange ? "Password change required" : "Staff login successful", mustChange);
        }
        return new LoginResponse(false, "staff", "Invalid staff credentials");
    }

    public LoginResponse loginRestaurant(String username, String password) {
        boolean ok = authRepository.loginRestaurant(username, password);
        if (ok) {
            boolean mustChange = password.startsWith("temp-");
            return new LoginResponse(true, "restaurant", mustChange ? "Password change required" : "Restaurant login successful", mustChange);
        }
        return new LoginResponse(false, "restaurant", "Invalid restaurant credentials");
    }

    public boolean changePassword(ChangePasswordRequest request) {
        UserRecord rec;
        if ("staff".equalsIgnoreCase(request.getUserType())) {
            rec = authRepository.findStaff(request.getUsername());
        } else {
            rec = authRepository.findRestaurantUser(request.getUsername());
        }
        if (rec == null) {
            return false;
        }
        if (!rec.password().equals(request.getOldPassword())) {
            return false;
        }
        authRepository.updatePassword(request.getUsername(), request.getNewPassword());
        return true;
    }
}

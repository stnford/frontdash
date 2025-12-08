package com.frontdash.backend.service;

import org.springframework.stereotype.Service;

import com.frontdash.backend.repository.AuthRepository;

@Service
public class AuthService {

    private final AuthRepository authRepository;

    public AuthService(AuthRepository authRepository) {
        this.authRepository = authRepository;
    }

    public boolean loginStaff(String username, String password) {
        return authRepository.loginStaff(username, password);
    }

    public boolean loginRestaurant(String username, String password) {
        return authRepository.loginRestaurant(username, password);
    }
}

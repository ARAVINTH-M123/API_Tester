package com.application.API_Tester_Backend.service;

import com.application.API_Tester_Backend.dto.auth.AuthRequest;
import com.application.API_Tester_Backend.dto.auth.AuthResponse;
import com.application.API_Tester_Backend.model.AppUser;
import com.application.API_Tester_Backend.repository.AppUserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public AuthResponse signup(AuthRequest request) {
        validateEmailAndPassword(request.email(), request.password());

        userRepository.findByEmailIgnoreCase(request.email())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email is already registered.");
                });

        AppUser user = new AppUser();
        user.setName(request.name() == null || request.name().isBlank() ? "User" : request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        AppUser saved = userRepository.save(user);
        return new AuthResponse(saved.getId(), saved.getName(), saved.getEmail(), "Signup successful.");
    }

    public AuthResponse login(AuthRequest request) {
        validateEmailAndPassword(request.email(), request.password());

        AppUser user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), "Login successful.");
    }

    public AuthResponse getUser(Long userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), "User loaded.");
    }

    private void validateEmailAndPassword(String email, String password) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }
    }
}

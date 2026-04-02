package com.application.API_Tester_Backend.dto.auth;

public record AuthResponse(Long userId, String name, String email, String message) {
}

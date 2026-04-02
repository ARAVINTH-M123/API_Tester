package com.application.API_Tester_Backend.dto.environment;

import java.time.LocalDateTime;

public record EnvironmentResponse(
        Long id,
        Long userId,
        String name,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

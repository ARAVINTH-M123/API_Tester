package com.application.API_Tester_Backend.dto.environment;

import java.time.LocalDateTime;
import java.util.List;

public record EnvironmentDetailResponse(
        Long id,
        Long userId,
        String name,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<EnvironmentVariableItemResponse> items
) {
}

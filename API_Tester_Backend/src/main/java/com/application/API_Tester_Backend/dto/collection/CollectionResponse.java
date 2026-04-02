package com.application.API_Tester_Backend.dto.collection;

import java.time.LocalDateTime;

public record CollectionResponse(Long id, Long userId, String name, LocalDateTime createdAt) {
}

package com.application.API_Tester_Backend.dto.workspace;

import java.time.LocalDateTime;

public record WorkspaceResponse(Long id, Long userId, String name, LocalDateTime createdAt) {
}

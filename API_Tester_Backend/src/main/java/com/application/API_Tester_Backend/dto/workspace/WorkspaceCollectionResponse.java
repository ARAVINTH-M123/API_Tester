package com.application.API_Tester_Backend.dto.workspace;

import java.time.LocalDateTime;

public record WorkspaceCollectionResponse(
        Long id,
        Long workspaceId,
        String name,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

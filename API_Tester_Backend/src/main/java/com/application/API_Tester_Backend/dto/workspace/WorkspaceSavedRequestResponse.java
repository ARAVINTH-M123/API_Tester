package com.application.API_Tester_Backend.dto.workspace;

import java.time.LocalDateTime;

public record WorkspaceSavedRequestResponse(
        Long id,
        Long workspaceCollectionId,
        String url,
        String method,
        String headersJson,
        String queryParamsJson,
        String bodyMode,
        String bodyContent,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

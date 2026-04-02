package com.application.API_Tester_Backend.dto.collection;

import java.time.LocalDateTime;

public record SavedRequestResponse(
        Long id,
        Long collectionId,
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

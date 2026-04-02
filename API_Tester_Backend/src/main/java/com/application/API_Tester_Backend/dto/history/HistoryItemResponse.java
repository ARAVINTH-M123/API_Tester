package com.application.API_Tester_Backend.dto.history;

import java.time.LocalDateTime;

public record HistoryItemResponse(
        Long id,
        Long userId,
        String url,
        String method,
        String headersJson,
        String queryParamsJson,
        String bodyMode,
        String bodyContent,
        String responseHeadersJson,
        String responseBody,
        Integer statusCode,
        Long responseTimeMs,
        LocalDateTime requestedAt
) {
}

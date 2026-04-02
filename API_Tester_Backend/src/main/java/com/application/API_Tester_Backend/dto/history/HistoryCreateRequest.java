package com.application.API_Tester_Backend.dto.history;

public record HistoryCreateRequest(
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
        Long responseTimeMs
) {
}

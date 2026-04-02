package com.application.API_Tester_Backend.dto.collection;

public record SavedRequestUpdateRequest(
        String url,
        String method,
        String headersJson,
        String queryParamsJson,
        String bodyMode,
        String bodyContent
) {
}

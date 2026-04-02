package com.application.API_Tester_Backend.dto.collection;

public record SavedRequestCreateRequest(
        Long collectionId,
        String url,
        String method,
        String headersJson,
        String queryParamsJson,
        String bodyMode,
        String bodyContent
) {
}

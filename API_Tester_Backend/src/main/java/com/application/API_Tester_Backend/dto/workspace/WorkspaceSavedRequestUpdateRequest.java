package com.application.API_Tester_Backend.dto.workspace;

public record WorkspaceSavedRequestUpdateRequest(
        String url,
        String method,
        String headersJson,
        String queryParamsJson,
        String bodyMode,
        String bodyContent
) {
}

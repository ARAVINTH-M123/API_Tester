package com.application.API_Tester_Backend.dto.workspace;

import java.util.List;

public record AddToWorkspaceCollectionsRequest(
        Long userId,
        List<Long> workspaceCollectionIds,
        String url,
        String method,
        String headersJson,
        String queryParamsJson,
        String bodyMode,
        String bodyContent
) {
}

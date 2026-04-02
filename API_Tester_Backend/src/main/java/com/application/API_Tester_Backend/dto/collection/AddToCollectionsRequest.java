package com.application.API_Tester_Backend.dto.collection;

import java.util.List;

public record AddToCollectionsRequest(
        Long userId,
        List<Long> collectionIds,
        String url,
        String method,
        String headersJson,
        String queryParamsJson,
        String bodyMode,
        String bodyContent
) {
}

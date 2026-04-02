package com.application.API_Tester_Backend.dto.settings;

public record ClearAccountDataResponse(
        String message,
        long deletedHistoryCount,
        long deletedCollectionsCount,
        long deletedCollectionRequestsCount,
        long deletedWorkspacesCount,
        long deletedWorkspaceCollectionsCount,
        long deletedWorkspaceRequestsCount,
        long deletedEnvironmentsCount,
        long deletedEnvironmentVariablesCount,
        long totalDeletedItems
) {
}

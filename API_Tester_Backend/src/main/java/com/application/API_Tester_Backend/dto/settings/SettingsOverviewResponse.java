package com.application.API_Tester_Backend.dto.settings;

import java.time.LocalDateTime;

public record SettingsOverviewResponse(
        Long userId,
        String name,
        String email,
        LocalDateTime createdAt,
        long historyCount,
        long collectionCount,
        long savedCollectionRequestCount,
        long workspaceCount,
        long workspaceCollectionCount,
        long workspaceSavedRequestCount,
        long environmentCount,
        long environmentVariableCount
) {
}

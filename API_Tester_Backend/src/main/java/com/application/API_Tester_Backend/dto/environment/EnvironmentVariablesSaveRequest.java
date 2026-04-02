package com.application.API_Tester_Backend.dto.environment;

import java.util.List;

public record EnvironmentVariablesSaveRequest(
        String name,
        List<EnvironmentVariableItemRequest> items
) {
}

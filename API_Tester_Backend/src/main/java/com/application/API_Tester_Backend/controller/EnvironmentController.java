package com.application.API_Tester_Backend.controller;

import com.application.API_Tester_Backend.dto.environment.EnvironmentCreateRequest;
import com.application.API_Tester_Backend.dto.environment.EnvironmentDetailResponse;
import com.application.API_Tester_Backend.dto.environment.EnvironmentResponse;
import com.application.API_Tester_Backend.dto.environment.EnvironmentVariablesSaveRequest;
import com.application.API_Tester_Backend.service.EnvironmentService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/environments")
public class EnvironmentController {

    private final EnvironmentService environmentService;

    public EnvironmentController(EnvironmentService environmentService) {
        this.environmentService = environmentService;
    }

    @GetMapping
    public List<EnvironmentResponse> getEnvironments(@RequestParam Long userId) {
        return environmentService.getEnvironments(userId);
    }

    @PostMapping
    public EnvironmentResponse createEnvironment(@RequestBody EnvironmentCreateRequest request) {
        return environmentService.createEnvironment(request);
    }

    @GetMapping("/{environmentId}")
    public EnvironmentDetailResponse getEnvironmentDetail(@PathVariable Long environmentId, @RequestParam Long userId) {
        return environmentService.getEnvironmentDetail(environmentId, userId);
    }

    @PutMapping("/{environmentId}")
    public EnvironmentDetailResponse saveEnvironmentDetail(
            @PathVariable Long environmentId,
            @RequestParam Long userId,
            @RequestBody EnvironmentVariablesSaveRequest request
    ) {
        return environmentService.saveEnvironmentDetail(environmentId, userId, request);
    }
}

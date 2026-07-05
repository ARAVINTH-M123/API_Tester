package com.application.API_Tester_Backend.controller;

import com.application.API_Tester_Backend.dto.auth.AuthResponse;
import com.application.API_Tester_Backend.dto.settings.ClearAccountDataResponse;
import com.application.API_Tester_Backend.dto.settings.SettingsOverviewResponse;
import com.application.API_Tester_Backend.dto.settings.UpdateNameRequest;
import com.application.API_Tester_Backend.service.SettingsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/users/{userId}")
    public SettingsOverviewResponse getOverview(@PathVariable Long userId) {
        return settingsService.getOverview(userId);
    }

    @PutMapping("/users/{userId}/name")
    public AuthResponse updateName(@PathVariable Long userId, @RequestBody UpdateNameRequest request) {
        return settingsService.updateName(userId, request.name());
    }

    @DeleteMapping("/users/{userId}/data")
    public ClearAccountDataResponse clearAccountData(@PathVariable Long userId) {
        return settingsService.clearAccountData(userId);
    }
}

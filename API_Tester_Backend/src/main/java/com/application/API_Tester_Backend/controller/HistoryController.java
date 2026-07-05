package com.application.API_Tester_Backend.controller;

import com.application.API_Tester_Backend.dto.history.HistoryCreateRequest;
import com.application.API_Tester_Backend.dto.history.HistoryItemResponse;
import com.application.API_Tester_Backend.service.HistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @PostMapping
    public HistoryItemResponse create(@RequestBody HistoryCreateRequest request) {
        return historyService.create(request);
    }

    @GetMapping("/{userId}")
    public List<HistoryItemResponse> getByUser(@PathVariable Long userId) {
        return historyService.getByUserId(userId);
    }

    @GetMapping("/{userId}/latest")
    public ResponseEntity<HistoryItemResponse> getLatestByUser(@PathVariable Long userId) {
        return historyService.getLatestByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @DeleteMapping("/{historyId}")
    public Map<String, String> deleteHistoryItem(@PathVariable Long historyId, @RequestParam Long userId) {
        historyService.deleteHistoryItem(historyId, userId);
        return Map.of("message", "History item removed.");
    }

    @DeleteMapping("/clear")
    public Map<String, Object> clearHistory(@RequestParam Long userId) {
        long deletedCount = historyService.clearHistoryByUserId(userId);
        return Map.of("message", "History cleared.", "deletedCount", deletedCount);
    }
}

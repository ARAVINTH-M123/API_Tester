package com.application.API_Tester_Backend.service;

import com.application.API_Tester_Backend.dto.history.HistoryCreateRequest;
import com.application.API_Tester_Backend.dto.history.HistoryItemResponse;
import com.application.API_Tester_Backend.model.ApiRequestHistory;
import com.application.API_Tester_Backend.model.AppUser;
import com.application.API_Tester_Backend.repository.ApiRequestHistoryRepository;
import com.application.API_Tester_Backend.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class HistoryService {

    private final ApiRequestHistoryRepository historyRepository;
    private final AppUserRepository userRepository;

    public HistoryService(ApiRequestHistoryRepository historyRepository, AppUserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    public HistoryItemResponse create(HistoryCreateRequest request) {
        if (request.userId() == null) {
            throw new IllegalArgumentException("userId is required.");
        }
        if (request.url() == null || request.url().isBlank()) {
            throw new IllegalArgumentException("url is required.");
        }
        if (request.method() == null || request.method().isBlank()) {
            throw new IllegalArgumentException("method is required.");
        }

        AppUser user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        ApiRequestHistory history = new ApiRequestHistory();
        history.setUser(user);
        history.setUrl(request.url().trim());
        history.setMethod(request.method().trim().toUpperCase());
        history.setHeadersJson(request.headersJson());
        history.setQueryParamsJson(request.queryParamsJson());
        history.setBodyMode(request.bodyMode());
        history.setBodyContent(request.bodyContent());
        history.setResponseHeadersJson(request.responseHeadersJson());
        history.setResponseBody(request.responseBody());
        history.setStatusCode(request.statusCode() == null ? 0 : request.statusCode());
        history.setResponseTimeMs(request.responseTimeMs() == null ? 0L : request.responseTimeMs());

        ApiRequestHistory saved = historyRepository.save(history);
        return toResponse(saved);
    }

    public List<HistoryItemResponse> getByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required.");
        }

        return historyRepository.findByUserIdOrderByRequestedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<HistoryItemResponse> getLatestByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required.");
        }

        return historyRepository.findTopByUserIdOrderByRequestedAtDesc(userId)
                .map(this::toResponse);
    }

    @Transactional
    public void deleteHistoryItem(Long historyId, Long userId) {
        if (historyId == null) {
            throw new IllegalArgumentException("historyId is required.");
        }
        if (userId == null) {
            throw new IllegalArgumentException("userId is required.");
        }

        ApiRequestHistory existing = historyRepository.findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new IllegalArgumentException("History item not found."));

        historyRepository.deleteById(existing.getId());
    }

    @Transactional
    public long clearHistoryByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required.");
        }

        return historyRepository.deleteByUserId(userId);
    }

    private HistoryItemResponse toResponse(ApiRequestHistory history) {
        return new HistoryItemResponse(
                history.getId(),
                history.getUser().getId(),
                history.getUrl(),
                history.getMethod(),
            history.getHeadersJson(),
            history.getQueryParamsJson(),
            history.getBodyMode(),
            history.getBodyContent(),
            history.getResponseHeadersJson(),
            history.getResponseBody(),
                history.getStatusCode(),
                history.getResponseTimeMs(),
                history.getRequestedAt()
        );
    }
}

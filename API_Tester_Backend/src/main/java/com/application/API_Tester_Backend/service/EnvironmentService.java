package com.application.API_Tester_Backend.service;

import com.application.API_Tester_Backend.dto.environment.EnvironmentCreateRequest;
import com.application.API_Tester_Backend.dto.environment.EnvironmentDetailResponse;
import com.application.API_Tester_Backend.dto.environment.EnvironmentResponse;
import com.application.API_Tester_Backend.dto.environment.EnvironmentVariableItemRequest;
import com.application.API_Tester_Backend.dto.environment.EnvironmentVariableItemResponse;
import com.application.API_Tester_Backend.dto.environment.EnvironmentVariablesSaveRequest;
import com.application.API_Tester_Backend.model.AppUser;
import com.application.API_Tester_Backend.model.Environment;
import com.application.API_Tester_Backend.model.EnvironmentVariable;
import com.application.API_Tester_Backend.repository.AppUserRepository;
import com.application.API_Tester_Backend.repository.EnvironmentRepository;
import com.application.API_Tester_Backend.repository.EnvironmentVariableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class EnvironmentService {

    private final EnvironmentRepository environmentRepository;
    private final EnvironmentVariableRepository environmentVariableRepository;
    private final AppUserRepository userRepository;

    public EnvironmentService(
            EnvironmentRepository environmentRepository,
            EnvironmentVariableRepository environmentVariableRepository,
            AppUserRepository userRepository
    ) {
        this.environmentRepository = environmentRepository;
        this.environmentVariableRepository = environmentVariableRepository;
        this.userRepository = userRepository;
    }

    public List<EnvironmentResponse> getEnvironments(Long userId) {
        validateUserId(userId);
        return environmentRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toEnvironmentResponse)
                .toList();
    }

    public EnvironmentResponse createEnvironment(EnvironmentCreateRequest request) {
        validateUserId(request.userId());
        validateName(request.name());

        AppUser user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Environment environment = new Environment();
        environment.setUser(user);
        environment.setName(request.name().trim());

        return toEnvironmentResponse(environmentRepository.save(environment));
    }

    public EnvironmentDetailResponse getEnvironmentDetail(Long environmentId, Long userId) {
        validateUserId(userId);
        Environment environment = environmentRepository.findByIdAndUserId(environmentId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Environment not found."));

        return toEnvironmentDetailResponse(environment);
    }

    @Transactional
    public EnvironmentDetailResponse saveEnvironmentDetail(Long environmentId, Long userId, EnvironmentVariablesSaveRequest request) {
        validateUserId(userId);
        validateName(request.name());

        Environment environment = environmentRepository.findByIdAndUserId(environmentId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Environment not found."));

        environment.setName(request.name().trim());
        Environment savedEnvironment = environmentRepository.save(environment);

        environmentVariableRepository.deleteByEnvironmentId(savedEnvironment.getId());

        List<EnvironmentVariable> toInsert = new ArrayList<>();
        if (request.items() != null) {
            for (EnvironmentVariableItemRequest item : request.items()) {
                if (item == null) {
                    continue;
                }

                String key = item.key() == null ? "" : item.key().trim();
                if (key.isBlank()) {
                    continue;
                }

                EnvironmentVariable variable = new EnvironmentVariable();
                variable.setEnvironment(savedEnvironment);
                variable.setVariableKey(key);
                variable.setVariableValue(item.value() == null ? "" : item.value());
                toInsert.add(variable);
            }
        }

        if (!toInsert.isEmpty()) {
            environmentVariableRepository.saveAll(toInsert);
        }

        return toEnvironmentDetailResponse(savedEnvironment);
    }

    private void validateUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required.");
        }
    }

    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Environment name is required.");
        }
    }

    private EnvironmentResponse toEnvironmentResponse(Environment environment) {
        return new EnvironmentResponse(
                environment.getId(),
                environment.getUser().getId(),
                environment.getName(),
                environment.getCreatedAt(),
                environment.getUpdatedAt()
        );
    }

    private EnvironmentDetailResponse toEnvironmentDetailResponse(Environment environment) {
        List<EnvironmentVariableItemResponse> items = environmentVariableRepository
                .findByEnvironmentIdOrderByUpdatedAtDesc(environment.getId())
                .stream()
                .map(variable -> new EnvironmentVariableItemResponse(
                        variable.getId(),
                        variable.getVariableKey(),
                        variable.getVariableValue()
                ))
                .toList();

        return new EnvironmentDetailResponse(
                environment.getId(),
                environment.getUser().getId(),
                environment.getName(),
                environment.getCreatedAt(),
                environment.getUpdatedAt(),
                items
        );
    }
}

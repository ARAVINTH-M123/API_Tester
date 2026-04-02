package com.application.API_Tester_Backend.service;

import com.application.API_Tester_Backend.dto.auth.AuthResponse;
import com.application.API_Tester_Backend.dto.settings.ClearAccountDataResponse;
import com.application.API_Tester_Backend.dto.settings.SettingsOverviewResponse;
import com.application.API_Tester_Backend.model.AppUser;
import com.application.API_Tester_Backend.repository.ApiRequestHistoryRepository;
import com.application.API_Tester_Backend.repository.AppCollectionRepository;
import com.application.API_Tester_Backend.repository.AppUserRepository;
import com.application.API_Tester_Backend.repository.EnvironmentRepository;
import com.application.API_Tester_Backend.repository.EnvironmentVariableRepository;
import com.application.API_Tester_Backend.repository.SavedCollectionRequestRepository;
import com.application.API_Tester_Backend.repository.WorkspaceCollectionRepository;
import com.application.API_Tester_Backend.repository.WorkspaceRepository;
import com.application.API_Tester_Backend.repository.WorkspaceSavedRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final AppUserRepository userRepository;
    private final ApiRequestHistoryRepository historyRepository;
    private final AppCollectionRepository collectionRepository;
    private final SavedCollectionRequestRepository savedCollectionRequestRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceCollectionRepository workspaceCollectionRepository;
    private final WorkspaceSavedRequestRepository workspaceSavedRequestRepository;
    private final EnvironmentRepository environmentRepository;
    private final EnvironmentVariableRepository environmentVariableRepository;

    public SettingsService(
            AppUserRepository userRepository,
            ApiRequestHistoryRepository historyRepository,
            AppCollectionRepository collectionRepository,
            SavedCollectionRequestRepository savedCollectionRequestRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceCollectionRepository workspaceCollectionRepository,
            WorkspaceSavedRequestRepository workspaceSavedRequestRepository,
            EnvironmentRepository environmentRepository,
            EnvironmentVariableRepository environmentVariableRepository
    ) {
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.collectionRepository = collectionRepository;
        this.savedCollectionRequestRepository = savedCollectionRequestRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceCollectionRepository = workspaceCollectionRepository;
        this.workspaceSavedRequestRepository = workspaceSavedRequestRepository;
        this.environmentRepository = environmentRepository;
        this.environmentVariableRepository = environmentVariableRepository;
    }

    public SettingsOverviewResponse getOverview(Long userId) {
        AppUser user = getUserOrThrow(userId);

        return new SettingsOverviewResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt(),
                historyRepository.countByUserId(userId),
                collectionRepository.countByUserId(userId),
                savedCollectionRequestRepository.countByCollectionUserId(userId),
                workspaceRepository.countByUserId(userId),
                workspaceCollectionRepository.countByWorkspaceUserId(userId),
                workspaceSavedRequestRepository.countByWorkspaceCollectionWorkspaceUserId(userId),
                environmentRepository.countByUserId(userId),
                environmentVariableRepository.countByEnvironmentUserId(userId)
        );
    }

    @Transactional
    public AuthResponse updateName(Long userId, String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required.");
        }

        String trimmedName = name.trim();
        if (trimmedName.length() > 80) {
            throw new IllegalArgumentException("Name must be 80 characters or fewer.");
        }

        AppUser user = getUserOrThrow(userId);
        user.setName(trimmedName);
        AppUser updated = userRepository.save(user);

        return new AuthResponse(
                updated.getId(),
                updated.getName(),
                updated.getEmail(),
                "Name updated successfully."
        );
    }

    @Transactional
    public ClearAccountDataResponse clearAccountData(Long userId) {
        getUserOrThrow(userId);

        long deletedHistory = historyRepository.deleteByUserId(userId);
        long deletedCollectionRequests = savedCollectionRequestRepository.deleteByCollectionUserId(userId);
        long deletedCollections = collectionRepository.deleteByUserId(userId);
        long deletedWorkspaceRequests = workspaceSavedRequestRepository.deleteByWorkspaceCollectionWorkspaceUserId(userId);
        long deletedWorkspaceCollections = workspaceCollectionRepository.deleteByWorkspaceUserId(userId);
        long deletedWorkspaces = workspaceRepository.deleteByUserId(userId);
        long deletedEnvironmentVariables = environmentVariableRepository.deleteByEnvironmentUserId(userId);
        long deletedEnvironments = environmentRepository.deleteByUserId(userId);

        long totalDeletedItems = deletedHistory
                + deletedCollectionRequests
                + deletedCollections
                + deletedWorkspaceRequests
                + deletedWorkspaceCollections
            + deletedWorkspaces
            + deletedEnvironmentVariables
            + deletedEnvironments;

        return new ClearAccountDataResponse(
                "All account data has been cleared.",
                deletedHistory,
                deletedCollections,
                deletedCollectionRequests,
                deletedWorkspaces,
                deletedWorkspaceCollections,
                deletedWorkspaceRequests,
                deletedEnvironments,
                deletedEnvironmentVariables,
                totalDeletedItems
        );
    }

    private AppUser getUserOrThrow(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required.");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }
}

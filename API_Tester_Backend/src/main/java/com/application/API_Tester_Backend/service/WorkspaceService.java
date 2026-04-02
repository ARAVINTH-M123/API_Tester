package com.application.API_Tester_Backend.service;

import com.application.API_Tester_Backend.dto.workspace.AddToWorkspaceCollectionsRequest;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceCollectionCreateRequest;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceCollectionResponse;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceCollectionUpdateRequest;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceCreateRequest;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceResponse;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceSavedRequestResponse;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceSavedRequestUpdateRequest;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceUpdateRequest;
import com.application.API_Tester_Backend.model.AppUser;
import com.application.API_Tester_Backend.model.Workspace;
import com.application.API_Tester_Backend.model.WorkspaceCollection;
import com.application.API_Tester_Backend.model.WorkspaceSavedRequest;
import com.application.API_Tester_Backend.repository.AppUserRepository;
import com.application.API_Tester_Backend.repository.WorkspaceCollectionRepository;
import com.application.API_Tester_Backend.repository.WorkspaceRepository;
import com.application.API_Tester_Backend.repository.WorkspaceSavedRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceCollectionRepository workspaceCollectionRepository;
    private final WorkspaceSavedRequestRepository workspaceSavedRequestRepository;
    private final AppUserRepository userRepository;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceCollectionRepository workspaceCollectionRepository,
            WorkspaceSavedRequestRepository workspaceSavedRequestRepository,
            AppUserRepository userRepository
    ) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceCollectionRepository = workspaceCollectionRepository;
        this.workspaceSavedRequestRepository = workspaceSavedRequestRepository;
        this.userRepository = userRepository;
    }

    public List<WorkspaceResponse> getWorkspaces(Long userId) {
        validateUserId(userId);
        return workspaceRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toWorkspaceResponse)
                .toList();
    }

    public WorkspaceResponse createWorkspace(WorkspaceCreateRequest request) {
        validateUserId(request.userId());
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Workspace name is required.");
        }

        AppUser user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Workspace workspace = new Workspace();
        workspace.setUser(user);
        workspace.setName(request.name().trim());
        return toWorkspaceResponse(workspaceRepository.save(workspace));
    }

    public WorkspaceResponse updateWorkspace(Long workspaceId, Long userId, WorkspaceUpdateRequest request) {
        validateUserId(userId);
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Workspace name is required.");
        }

        Workspace workspace = workspaceRepository.findByIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found."));

        workspace.setName(request.name().trim());
        return toWorkspaceResponse(workspaceRepository.save(workspace));
    }

    public List<WorkspaceCollectionResponse> getWorkspaceCollections(Long workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found."));

        return workspaceCollectionRepository.findByWorkspaceIdOrderByUpdatedAtDesc(workspace.getId())
                .stream()
                .map(this::toWorkspaceCollectionResponse)
                .toList();
    }

    public WorkspaceCollectionResponse createWorkspaceCollection(WorkspaceCollectionCreateRequest request) {
        if (request.workspaceId() == null) {
            throw new IllegalArgumentException("workspaceId is required.");
        }
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Collection name is required.");
        }

        Workspace workspace = workspaceRepository.findById(request.workspaceId())
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found."));

        WorkspaceCollection collection = new WorkspaceCollection();
        collection.setWorkspace(workspace);
        collection.setName(request.name().trim());
        return toWorkspaceCollectionResponse(workspaceCollectionRepository.save(collection));
    }

    public WorkspaceCollectionResponse updateWorkspaceCollection(Long collectionId, WorkspaceCollectionUpdateRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Collection name is required.");
        }

        WorkspaceCollection collection = workspaceCollectionRepository.findById(collectionId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace collection not found."));

        collection.setName(request.name().trim());
        return toWorkspaceCollectionResponse(workspaceCollectionRepository.save(collection));
    }

    public List<WorkspaceSavedRequestResponse> getWorkspaceSavedRequests(Long collectionId, String method) {
        WorkspaceCollection collection = workspaceCollectionRepository.findById(collectionId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace collection not found."));

        List<WorkspaceSavedRequest> items;
        if (method == null || method.isBlank() || method.equalsIgnoreCase("ALL")) {
            items = workspaceSavedRequestRepository.findByWorkspaceCollectionIdOrderByUpdatedAtDesc(collection.getId());
        } else {
            items = workspaceSavedRequestRepository
                    .findByWorkspaceCollectionIdAndMethodIgnoreCaseOrderByUpdatedAtDesc(collection.getId(), method.trim());
        }

        return items.stream().map(this::toWorkspaceSavedRequestResponse).toList();
    }

    public WorkspaceSavedRequestResponse updateWorkspaceSavedRequest(Long requestId, Long userId, WorkspaceSavedRequestUpdateRequest request) {
        validateUserId(userId);
        validateRequestFields(request.url(), request.method());

        WorkspaceSavedRequest saved = workspaceSavedRequestRepository.findByIdAndWorkspaceCollectionWorkspaceUserId(requestId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace request not found."));

        applyRequestValues(saved, request.url(), request.method(), request.headersJson(), request.queryParamsJson(), request.bodyMode(), request.bodyContent());
        return toWorkspaceSavedRequestResponse(workspaceSavedRequestRepository.save(saved));
    }

    public int addToWorkspaceCollections(AddToWorkspaceCollectionsRequest request) {
        validateUserId(request.userId());
        validateRequestFields(request.url(), request.method());

        if (request.workspaceCollectionIds() == null || request.workspaceCollectionIds().isEmpty()) {
            throw new IllegalArgumentException("Select at least one workspace collection.");
        }

        int savedCount = 0;
        for (Long collectionId : request.workspaceCollectionIds()) {
            WorkspaceCollection collection = workspaceCollectionRepository.findByIdAndWorkspaceUserId(collectionId, request.userId())
                    .orElseThrow(() -> new IllegalArgumentException("Workspace collection not found for user."));

            WorkspaceSavedRequest saved = new WorkspaceSavedRequest();
            saved.setWorkspaceCollection(collection);
            applyRequestValues(saved, request.url(), request.method(), request.headersJson(), request.queryParamsJson(), request.bodyMode(), request.bodyContent());
            workspaceSavedRequestRepository.save(saved);
            savedCount++;
        }

        return savedCount;
    }

    private void applyRequestValues(
            WorkspaceSavedRequest saved,
            String url,
            String method,
            String headersJson,
            String queryParamsJson,
            String bodyMode,
            String bodyContent
    ) {
        saved.setUrl(url.trim());
        saved.setMethod(method.trim().toUpperCase());
        saved.setHeadersJson(headersJson);
        saved.setQueryParamsJson(queryParamsJson);
        saved.setBodyMode(bodyMode);
        saved.setBodyContent(bodyContent);
    }

    private void validateUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required.");
        }
    }

    private void validateRequestFields(String url, String method) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("url is required.");
        }
        if (method == null || method.isBlank()) {
            throw new IllegalArgumentException("method is required.");
        }
    }

    private WorkspaceResponse toWorkspaceResponse(Workspace workspace) {
        return new WorkspaceResponse(workspace.getId(), workspace.getUser().getId(), workspace.getName(), workspace.getCreatedAt());
    }

    private WorkspaceCollectionResponse toWorkspaceCollectionResponse(WorkspaceCollection collection) {
        return new WorkspaceCollectionResponse(
                collection.getId(),
                collection.getWorkspace().getId(),
                collection.getName(),
                collection.getCreatedAt(),
                collection.getUpdatedAt()
        );
    }

    private WorkspaceSavedRequestResponse toWorkspaceSavedRequestResponse(WorkspaceSavedRequest request) {
        return new WorkspaceSavedRequestResponse(
                request.getId(),
                request.getWorkspaceCollection().getId(),
                request.getUrl(),
                request.getMethod(),
                request.getHeadersJson(),
                request.getQueryParamsJson(),
                request.getBodyMode(),
                request.getBodyContent(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
}

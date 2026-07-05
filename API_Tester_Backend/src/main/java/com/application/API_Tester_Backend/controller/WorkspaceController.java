package com.application.API_Tester_Backend.controller;

import com.application.API_Tester_Backend.dto.workspace.AddToWorkspaceCollectionsRequest;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceCollectionCreateRequest;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceCollectionResponse;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceCollectionUpdateRequest;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceCreateRequest;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceResponse;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceSavedRequestResponse;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceSavedRequestUpdateRequest;
import com.application.API_Tester_Backend.dto.workspace.WorkspaceUpdateRequest;
import com.application.API_Tester_Backend.service.WorkspaceService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public List<WorkspaceResponse> getWorkspaces(@RequestParam Long userId) {
        return workspaceService.getWorkspaces(userId);
    }

    @PostMapping
    public WorkspaceResponse createWorkspace(@RequestBody WorkspaceCreateRequest request) {
        return workspaceService.createWorkspace(request);
    }

    @PutMapping("/{workspaceId}")
    public WorkspaceResponse updateWorkspace(
            @PathVariable Long workspaceId,
            @RequestParam Long userId,
            @RequestBody WorkspaceUpdateRequest request
    ) {
        return workspaceService.updateWorkspace(workspaceId, userId, request);
    }

    @GetMapping("/{workspaceId}/collections")
    public List<WorkspaceCollectionResponse> getWorkspaceCollections(@PathVariable Long workspaceId) {
        return workspaceService.getWorkspaceCollections(workspaceId);
    }

    @PostMapping("/collections")
    public WorkspaceCollectionResponse createWorkspaceCollection(@RequestBody WorkspaceCollectionCreateRequest request) {
        return workspaceService.createWorkspaceCollection(request);
    }

    @PutMapping("/collections/{collectionId}")
    public WorkspaceCollectionResponse updateWorkspaceCollection(
            @PathVariable Long collectionId,
            @RequestBody WorkspaceCollectionUpdateRequest request
    ) {
        return workspaceService.updateWorkspaceCollection(collectionId, request);
    }

    @GetMapping("/collections/{collectionId}/requests")
    public List<WorkspaceSavedRequestResponse> getWorkspaceSavedRequests(
            @PathVariable Long collectionId,
            @RequestParam(required = false) String method
    ) {
        return workspaceService.getWorkspaceSavedRequests(collectionId, method);
    }

    @PutMapping("/collections/requests/{requestId}")
    public WorkspaceSavedRequestResponse updateWorkspaceSavedRequest(
            @PathVariable Long requestId,
            @RequestParam Long userId,
            @RequestBody WorkspaceSavedRequestUpdateRequest request
    ) {
        return workspaceService.updateWorkspaceSavedRequest(requestId, userId, request);
    }

    @PostMapping("/requests/add")
    public Map<String, Object> addToWorkspaceCollections(@RequestBody AddToWorkspaceCollectionsRequest request) {
        int savedCount = workspaceService.addToWorkspaceCollections(request);
        return Map.of("savedCount", savedCount, "message", "Request added to workspace collections.");
    }
}

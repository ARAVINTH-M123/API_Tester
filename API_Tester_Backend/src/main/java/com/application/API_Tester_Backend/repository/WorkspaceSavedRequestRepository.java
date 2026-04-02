package com.application.API_Tester_Backend.repository;

import com.application.API_Tester_Backend.model.WorkspaceSavedRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceSavedRequestRepository extends JpaRepository<WorkspaceSavedRequest, Long> {
    List<WorkspaceSavedRequest> findByWorkspaceCollectionIdOrderByUpdatedAtDesc(Long workspaceCollectionId);
    List<WorkspaceSavedRequest> findByWorkspaceCollectionIdAndMethodIgnoreCaseOrderByUpdatedAtDesc(Long workspaceCollectionId, String method);
    Optional<WorkspaceSavedRequest> findByIdAndWorkspaceCollectionWorkspaceUserId(Long id, Long userId);
    long countByWorkspaceCollectionWorkspaceUserId(Long userId);
    long deleteByWorkspaceCollectionWorkspaceUserId(Long userId);
}

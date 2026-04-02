package com.application.API_Tester_Backend.repository;

import com.application.API_Tester_Backend.model.WorkspaceCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceCollectionRepository extends JpaRepository<WorkspaceCollection, Long> {
    List<WorkspaceCollection> findByWorkspaceIdOrderByUpdatedAtDesc(Long workspaceId);
    Optional<WorkspaceCollection> findByIdAndWorkspaceId(Long id, Long workspaceId);
    Optional<WorkspaceCollection> findByIdAndWorkspaceUserId(Long id, Long userId);
    long countByWorkspaceUserId(Long userId);
    long deleteByWorkspaceUserId(Long userId);
}

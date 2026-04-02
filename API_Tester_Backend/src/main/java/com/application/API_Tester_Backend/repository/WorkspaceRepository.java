package com.application.API_Tester_Backend.repository;

import com.application.API_Tester_Backend.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Workspace> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
    long deleteByUserId(Long userId);
}

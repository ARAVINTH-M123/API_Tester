package com.application.API_Tester_Backend.repository;

import com.application.API_Tester_Backend.model.EnvironmentVariable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnvironmentVariableRepository extends JpaRepository<EnvironmentVariable, Long> {
    List<EnvironmentVariable> findByEnvironmentIdOrderByUpdatedAtDesc(Long environmentId);
    long deleteByEnvironmentId(Long environmentId);
    long countByEnvironmentUserId(Long userId);
    long deleteByEnvironmentUserId(Long userId);
}

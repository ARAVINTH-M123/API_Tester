package com.application.API_Tester_Backend.repository;

import com.application.API_Tester_Backend.model.Environment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnvironmentRepository extends JpaRepository<Environment, Long> {
    List<Environment> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<Environment> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
    long deleteByUserId(Long userId);
}

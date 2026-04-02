package com.application.API_Tester_Backend.repository;

import com.application.API_Tester_Backend.model.ApiRequestHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApiRequestHistoryRepository extends JpaRepository<ApiRequestHistory, Long> {
    List<ApiRequestHistory> findByUserIdOrderByRequestedAtDesc(Long userId);
    Optional<ApiRequestHistory> findTopByUserIdOrderByRequestedAtDesc(Long userId);
    Optional<ApiRequestHistory> findByIdAndUserId(Long id, Long userId);
    long deleteByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
    long deleteByUserId(Long userId);
}

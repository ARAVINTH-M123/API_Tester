package com.application.API_Tester_Backend.repository;

import com.application.API_Tester_Backend.model.AppCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppCollectionRepository extends JpaRepository<AppCollection, Long> {
    List<AppCollection> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<AppCollection> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
    long deleteByUserId(Long userId);
}

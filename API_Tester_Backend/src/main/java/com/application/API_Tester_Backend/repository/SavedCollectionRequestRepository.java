package com.application.API_Tester_Backend.repository;

import com.application.API_Tester_Backend.model.SavedCollectionRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedCollectionRequestRepository extends JpaRepository<SavedCollectionRequest, Long> {
    List<SavedCollectionRequest> findByCollectionIdOrderByUpdatedAtDesc(Long collectionId);
    List<SavedCollectionRequest> findByCollectionIdAndMethodIgnoreCaseOrderByUpdatedAtDesc(Long collectionId, String method);
    long countByCollectionUserId(Long userId);
    long deleteByCollectionUserId(Long userId);
}

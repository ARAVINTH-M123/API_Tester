package com.application.API_Tester_Backend.service;

import com.application.API_Tester_Backend.dto.collection.AddToCollectionsRequest;
import com.application.API_Tester_Backend.dto.collection.CollectionCreateRequest;
import com.application.API_Tester_Backend.dto.collection.CollectionResponse;
import com.application.API_Tester_Backend.dto.collection.CollectionUpdateRequest;
import com.application.API_Tester_Backend.dto.collection.SavedRequestCreateRequest;
import com.application.API_Tester_Backend.dto.collection.SavedRequestResponse;
import com.application.API_Tester_Backend.dto.collection.SavedRequestUpdateRequest;
import com.application.API_Tester_Backend.model.AppCollection;
import com.application.API_Tester_Backend.model.AppUser;
import com.application.API_Tester_Backend.model.SavedCollectionRequest;
import com.application.API_Tester_Backend.repository.AppCollectionRepository;
import com.application.API_Tester_Backend.repository.AppUserRepository;
import com.application.API_Tester_Backend.repository.SavedCollectionRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CollectionService {

    private final AppCollectionRepository collectionRepository;
    private final AppUserRepository userRepository;
    private final SavedCollectionRequestRepository savedRequestRepository;

    public CollectionService(
            AppCollectionRepository collectionRepository,
            AppUserRepository userRepository,
            SavedCollectionRequestRepository savedRequestRepository
    ) {
        this.collectionRepository = collectionRepository;
        this.userRepository = userRepository;
        this.savedRequestRepository = savedRequestRepository;
    }

    public List<CollectionResponse> getCollections(Long userId) {
        validateUserId(userId);
        return collectionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toCollectionResponse)
                .toList();
    }

    public CollectionResponse createCollection(CollectionCreateRequest request) {
        validateUserId(request.userId());
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Collection name is required.");
        }

        AppUser user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        AppCollection collection = new AppCollection();
        collection.setUser(user);
        collection.setName(request.name().trim());

        return toCollectionResponse(collectionRepository.save(collection));
    }

    public CollectionResponse updateCollection(Long collectionId, Long userId, CollectionUpdateRequest request) {
        validateUserId(userId);
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Collection name is required.");
        }

        AppCollection collection = collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found."));

        collection.setName(request.name().trim());
        return toCollectionResponse(collectionRepository.save(collection));
    }

    public List<SavedRequestResponse> getSavedRequests(Long collectionId, String method) {
        AppCollection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found."));

        List<SavedCollectionRequest> items;
        if (method == null || method.isBlank() || method.equalsIgnoreCase("ALL")) {
            items = savedRequestRepository.findByCollectionIdOrderByUpdatedAtDesc(collection.getId());
        } else {
            items = savedRequestRepository.findByCollectionIdAndMethodIgnoreCaseOrderByUpdatedAtDesc(collection.getId(), method.trim());
        }

        return items.stream().map(this::toSavedRequestResponse).toList();
    }

    public SavedRequestResponse createSavedRequest(SavedRequestCreateRequest request) {
        if (request.collectionId() == null) {
            throw new IllegalArgumentException("collectionId is required.");
        }
        validateRequestFields(request.url(), request.method());

        AppCollection collection = collectionRepository.findById(request.collectionId())
                .orElseThrow(() -> new IllegalArgumentException("Collection not found."));

        SavedCollectionRequest saved = new SavedCollectionRequest();
        saved.setCollection(collection);
        applyRequestValues(saved, request.url(), request.method(), request.headersJson(), request.queryParamsJson(), request.bodyMode(), request.bodyContent());

        return toSavedRequestResponse(savedRequestRepository.save(saved));
    }

    public SavedRequestResponse updateSavedRequest(Long requestId, SavedRequestUpdateRequest request) {
        validateRequestFields(request.url(), request.method());

        SavedCollectionRequest saved = savedRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Saved request not found."));

        applyRequestValues(saved, request.url(), request.method(), request.headersJson(), request.queryParamsJson(), request.bodyMode(), request.bodyContent());
        return toSavedRequestResponse(savedRequestRepository.save(saved));
    }

    public int addToCollections(AddToCollectionsRequest request) {
        validateUserId(request.userId());
        validateRequestFields(request.url(), request.method());

        if (request.collectionIds() == null || request.collectionIds().isEmpty()) {
            throw new IllegalArgumentException("Select at least one collection.");
        }

        int savedCount = 0;
        for (Long collectionId : request.collectionIds()) {
            AppCollection collection = collectionRepository.findByIdAndUserId(collectionId, request.userId())
                    .orElseThrow(() -> new IllegalArgumentException("Collection not found for user."));

            SavedCollectionRequest saved = new SavedCollectionRequest();
            saved.setCollection(collection);
            applyRequestValues(saved, request.url(), request.method(), request.headersJson(), request.queryParamsJson(), request.bodyMode(), request.bodyContent());
            savedRequestRepository.save(saved);
            savedCount++;
        }

        return savedCount;
    }

    private void applyRequestValues(
            SavedCollectionRequest saved,
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

    private CollectionResponse toCollectionResponse(AppCollection collection) {
        return new CollectionResponse(
                collection.getId(),
                collection.getUser().getId(),
                collection.getName(),
                collection.getCreatedAt()
        );
    }

    private SavedRequestResponse toSavedRequestResponse(SavedCollectionRequest request) {
        return new SavedRequestResponse(
                request.getId(),
                request.getCollection().getId(),
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

package com.application.API_Tester_Backend.controller;

import com.application.API_Tester_Backend.dto.collection.AddToCollectionsRequest;
import com.application.API_Tester_Backend.dto.collection.CollectionCreateRequest;
import com.application.API_Tester_Backend.dto.collection.CollectionResponse;
import com.application.API_Tester_Backend.dto.collection.CollectionUpdateRequest;
import com.application.API_Tester_Backend.dto.collection.SavedRequestCreateRequest;
import com.application.API_Tester_Backend.dto.collection.SavedRequestResponse;
import com.application.API_Tester_Backend.dto.collection.SavedRequestUpdateRequest;
import com.application.API_Tester_Backend.service.CollectionService;
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
@RequestMapping("/api/collections")
@CrossOrigin(origins = "http://localhost:3000")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public List<CollectionResponse> getCollections(@RequestParam Long userId) {
        return collectionService.getCollections(userId);
    }

    @PostMapping
    public CollectionResponse createCollection(@RequestBody CollectionCreateRequest request) {
        return collectionService.createCollection(request);
    }

    @PutMapping("/{collectionId}")
    public CollectionResponse updateCollection(
            @PathVariable Long collectionId,
            @RequestParam Long userId,
            @RequestBody CollectionUpdateRequest request
    ) {
        return collectionService.updateCollection(collectionId, userId, request);
    }

    @GetMapping("/{collectionId}/requests")
    public List<SavedRequestResponse> getSavedRequests(
            @PathVariable Long collectionId,
            @RequestParam(required = false) String method
    ) {
        return collectionService.getSavedRequests(collectionId, method);
    }

    @PostMapping("/requests")
    public SavedRequestResponse createSavedRequest(@RequestBody SavedRequestCreateRequest request) {
        return collectionService.createSavedRequest(request);
    }

    @PutMapping("/requests/{requestId}")
    public SavedRequestResponse updateSavedRequest(
            @PathVariable Long requestId,
            @RequestBody SavedRequestUpdateRequest request
    ) {
        return collectionService.updateSavedRequest(requestId, request);
    }

    @PostMapping("/requests/add")
    public Map<String, Object> addToCollections(@RequestBody AddToCollectionsRequest request) {
        int savedCount = collectionService.addToCollections(request);
        return Map.of("savedCount", savedCount, "message", "Request added to collections.");
    }
}

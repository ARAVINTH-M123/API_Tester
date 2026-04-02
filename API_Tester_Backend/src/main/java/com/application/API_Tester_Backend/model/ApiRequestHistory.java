package com.application.API_Tester_Backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "api_request_history")
public class ApiRequestHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String method;

    @Column(columnDefinition = "TEXT")
    private String headersJson;

    @Column(columnDefinition = "TEXT")
    private String queryParamsJson;

    @Column
    private String bodyMode;

    @Column(columnDefinition = "TEXT")
    private String bodyContent;

    @Column(columnDefinition = "TEXT")
    private String responseHeadersJson;

    @Column(columnDefinition = "TEXT")
    private String responseBody;

    @Column(nullable = false)
    private Integer statusCode;

    @Column(nullable = false)
    private Long responseTimeMs;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    @PrePersist
    void onCreate() {
        this.requestedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getHeadersJson() {
        return headersJson;
    }

    public void setHeadersJson(String headersJson) {
        this.headersJson = headersJson;
    }

    public String getQueryParamsJson() {
        return queryParamsJson;
    }

    public void setQueryParamsJson(String queryParamsJson) {
        this.queryParamsJson = queryParamsJson;
    }

    public String getBodyMode() {
        return bodyMode;
    }

    public void setBodyMode(String bodyMode) {
        this.bodyMode = bodyMode;
    }

    public String getBodyContent() {
        return bodyContent;
    }

    public void setBodyContent(String bodyContent) {
        this.bodyContent = bodyContent;
    }

    public String getResponseHeadersJson() {
        return responseHeadersJson;
    }

    public void setResponseHeadersJson(String responseHeadersJson) {
        this.responseHeadersJson = responseHeadersJson;
    }

    public String getResponseBody() {
        return responseBody;
    }

    public void setResponseBody(String responseBody) {
        this.responseBody = responseBody;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }

    public Long getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(Long responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }
}

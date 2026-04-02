"use client";

import { useEffect, useState } from "react";
import { getSessionUser } from "@/lib/auth-session";
import { apiRequest } from "@/lib/api";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";
type RequestTab = "headers" | "query" | "body";
type BodyMode = "json" | "form-data";
type ResponseHeader = { key: string; value: string };

type HistoryItemResponse = {
  id: number;
  userId: number;
  url: string;
  method: RequestMethod;
  headersJson?: string | null;
  queryParamsJson?: string | null;
  bodyMode?: BodyMode | null;
  bodyContent?: string | null;
  responseHeadersJson?: string | null;
  responseBody?: string | null;
  statusCode: number;
  responseTimeMs: number;
  requestedAt: string;
};

type CollectionItem = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
};

type WorkspaceItem = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
};

type WorkspaceCollectionItem = {
  id: number;
  workspaceId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type EnvironmentItem = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type EnvironmentDetailResponse = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    key: string;
    value: string;
  }>;
};

const HISTORY_SELECTION_KEY = "apiTesterSelectedHistory";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<RequestMethod>("GET");
  const [activeTab, setActiveTab] = useState<RequestTab>("headers");
  const [bodyMode, setBodyMode] = useState<BodyMode>("json");
  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [queryKey, setQueryKey] = useState("");
  const [queryValue, setQueryValue] = useState("");
  const [bodyJson, setBodyJson] = useState("");
  const [formDataKey, setFormDataKey] = useState("");
  const [formDataValue, setFormDataValue] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState("");
  const [responseHeaders, setResponseHeaders] = useState<ResponseHeader[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [workspaceCollectionsMap, setWorkspaceCollectionsMap] = useState<Record<number, WorkspaceCollectionItem[]>>({});
  const [expandedWorkspaceIds, setExpandedWorkspaceIds] = useState<number[]>([]);
  const [showAddToWorkspaceModal, setShowAddToWorkspaceModal] = useState(false);
  const [selectedWorkspaceCollectionIds, setSelectedWorkspaceCollectionIds] = useState<number[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentItem[]>([]);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<number | "">("");
  const [environmentVariables, setEnvironmentVariables] = useState<Record<string, string>>({});

  const applyHistoryConfig = (history: HistoryItemResponse): void => {
    setUrl(history.url ?? "");
    setMethod(history.method ?? "GET");

    const parsedHeaders = history.headersJson
      ? (JSON.parse(history.headersJson) as Record<string, string> | { key?: string; value?: string })
      : {};
    if ("key" in parsedHeaders || "value" in parsedHeaders) {
      setHeaderKey((parsedHeaders as { key?: string }).key ?? "");
      setHeaderValue((parsedHeaders as { value?: string }).value ?? "");
    } else {
      const firstHeader = Object.entries(parsedHeaders as Record<string, string>)[0];
      setHeaderKey(firstHeader?.[0] ?? "");
      setHeaderValue(firstHeader?.[1] ?? "");
    }

    const parsedQuery = history.queryParamsJson
      ? (JSON.parse(history.queryParamsJson) as Record<string, string> | { key?: string; value?: string })
      : {};
    if ("key" in parsedQuery || "value" in parsedQuery) {
      setQueryKey((parsedQuery as { key?: string }).key ?? "");
      setQueryValue((parsedQuery as { value?: string }).value ?? "");
    } else {
      const firstQuery = Object.entries(parsedQuery as Record<string, string>)[0];
      setQueryKey(firstQuery?.[0] ?? "");
      setQueryValue(firstQuery?.[1] ?? "");
    }

    const savedBodyMode = history.bodyMode === "form-data" ? "form-data" : "json";
    setBodyMode(savedBodyMode);

    if (savedBodyMode === "json") {
      setBodyJson(history.bodyContent ?? "");
      setFormDataKey("");
      setFormDataValue("");
    } else {
      const parsedFormData = history.bodyContent
        ? (JSON.parse(history.bodyContent) as Record<string, string> | { key?: string; value?: string })
        : {};
      if ("key" in parsedFormData || "value" in parsedFormData) {
        setFormDataKey((parsedFormData as { key?: string }).key ?? "");
        setFormDataValue((parsedFormData as { value?: string }).value ?? "");
      } else {
        const firstFormData = Object.entries(parsedFormData as Record<string, string>)[0];
        setFormDataKey(firstFormData?.[0] ?? "");
        setFormDataValue(firstFormData?.[1] ?? "");
      }
      setBodyJson("");
    }

    if (history.responseBody) {
      setHasSentRequest(true);
      setResponseStatus(history.statusCode ?? null);
      setResponseTimeMs(history.responseTimeMs ?? null);
      setResponseBody(history.responseBody);

      if (history.responseHeadersJson) {
        try {
          const parsedResponseHeaders = JSON.parse(history.responseHeadersJson) as Record<string, string>;
          setResponseHeaders(
            Object.entries(parsedResponseHeaders).map(([key, value]) => ({ key, value: String(value) }))
          );
        } catch {
          setResponseHeaders([]);
        }
      }
    }
  };

  const buildRequestUrl = (): string => {
    const trimmedUrl = url.trim().replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (_, variableName: string) => {
      return environmentVariables[variableName] ?? `{{${variableName}}}`;
    });
    const queryParamKey = queryKey.trim();
    const queryParamValue = queryValue.trim();

    if (!queryParamKey) {
      return trimmedUrl;
    }

    try {
      const parsed = new URL(trimmedUrl);
      parsed.searchParams.set(queryParamKey, queryParamValue);
      return parsed.toString();
    } catch {
      const separator = trimmedUrl.includes("?") ? "&" : "?";
      return `${trimmedUrl}${separator}${encodeURIComponent(queryParamKey)}=${encodeURIComponent(queryParamValue)}`;
    }
  };

  useEffect(() => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      return;
    }

    const selectedHistoryRaw = window.localStorage.getItem(HISTORY_SELECTION_KEY);
    if (selectedHistoryRaw) {
      try {
        const selectedHistory = JSON.parse(selectedHistoryRaw) as HistoryItemResponse;
        applyHistoryConfig(selectedHistory);
        setSendMessage("Loaded selected request from history.");
      } finally {
        window.localStorage.removeItem(HISTORY_SELECTION_KEY);
      }
      return;
    }

    const loadLatest = async () => {
      try {
        const userCollections = await apiRequest<CollectionItem[]>(`/api/collections?userId=${sessionUser.userId}`);
        setCollections(userCollections);

        const userEnvironments = await apiRequest<EnvironmentItem[]>(`/api/environments?userId=${sessionUser.userId}`);
        setEnvironments(userEnvironments);

        const userWorkspaces = await apiRequest<WorkspaceItem[]>(`/api/workspaces?userId=${sessionUser.userId}`);
        setWorkspaces(userWorkspaces);

        const workspaceCollectionsEntries = await Promise.all(
          userWorkspaces.map(async (workspace) => {
            const list = await apiRequest<WorkspaceCollectionItem[]>(`/api/workspaces/${workspace.id}/collections`);
            return [workspace.id, list] as const;
          })
        );
        setWorkspaceCollectionsMap(Object.fromEntries(workspaceCollectionsEntries));

        const latest = await apiRequest<HistoryItemResponse>(`/api/history/${sessionUser.userId}/latest`, {
          method: "GET",
        });

        if (!latest || !latest.url) {
          return;
        }

        applyHistoryConfig(latest);

        setSendMessage("Loaded your last request configuration.");
      } catch {
        // No previous history yet, so keep defaults.
      }
    };

    void loadLatest();
  }, []);

  useEffect(() => {
    if (!selectedEnvironmentId) {
      setEnvironmentVariables({});
      return;
    }

    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setEnvironmentVariables({});
      return;
    }

    const loadEnvironmentVariables = async () => {
      try {
        const detail = await apiRequest<EnvironmentDetailResponse>(
          `/api/environments/${selectedEnvironmentId}?userId=${sessionUser.userId}`
        );

        const mapped = detail.items.reduce<Record<string, string>>((acc, item) => {
          const key = item.key.trim();
          if (!key) {
            return acc;
          }
          acc[key] = item.value;
          return acc;
        }, {});

        setEnvironmentVariables(mapped);
      } catch {
        setEnvironmentVariables({});
      }
    };

    void loadEnvironmentVariables();
  }, [selectedEnvironmentId]);

  const handleSend = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setSendMessage("Login required before sending requests.");
      return;
    }

    if (!url.trim()) {
      setSendMessage("Enter URL before sending.");
      return;
    }

    const startedAt = performance.now();
    const finalUrl = buildRequestUrl();

    const headersJson = JSON.stringify(headerKey.trim() ? { [headerKey.trim()]: headerValue } : {});
    const queryParamsJson = JSON.stringify(queryKey.trim() ? { [queryKey.trim()]: queryValue.trim() } : {});
    const bodyContent =
      bodyMode === "json"
        ? bodyJson
        : JSON.stringify({ key: formDataKey.trim(), value: formDataValue.trim() });

    const requestHeaders: HeadersInit = {};
    if (headerKey.trim()) {
      requestHeaders[headerKey.trim()] = headerValue;
    }

    let requestBody: BodyInit | undefined;
    if (method !== "GET") {
      if (bodyMode === "json") {
        requestHeaders["Content-Type"] = "application/json";
        requestBody = bodyJson;
      } else {
        const form = new FormData();
        if (formDataKey.trim()) {
          form.append(formDataKey.trim(), formDataValue);
        }
        requestBody = form;
      }
    }

    let savedStatusCode = 0;
    let savedResponseTime = 0;
    let savedResponseBody = "";
    let savedResponseHeadersJson = "{}";

    try {
      setIsSending(true);
      setHasSentRequest(true);
      setSendMessage("");

      const response = await fetch(finalUrl, {
        method,
        headers: requestHeaders,
        body: requestBody,
      });

      const elapsedMs = Math.round(performance.now() - startedAt);
      const responseText = await response.text();
      const formattedResponseBody = (() => {
        try {
          return JSON.stringify(JSON.parse(responseText), null, 2);
        } catch {
          return responseText;
        }
      })();

      setResponseStatus(response.status);
      setResponseTimeMs(elapsedMs);
      setResponseBody(formattedResponseBody || "<empty>");
      const responseHeaderList = Array.from(response.headers.entries()).map(([key, value]) => ({ key, value }));
      setResponseHeaders(responseHeaderList);

      savedStatusCode = response.status;
      savedResponseTime = elapsedMs;
      savedResponseBody = formattedResponseBody || "<empty>";
      savedResponseHeadersJson = JSON.stringify(Object.fromEntries(response.headers.entries()));

      setSendMessage("Request sent and stored in history.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed.";
      const elapsedMs = Math.round(performance.now() - startedAt);
      setResponseStatus(0);
      setResponseTimeMs(elapsedMs);
      setResponseBody(message);
      setResponseHeaders([]);
      setHasSentRequest(true);

      savedStatusCode = 0;
      savedResponseTime = elapsedMs;
      savedResponseBody = message;
      savedResponseHeadersJson = "{}";

      setSendMessage(message);
    } finally {
      try {
        await apiRequest("/api/history", {
          method: "POST",
          body: JSON.stringify({
            userId: sessionUser.userId,
            url: finalUrl,
            method,
            headersJson,
            queryParamsJson,
            bodyMode,
            bodyContent,
            responseHeadersJson: savedResponseHeadersJson,
            responseBody: savedResponseBody,
            statusCode: savedStatusCode,
            responseTimeMs: savedResponseTime,
          }),
        });
      } catch {
        setSendMessage("Request sent but failed to save history.");
      }

      setIsSending(false);
    }
  };

  const handleToggleCollection = (collectionId: number) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(collectionId) ? prev.filter((id) => id !== collectionId) : [...prev, collectionId]
    );
  };

  const handleAddToCollections = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setSendMessage("Login required before adding to collections.");
      return;
    }

    if (!url.trim()) {
      setSendMessage("Enter URL before adding to collections.");
      return;
    }

    if (selectedCollectionIds.length === 0) {
      setSendMessage("Select at least one collection.");
      return;
    }

    const headersJson = JSON.stringify(headerKey.trim() ? { [headerKey.trim()]: headerValue } : {});
    const queryParamsJson = JSON.stringify(queryKey.trim() ? { [queryKey.trim()]: queryValue.trim() } : {});
    const bodyContent =
      bodyMode === "json"
        ? bodyJson
        : JSON.stringify(formDataKey.trim() ? { [formDataKey.trim()]: formDataValue } : {});

    try {
      await apiRequest("/api/collections/requests/add", {
        method: "POST",
        body: JSON.stringify({
          userId: sessionUser.userId,
          collectionIds: selectedCollectionIds,
          url: url.trim(),
          method,
          headersJson,
          queryParamsJson,
          bodyMode,
          bodyContent,
        }),
      });
      setShowAddToCollectionModal(false);
      setSelectedCollectionIds([]);
      setSendMessage("Request config added to selected collections.");
    } catch (error) {
      setSendMessage(error instanceof Error ? error.message : "Failed to add to collections.");
    }
  };

  const handleToggleWorkspaceExpand = (workspaceId: number) => {
    setExpandedWorkspaceIds((prev) =>
      prev.includes(workspaceId) ? prev.filter((id) => id !== workspaceId) : [...prev, workspaceId]
    );
  };

  const handleToggleWorkspaceCollectionSelection = (collectionId: number) => {
    setSelectedWorkspaceCollectionIds((prev) =>
      prev.includes(collectionId) ? prev.filter((id) => id !== collectionId) : [...prev, collectionId]
    );
  };

  const handleAddToWorkspace = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setSendMessage("Login required before adding to workspace.");
      return;
    }

    if (!url.trim()) {
      setSendMessage("Enter URL before adding to workspace.");
      return;
    }

    if (selectedWorkspaceCollectionIds.length === 0) {
      setSendMessage("Select at least one workspace collection.");
      return;
    }

    const headersJson = JSON.stringify(headerKey.trim() ? { [headerKey.trim()]: headerValue } : {});
    const queryParamsJson = JSON.stringify(queryKey.trim() ? { [queryKey.trim()]: queryValue.trim() } : {});
    const bodyContent =
      bodyMode === "json"
        ? bodyJson
        : JSON.stringify(formDataKey.trim() ? { [formDataKey.trim()]: formDataValue } : {});

    try {
      await apiRequest("/api/workspaces/requests/add", {
        method: "POST",
        body: JSON.stringify({
          userId: sessionUser.userId,
          workspaceCollectionIds: selectedWorkspaceCollectionIds,
          url: url.trim(),
          method,
          headersJson,
          queryParamsJson,
          bodyMode,
          bodyContent,
        }),
      });
      setShowAddToWorkspaceModal(false);
      setSelectedWorkspaceCollectionIds([]);
      setSendMessage("Request config added to selected workspace collections.");
    } catch (error) {
      setSendMessage(error instanceof Error ? error.message : "Failed to add to workspace.");
    }
  };

  const handleClearBuilder = () => {
    setUrl("");
    setMethod("GET");
    setSelectedEnvironmentId("");
    setActiveTab("headers");
    setBodyMode("json");
    setHeaderKey("");
    setHeaderValue("");
    setQueryKey("");
    setQueryValue("");
    setBodyJson("");
    setFormDataKey("");
    setFormDataValue("");
    setHasSentRequest(false);
    setResponseStatus(null);
    setResponseTimeMs(null);
    setResponseBody("");
    setResponseHeaders([]);
    setSendMessage("Builder configuration cleared.");
  };

  return (
    <main className="dashboard-main">
      <h1 className="dashboard-title">Request Builder</h1>
      <p className="dashboard-subtitle">
        Build and test API requests from one place.
      </p>

      <section className="request-builder-card">
        <div className="request-row">
          <input
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="request-url-input"
            placeholder="Enter URL"
            aria-label="Request URL"
          />

          <select
            value={method}
            onChange={(event) => setMethod(event.target.value as RequestMethod)}
            className="request-method-select"
            aria-label="Select method"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={selectedEnvironmentId}
            onChange={(event) => setSelectedEnvironmentId(event.target.value ? Number(event.target.value) : "")}
            className="request-method-select"
            aria-label="Select environment"
          >
            <option value="">No environment</option>
            {environments.map((environment) => (
              <option key={environment.id} value={environment.id}>
                {environment.name}
              </option>
            ))}
          </select>

          <button type="button" className="btn btn-solid request-send-btn" onClick={handleSend} disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>

        <div className="request-row-actions">
          <button type="button" className="btn btn-ghost" onClick={handleClearBuilder}>
            Clear
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowAddToCollectionModal(true)}>
            Add to collection
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowAddToWorkspaceModal(true)}>
            Add to workspace
          </button>
        </div>

        {sendMessage && <p className="request-feedback">{sendMessage}</p>}

        <div className="request-tabs" role="tablist" aria-label="Request tabs">
          <button
            type="button"
            className={`request-tab-btn ${activeTab === "headers" ? "is-active" : ""}`}
            onClick={() => setActiveTab("headers")}
            role="tab"
            aria-selected={activeTab === "headers"}
          >
            Headers
          </button>
          <button
            type="button"
            className={`request-tab-btn ${activeTab === "query" ? "is-active" : ""}`}
            onClick={() => setActiveTab("query")}
            role="tab"
            aria-selected={activeTab === "query"}
          >
            Query params
          </button>
          <button
            type="button"
            className={`request-tab-btn ${activeTab === "body" ? "is-active" : ""}`}
            onClick={() => setActiveTab("body")}
            role="tab"
            aria-selected={activeTab === "body"}
          >
            Body
          </button>
        </div>

        <div className="request-tab-panel">
          {activeTab === "headers" && (
            <div className="kv-grid">
              <input
                type="text"
                placeholder="Header key"
                value={headerKey}
                onChange={(event) => setHeaderKey(event.target.value)}
              />
              <input
                type="text"
                placeholder="Header value"
                value={headerValue}
                onChange={(event) => setHeaderValue(event.target.value)}
              />
            </div>
          )}

          {activeTab === "query" && (
            <div className="kv-grid">
              <input type="text" placeholder="Param key" value={queryKey} onChange={(event) => setQueryKey(event.target.value)} />
              <input
                type="text"
                placeholder="Param value"
                value={queryValue}
                onChange={(event) => setQueryValue(event.target.value)}
              />
            </div>
          )}

          {activeTab === "body" && (
            <div className="body-panel">
              <div className="body-mode-switch">
                <button
                  type="button"
                  className={`request-tab-btn ${bodyMode === "json" ? "is-active" : ""}`}
                  onClick={() => setBodyMode("json")}
                >
                  JSON
                </button>
                <button
                  type="button"
                  className={`request-tab-btn ${bodyMode === "form-data" ? "is-active" : ""}`}
                  onClick={() => setBodyMode("form-data")}
                >
                  form-data
                </button>
              </div>

              {bodyMode === "json" ? (
                <textarea
                  className="request-body-input"
                  value={bodyJson}
                  onChange={(event) => setBodyJson(event.target.value)}
                  placeholder='{
  "key": "value"
}'
                />
              ) : (
                <div className="kv-grid">
                  <input
                    type="text"
                    placeholder="Field key"
                    value={formDataKey}
                    onChange={(event) => setFormDataKey(event.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Field value"
                    value={formDataValue}
                    onChange={(event) => setFormDataValue(event.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="response-card" aria-live="polite">
        <div className="response-header-row">
          <h2>Response</h2>
          {hasSentRequest && (
            <p className="response-meta">
              Status: <strong>{responseStatus ?? "-"}</strong> | Time: <strong>{responseTimeMs ?? "-"} ms</strong>
            </p>
          )}
        </div>

        {!hasSentRequest ? (
          <p className="response-empty">No response</p>
        ) : (
          <>
            <div className="response-subsection">
              <h3>Headers</h3>
              {responseHeaders.length === 0 ? (
                <p className="response-empty-small">No headers</p>
              ) : (
                <ul className="response-header-list">
                  {responseHeaders.map((header) => (
                    <li key={`${header.key}-${header.value}`}>
                      <strong>{header.key}:</strong> {header.value}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="response-subsection">
              <h3>Body</h3>
              <pre className="response-body">{responseBody || "<empty>"}</pre>
            </div>
          </>
        )}
      </section>

      {showAddToCollectionModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>Add to Collections</h2>

            {collections.length === 0 ? (
              <p className="collections-empty">No collections available. Create one in Collections tab.</p>
            ) : (
              <div className="collection-select-list">
                {collections.map((collection) => (
                  <label key={collection.id} className="collection-select-item">
                    <input
                      type="checkbox"
                      checked={selectedCollectionIds.includes(collection.id)}
                      onChange={() => handleToggleCollection(collection.id)}
                    />
                    <span>{collection.name}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddToCollectionModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-solid" onClick={handleAddToCollections}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddToWorkspaceModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card-large">
            <h2>Add to Workspace</h2>

            {workspaces.length === 0 ? (
              <p className="collections-empty">No workspaces available. Create one in Workspaces tab.</p>
            ) : (
              <div className="workspace-select-list">
                {workspaces.map((workspace) => {
                  const isExpanded = expandedWorkspaceIds.includes(workspace.id);
                  const collectionsForWorkspace = workspaceCollectionsMap[workspace.id] ?? [];

                  return (
                    <div key={workspace.id} className="workspace-select-group">
                      <button
                        type="button"
                        className="workspace-select-toggle"
                        onClick={() => handleToggleWorkspaceExpand(workspace.id)}
                      >
                        <span>{workspace.name}</span>
                        <span>{isExpanded ? "-" : "+"}</span>
                      </button>

                      {isExpanded && (
                        <div className="workspace-collection-list">
                          {collectionsForWorkspace.length === 0 ? (
                            <p className="collections-empty">No collections in this workspace.</p>
                          ) : (
                            collectionsForWorkspace.map((workspaceCollection) => (
                              <label key={workspaceCollection.id} className="collection-select-item">
                                <input
                                  type="checkbox"
                                  checked={selectedWorkspaceCollectionIds.includes(workspaceCollection.id)}
                                  onChange={() => handleToggleWorkspaceCollectionSelection(workspaceCollection.id)}
                                />
                                <span>{workspaceCollection.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddToWorkspaceModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-solid" onClick={handleAddToWorkspace}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

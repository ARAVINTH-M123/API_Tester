"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getSessionUser } from "@/lib/auth-session";
import { useParams, useRouter } from "next/navigation";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";
type BodyMode = "json" | "form-data";

type WorkspaceSavedRequest = {
  id: number;
  workspaceCollectionId: number;
  url: string;
  method: RequestMethod;
  headersJson?: string | null;
  queryParamsJson?: string | null;
  bodyMode?: BodyMode | null;
  bodyContent?: string | null;
  createdAt: string;
  updatedAt: string;
};

const HISTORY_SELECTION_KEY = "apiTesterSelectedHistory";

export default function WorkspaceCollectionRequestsPage() {
  const params = useParams<{ workspaceId: string; collectionId: string }>();
  const router = useRouter();
  const workspaceId = Number(params.workspaceId);
  const collectionId = Number(params.collectionId);

  const [requests, setRequests] = useState<WorkspaceSavedRequest[]>([]);
  const [filterMethod, setFilterMethod] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);

  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<RequestMethod>("GET");
  const [headersJson, setHeadersJson] = useState("{}");
  const [queryParamsJson, setQueryParamsJson] = useState("{}");
  const [bodyMode, setBodyMode] = useState<BodyMode>("json");
  const [bodyContent, setBodyContent] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const methodParam = filterMethod === "ALL" ? "" : `?method=${filterMethod}`;
      const response = await apiRequest<WorkspaceSavedRequest[]>(
        `/api/workspaces/collections/${collectionId}/requests${methodParam}`
      );
      setRequests(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, [collectionId, filterMethod]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const openEditModal = (item: WorkspaceSavedRequest) => {
    setEditingRequestId(item.id);
    setUrl(item.url);
    setMethod(item.method);
    setHeadersJson(item.headersJson || "{}");
    setQueryParamsJson(item.queryParamsJson || "{}");
    setBodyMode(item.bodyMode === "form-data" ? "form-data" : "json");
    setBodyContent(item.bodyContent || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setError("Login required.");
      return;
    }

    if (!editingRequestId) {
      setError("Select a request to edit.");
      return;
    }

    if (!url.trim()) {
      setError("URL is required.");
      return;
    }

    try {
      setError("");
      await apiRequest(`/api/workspaces/collections/requests/${editingRequestId}?userId=${sessionUser.userId}`, {
        method: "PUT",
        body: JSON.stringify({
          url: url.trim(),
          method,
          headersJson,
          queryParamsJson,
          bodyMode,
          bodyContent,
        }),
      });

      setShowModal(false);
      setEditingRequestId(null);
      await loadRequests();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update request.");
    }
  };

  const handleUseRequest = (item: WorkspaceSavedRequest) => {
    window.localStorage.setItem(
      HISTORY_SELECTION_KEY,
      JSON.stringify({
        id: item.id,
        userId: 0,
        url: item.url,
        method: item.method,
        headersJson: item.headersJson,
        queryParamsJson: item.queryParamsJson,
        bodyMode: item.bodyMode,
        bodyContent: item.bodyContent,
        statusCode: 0,
        responseTimeMs: 0,
        requestedAt: new Date().toISOString(),
      })
    );
    router.push("/dashboard");
  };

  return (
    <main className="dashboard-main">
      <div className="section-header-row">
        <div>
          <h1 className="dashboard-title">Workspace Collection {collectionId}</h1>
          <p className="dashboard-subtitle">Saved requests inside workspace {workspaceId} collection.</p>
        </div>

        <div className="collection-actions-row">
          <select
            className="request-method-select"
            value={filterMethod}
            onChange={(event) => setFilterMethod(event.target.value)}
            aria-label="Filter method"
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      <section className="collections-card">
        {loading && <p className="collections-empty">Loading requests...</p>}
        {!loading && error && <p className="collections-error">{error}</p>}
        {!loading && !error && requests.length === 0 && <p className="collections-empty">No saved requests found.</p>}

        {!loading && !error && requests.length > 0 && (
          <div className="saved-request-list">
            {requests.map((item) => (
              <article key={item.id} className="saved-request-item">
                <div>
                  <p className="saved-request-method">{item.method}</p>
                  <p className="saved-request-url">{item.url}</p>
                  <p className="saved-request-updated">Updated {new Date(item.updatedAt).toLocaleString()}</p>
                </div>
                <div className="saved-request-actions">
                  <button type="button" className="history-use-btn" onClick={() => handleUseRequest(item)}>
                    Use
                  </button>
                  <button type="button" className="collection-edit-btn" onClick={() => openEditModal(item)}>
                    Edit
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card-large">
            <h2>Edit Saved Request</h2>

            <div className="request-row request-row-collection-modal">
              <input
                type="text"
                className="request-url-input"
                placeholder="Enter URL"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
              <select
                className="request-method-select"
                value={method}
                onChange={(event) => setMethod(event.target.value as RequestMethod)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="request-tab-panel">
              <div className="kv-grid">
                <textarea
                  className="request-body-input"
                  value={headersJson}
                  onChange={(event) => setHeadersJson(event.target.value)}
                  placeholder='Headers JSON\n{"Authorization":"Bearer token"}'
                />
                <textarea
                  className="request-body-input"
                  value={queryParamsJson}
                  onChange={(event) => setQueryParamsJson(event.target.value)}
                  placeholder='Query Params JSON\n{"page":"1"}'
                />
              </div>

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

              <textarea
                className="request-body-input"
                value={bodyContent}
                onChange={(event) => setBodyContent(event.target.value)}
                placeholder={bodyMode === "json" ? '{"key":"value"}' : '{"field":"value"}'}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-solid" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

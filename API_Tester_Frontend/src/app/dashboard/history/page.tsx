"use client";

import { useEffect, useState } from "react";
import { getSessionUser } from "@/lib/auth-session";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

type HistoryItem = {
  id: number;
  userId: number;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headersJson?: string | null;
  queryParamsJson?: string | null;
  bodyMode?: "json" | "form-data" | null;
  bodyContent?: string | null;
  responseHeadersJson?: string | null;
  responseBody?: string | null;
  statusCode: number;
  responseTimeMs: number;
  requestedAt: string;
};

const HISTORY_SELECTION_KEY = "apiTesterSelectedHistory";

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadHistory = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setErrorMessage("Login required to view history.");
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const response = await apiRequest<HistoryItem[]>(`/api/history/${sessionUser.userId}`, {
        method: "GET",
      });
      setItems(response);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load history.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseHistory = (item: HistoryItem) => {
    window.localStorage.setItem(HISTORY_SELECTION_KEY, JSON.stringify(item));
    router.push("/dashboard");
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const handleClearHistory = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setErrorMessage("Login required to clear history.");
      return;
    }

    if (!window.confirm("Clear all request history for this account?")) {
      return;
    }

    try {
      setIsClearing(true);
      setErrorMessage("");
      await apiRequest(`/api/history/clear?userId=${sessionUser.userId}`, {
        method: "DELETE",
      });
      setItems([]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to clear history.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleRemoveHistoryItem = async (historyId: number) => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setErrorMessage("Login required to remove history item.");
      return;
    }

    try {
      setRemovingId(historyId);
      setErrorMessage("");
      await apiRequest(`/api/history/${historyId}?userId=${sessionUser.userId}`, {
        method: "DELETE",
      });
      setItems((prev) => prev.filter((item) => item.id !== historyId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to remove history item.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="dashboard-main">
      <div className="section-header-row">
        <div>
          <h1 className="dashboard-title">History</h1>
          <p className="dashboard-subtitle">Review all previously sent API requests for this account.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleClearHistory} disabled={isClearing || items.length === 0}>
          {isClearing ? "Clearing..." : "Clear History"}
        </button>
      </div>

      <section className="history-card">
        {isLoading && <p className="history-empty">Loading history...</p>}

        {!isLoading && errorMessage && <p className="history-error">{errorMessage}</p>}

        {!isLoading && !errorMessage && items.length === 0 && <p className="history-empty">No request history yet.</p>}

        {!isLoading && !errorMessage && items.length > 0 && (
          <div className="history-list">
            {items.map((item) => (
              <article key={item.id} className="history-item">
                <div className="history-item-top">
                  <span className={`method-pill method-${item.method.toLowerCase()}`}>{item.method}</span>
                  <p className="history-url">{item.url}</p>
                  <button type="button" className="history-use-btn" onClick={() => handleUseHistory(item)}>
                    Use
                  </button>
                  <button
                    type="button"
                    className="history-remove-btn"
                    onClick={() => handleRemoveHistoryItem(item.id)}
                    disabled={removingId === item.id}
                  >
                    {removingId === item.id ? "Removing..." : "Remove"}
                  </button>
                </div>

                <div className="history-meta">
                  <span>Status: {item.statusCode}</span>
                  <span>Time: {item.responseTimeMs} ms</span>
                  <span>{new Date(item.requestedAt).toLocaleString()}</span>
                </div>

                <div className="history-config-grid">
                  <p>
                    <strong>Headers:</strong> {item.headersJson || "{}"}
                  </p>
                  <p>
                    <strong>Query:</strong> {item.queryParamsJson || "{}"}
                  </p>
                  <p>
                    <strong>Body mode:</strong> {item.bodyMode || "-"}
                  </p>
                  <p>
                    <strong>Body:</strong> {item.bodyContent || "<empty>"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

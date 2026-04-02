"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getSessionUser } from "@/lib/auth-session";
import { useParams } from "next/navigation";

type VariableItem = {
  id?: number;
  key: string;
  value: string;
};

type EnvironmentDetail = {
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

export default function EnvironmentDetailPage() {
  const params = useParams<{ environmentId: string }>();
  const environmentId = Number(params.environmentId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [name, setName] = useState("");
  const [items, setItems] = useState<VariableItem[]>([]);

  const loadEnvironment = useCallback(async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setError("Login required.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const response = await apiRequest<EnvironmentDetail>(
        `/api/environments/${environmentId}?userId=${sessionUser.userId}`
      );
      setName(response.name);
      setItems(response.items.map((item) => ({ id: item.id, key: item.key, value: item.value })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load environment.");
    } finally {
      setLoading(false);
    }
  }, [environmentId]);

  useEffect(() => {
    void loadEnvironment();
  }, [loadEnvironment]);

  const activeVariables = useMemo(() => items.filter((item) => item.key.trim() !== "").length, [items]);

  const handleAddRow = () => {
    setItems((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleRowChange = (index: number, field: "key" | "value", nextValue: string) => {
    setItems((prev) => {
      const cloned = [...prev];
      cloned[index] = { ...cloned[index], [field]: nextValue };
      return cloned;
    });
  };

  const handleRemoveRow = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSave = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setError("Login required.");
      return;
    }

    if (!name.trim()) {
      setError("Environment name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      await apiRequest<EnvironmentDetail>(`/api/environments/${environmentId}?userId=${sessionUser.userId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          items: items.map((item) => ({ key: item.key, value: item.value })),
        }),
      });

      setSuccessMessage("Environment saved.");
      await loadEnvironment();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save environment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dashboard-main">
      <h1 className="dashboard-title">Environment Variables</h1>
      <p className="dashboard-subtitle">Use key-value variables in request URLs like {`{{baseUrl}}/users`}.</p>

      {loading && <p className="collections-empty">Loading environment...</p>}
      {!loading && error && <p className="collections-error">{error}</p>}
      {!loading && !error && successMessage && <p className="request-feedback">{successMessage}</p>}

      {!loading && !error && (
        <section className="environment-detail-card">
          <div className="environment-header-row">
            <div>
              <label className="environment-name-label" htmlFor="environmentName">
                Environment name
              </label>
              <input
                id="environmentName"
                className="modal-input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <p className="environment-count-text">Active variables: {activeVariables}</p>
          </div>

          <div className="environment-table-head">
            <span>Key</span>
            <span>Value</span>
            <span>Action</span>
          </div>

          <div className="environment-rows">
            {items.length === 0 && <p className="collections-empty">No variables yet.</p>}

            {items.map((item, index) => (
              <div key={item.id ?? `draft-${index}`} className="environment-row">
                <input
                  className="modal-input"
                  type="text"
                  placeholder="baseUrl"
                  value={item.key}
                  onChange={(event) => handleRowChange(index, "key", event.target.value)}
                />
                <input
                  className="modal-input"
                  type="text"
                  placeholder="https://api.example.com"
                  value={item.value}
                  onChange={(event) => handleRowChange(index, "value", event.target.value)}
                />
                <button type="button" className="collection-edit-btn" onClick={() => handleRemoveRow(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="environment-actions-row">
            <button type="button" className="btn btn-ghost" onClick={handleAddRow}>
              Add
            </button>
            <button type="button" className="btn btn-solid" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

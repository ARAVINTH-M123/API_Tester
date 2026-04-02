"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { getSessionUser } from "@/lib/auth-session";

type EnvironmentItem = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<EnvironmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [environmentName, setEnvironmentName] = useState("");

  const loadEnvironments = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setError("Login required.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const response = await apiRequest<EnvironmentItem[]>(`/api/environments?userId=${sessionUser.userId}`);
      setEnvironments(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load environments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEnvironments();
  }, []);

  const handleCreateEnvironment = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setError("Login required.");
      return;
    }

    if (!environmentName.trim()) {
      setError("Environment name is required.");
      return;
    }

    try {
      setError("");
      await apiRequest("/api/environments", {
        method: "POST",
        body: JSON.stringify({
          userId: sessionUser.userId,
          name: environmentName.trim(),
        }),
      });

      setShowModal(false);
      setEnvironmentName("");
      await loadEnvironments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create environment.");
    }
  };

  return (
    <main className="dashboard-main">
      <div className="section-header-row">
        <div>
          <h1 className="dashboard-title">Environments</h1>
          <p className="dashboard-subtitle">Create and manage variable sets for different API targets.</p>
        </div>
        <button type="button" className="btn btn-solid" onClick={() => setShowModal(true)}>
          New
        </button>
      </div>

      <section className="collections-card">
        {loading && <p className="collections-empty">Loading environments...</p>}
        {!loading && error && <p className="collections-error">{error}</p>}
        {!loading && !error && environments.length === 0 && (
          <p className="collections-empty">No environments yet. Create one with the New button.</p>
        )}

        {!loading && !error && environments.length > 0 && (
          <div className="collections-list">
            {environments.map((environment) => (
              <article key={environment.id} className="collection-item-card">
                <Link href={`/dashboard/environments/${environment.id}`} className="collection-item-link">
                  <h3>{environment.name}</h3>
                  <p>Updated {new Date(environment.updatedAt).toLocaleString()}</p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>New Environment</h2>
            <input
              className="modal-input"
              type="text"
              value={environmentName}
              onChange={(event) => setEnvironmentName(event.target.value)}
              placeholder="Enter environment name"
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-solid" onClick={handleCreateEnvironment}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

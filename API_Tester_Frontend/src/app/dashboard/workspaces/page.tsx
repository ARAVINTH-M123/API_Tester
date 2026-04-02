"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { getSessionUser } from "@/lib/auth-session";

type WorkspaceItem = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
};

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<number | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");

  const loadWorkspaces = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setError("Login required.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const response = await apiRequest<WorkspaceItem[]>(`/api/workspaces?userId=${sessionUser.userId}`);
      setWorkspaces(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workspaces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkspaces();
  }, []);

  const openCreateModal = () => {
    setEditingWorkspaceId(null);
    setWorkspaceName("");
    setShowModal(true);
  };

  const openEditModal = (workspace: WorkspaceItem) => {
    setEditingWorkspaceId(workspace.id);
    setWorkspaceName(workspace.name);
    setShowModal(true);
  };

  const handleSaveWorkspace = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setError("Login required.");
      return;
    }

    if (!workspaceName.trim()) {
      setError("Workspace name is required.");
      return;
    }

    try {
      setError("");
      if (editingWorkspaceId) {
        await apiRequest(`/api/workspaces/${editingWorkspaceId}?userId=${sessionUser.userId}`, {
          method: "PUT",
          body: JSON.stringify({ name: workspaceName.trim() }),
        });
      } else {
        await apiRequest("/api/workspaces", {
          method: "POST",
          body: JSON.stringify({
            userId: sessionUser.userId,
            name: workspaceName.trim(),
          }),
        });
      }

      setShowModal(false);
      setWorkspaceName("");
      setEditingWorkspaceId(null);
      await loadWorkspaces();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save workspace.");
    }
  };

  return (
    <main className="dashboard-main">
      <div className="section-header-row">
        <div>
          <h1 className="dashboard-title">Workspaces</h1>
          <p className="dashboard-subtitle">Group collections by project and workflow context.</p>
        </div>
        <button type="button" className="btn btn-solid" onClick={openCreateModal}>
          New
        </button>
      </div>

      <section className="collections-card">
        {loading && <p className="collections-empty">Loading workspaces...</p>}
        {!loading && error && <p className="collections-error">{error}</p>}
        {!loading && !error && workspaces.length === 0 && (
          <p className="collections-empty">No workspaces yet. Create one with the New button.</p>
        )}

        {!loading && !error && workspaces.length > 0 && (
          <div className="collections-list">
            {workspaces.map((workspace) => (
              <article key={workspace.id} className="collection-item-card">
                <Link href={`/dashboard/workspaces/${workspace.id}`} className="collection-item-link">
                  <h3>{workspace.name}</h3>
                  <p>Created {new Date(workspace.createdAt).toLocaleString()}</p>
                </Link>
                <button type="button" className="collection-edit-btn" onClick={() => openEditModal(workspace)}>
                  Edit
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>{editingWorkspaceId ? "Edit Workspace" : "New Workspace"}</h2>
            <input
              className="modal-input"
              type="text"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Enter workspace name"
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-solid" onClick={handleSaveWorkspace}>
                {editingWorkspaceId ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

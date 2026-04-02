"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { getSessionUser } from "@/lib/auth-session";
import { useParams } from "next/navigation";

type WorkspaceCollectionItem = {
  id: number;
  workspaceId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type WorkspaceItem = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
};

export default function WorkspaceDetailPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = Number(params.workspaceId);
  const [workspaceName, setWorkspaceName] = useState("");
  const [collections, setCollections] = useState<WorkspaceCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<number | null>(null);
  const [collectionName, setCollectionName] = useState("");

  const loadWorkspaceCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiRequest<WorkspaceCollectionItem[]>(`/api/workspaces/${workspaceId}/collections`);
      setCollections(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workspace collections.");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadWorkspaceCollections();
  }, [loadWorkspaceCollections]);

  useEffect(() => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setWorkspaceName(`Workspace ${workspaceId}`);
      return;
    }

    const loadWorkspaceName = async () => {
      try {
        const allWorkspaces = await apiRequest<WorkspaceItem[]>(`/api/workspaces?userId=${sessionUser.userId}`);
        const current = allWorkspaces.find((item) => item.id === workspaceId);
        setWorkspaceName(current?.name ?? `Workspace ${workspaceId}`);
      } catch {
        setWorkspaceName(`Workspace ${workspaceId}`);
      }
    };

    void loadWorkspaceName();
  }, [workspaceId]);

  const openCreateModal = () => {
    setEditingCollectionId(null);
    setCollectionName("");
    setShowModal(true);
  };

  const openEditModal = (collection: WorkspaceCollectionItem) => {
    setEditingCollectionId(collection.id);
    setCollectionName(collection.name);
    setShowModal(true);
  };

  const handleSaveCollection = async () => {
    if (!collectionName.trim()) {
      setError("Collection name is required.");
      return;
    }

    try {
      setError("");
      if (editingCollectionId) {
        await apiRequest(`/api/workspaces/collections/${editingCollectionId}`, {
          method: "PUT",
          body: JSON.stringify({ name: collectionName.trim() }),
        });
      } else {
        await apiRequest("/api/workspaces/collections", {
          method: "POST",
          body: JSON.stringify({
            workspaceId,
            name: collectionName.trim(),
          }),
        });
      }

      setShowModal(false);
      setCollectionName("");
      setEditingCollectionId(null);
      await loadWorkspaceCollections();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save collection.");
    }
  };

  return (
    <main className="dashboard-main">
      <div className="section-header-row">
        <div>
          <h1 className="dashboard-title">{workspaceName || `Workspace ${workspaceId}`}</h1>
          <p className="dashboard-subtitle">Collections inside this workspace.</p>
        </div>
        <button type="button" className="btn btn-solid" onClick={openCreateModal}>
          New
        </button>
      </div>

      <section className="collections-card">
        {loading && <p className="collections-empty">Loading collections...</p>}
        {!loading && error && <p className="collections-error">{error}</p>}
        {!loading && !error && collections.length === 0 && <p className="collections-empty">No collections found.</p>}

        {!loading && !error && collections.length > 0 && (
          <div className="collections-list">
            {collections.map((collection) => (
              <article key={collection.id} className="collection-item-card">
                <Link
                  href={`/dashboard/workspaces/${workspaceId}/collections/${collection.id}`}
                  className="collection-item-link"
                >
                  <h3>{collection.name}</h3>
                  <p>Updated {new Date(collection.updatedAt).toLocaleString()}</p>
                </Link>
                <button type="button" className="collection-edit-btn" onClick={() => openEditModal(collection)}>
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
            <h2>{editingCollectionId ? "Edit Workspace Collection" : "New Workspace Collection"}</h2>
            <input
              className="modal-input"
              type="text"
              value={collectionName}
              onChange={(event) => setCollectionName(event.target.value)}
              placeholder="Enter collection name"
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-solid" onClick={handleSaveCollection}>
                {editingCollectionId ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

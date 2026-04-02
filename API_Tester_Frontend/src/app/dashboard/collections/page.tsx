"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { getSessionUser } from "@/lib/auth-session";

type CollectionItem = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<number | null>(null);
  const [collectionName, setCollectionName] = useState("");

  const loadCollections = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setError("Login required.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const response = await apiRequest<CollectionItem[]>(`/api/collections?userId=${sessionUser.userId}`);
      setCollections(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load collections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCollections();
  }, []);

  const openCreateModal = () => {
    setEditingCollectionId(null);
    setCollectionName("");
    setShowModal(true);
  };

  const openEditModal = (collection: CollectionItem) => {
    setEditingCollectionId(collection.id);
    setCollectionName(collection.name);
    setShowModal(true);
  };

  const handleSaveCollection = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setError("Login required.");
      return;
    }

    if (!collectionName.trim()) {
      setError("Collection name is required.");
      return;
    }

    try {
      setError("");
      if (editingCollectionId) {
        await apiRequest(`/api/collections/${editingCollectionId}?userId=${sessionUser.userId}`, {
          method: "PUT",
          body: JSON.stringify({ name: collectionName.trim() }),
        });
      } else {
        await apiRequest("/api/collections", {
          method: "POST",
          body: JSON.stringify({
            userId: sessionUser.userId,
            name: collectionName.trim(),
          }),
        });
      }

      setShowModal(false);
      setCollectionName("");
      setEditingCollectionId(null);
      await loadCollections();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save collection.");
    }
  };

  return (
    <main className="dashboard-main">
      <div className="section-header-row">
        <div>
          <h1 className="dashboard-title">Collections</h1>
          <p className="dashboard-subtitle">Organize reusable API request groups.</p>
        </div>
        <button type="button" className="btn btn-solid" onClick={openCreateModal}>
          New
        </button>
      </div>

      <section className="collections-card">
        {loading && <p className="collections-empty">Loading collections...</p>}
        {!loading && error && <p className="collections-error">{error}</p>}
        {!loading && !error && collections.length === 0 && (
          <p className="collections-empty">No collections yet. Create one with the New button.</p>
        )}

        {!loading && !error && collections.length > 0 && (
          <div className="collections-list">
            {collections.map((collection) => (
              <article key={collection.id} className="collection-item-card">
                <Link href={`/dashboard/collections/${collection.id}`} className="collection-item-link">
                  <h3>{collection.name}</h3>
                  <p>Created {new Date(collection.createdAt).toLocaleString()}</p>
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
            <h2>{editingCollectionId ? "Edit Collection" : "New Collection"}</h2>
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

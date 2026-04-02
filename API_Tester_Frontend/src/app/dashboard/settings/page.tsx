"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getSessionUser, saveSessionUser } from "@/lib/auth-session";

type SettingsOverviewResponse = {
  userId: number;
  name: string;
  email: string;
  createdAt: string;
  historyCount: number;
  collectionCount: number;
  savedCollectionRequestCount: number;
  workspaceCount: number;
  workspaceCollectionCount: number;
  workspaceSavedRequestCount: number;
};

type UpdateNameResponse = {
  userId: number;
  name: string;
  email: string;
  message: string;
};

type ClearAccountDataResponse = {
  message: string;
  deletedHistoryCount: number;
  deletedCollectionsCount: number;
  deletedCollectionRequestsCount: number;
  deletedWorkspacesCount: number;
  deletedWorkspaceCollectionsCount: number;
  deletedWorkspaceRequestsCount: number;
  totalDeletedItems: number;
};

const HISTORY_SELECTION_KEY = "apiTesterSelectedHistory";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [clearResult, setClearResult] = useState<ClearAccountDataResponse | null>(null);
  const [overview, setOverview] = useState<SettingsOverviewResponse | null>(null);

  const totalArtifacts = useMemo(() => {
    if (!overview) {
      return 0;
    }

    return (
      overview.historyCount +
      overview.collectionCount +
      overview.savedCollectionRequestCount +
      overview.workspaceCount +
      overview.workspaceCollectionCount +
      overview.workspaceSavedRequestCount
    );
  }, [overview]);

  const canSaveName = !!overview && nameDraft.trim().length > 0 && nameDraft.trim() !== overview.name;

  const loadOverview = async () => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      setErrorMessage("Login required to access settings.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest<SettingsOverviewResponse>(`/api/settings/users/${sessionUser.userId}`);
      setOverview(response);
      setNameDraft(response.name);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const handleSaveName = async () => {
    if (!overview || !canSaveName) {
      return;
    }

    try {
      setIsSavingName(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await apiRequest<UpdateNameResponse>(`/api/settings/users/${overview.userId}/name`, {
        method: "PUT",
        body: JSON.stringify({ name: nameDraft.trim() }),
      });

      const currentSession = getSessionUser();
      if (currentSession) {
        saveSessionUser({
          ...currentSession,
          name: response.name,
        });
      }

      setOverview((prev) => (prev ? { ...prev, name: response.name } : prev));
      setNameDraft(response.name);
      setSuccessMessage(response.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update name.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleClearAccountData = async () => {
    if (!overview || confirmText.trim().toUpperCase() !== "CLEAR") {
      return;
    }

    try {
      setIsClearingData(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await apiRequest<ClearAccountDataResponse>(`/api/settings/users/${overview.userId}/data`, {
        method: "DELETE",
      });

      window.localStorage.removeItem(HISTORY_SELECTION_KEY);
      setClearResult(response);
      setSuccessMessage(response.message);
      setShowDangerModal(false);
      setConfirmText("");
      await loadOverview();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to clear account data.");
    } finally {
      setIsClearingData(false);
    }
  };

  return (
    <main className="dashboard-main">
      <h1 className="dashboard-title">Settings</h1>
      <p className="dashboard-subtitle">Manage your account profile and data privacy controls.</p>

      {errorMessage && <p className="collections-error">{errorMessage}</p>}
      {!errorMessage && successMessage && <p className="request-feedback">{successMessage}</p>}

      <section className="settings-card">
        {isLoading && <p className="collections-empty">Loading settings...</p>}

        {!isLoading && overview && (
          <>
            <div className="settings-section-header">
              <div className="settings-avatar" aria-hidden="true">
                {overview.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2>Profile</h2>
                <p className="settings-meta-line">Email: {overview.email}</p>
                <p className="settings-meta-line">Member since: {new Date(overview.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="settings-name-editor">
              <label htmlFor="displayName">Display name</label>
              <div className="settings-name-actions">
                <input
                  id="displayName"
                  className="modal-input"
                  type="text"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  placeholder="Enter your display name"
                />
                <button type="button" className="btn btn-solid" disabled={!canSaveName || isSavingName} onClick={handleSaveName}>
                  {isSavingName ? "Saving..." : "Save name"}
                </button>
              </div>
            </div>

            <div className="settings-summary-grid">
              <article className="settings-stat-card">
                <p className="settings-stat-label">Request history</p>
                <p className="settings-stat-value">{overview.historyCount}</p>
              </article>
              <article className="settings-stat-card">
                <p className="settings-stat-label">Collections</p>
                <p className="settings-stat-value">{overview.collectionCount}</p>
              </article>
              <article className="settings-stat-card">
                <p className="settings-stat-label">Collection requests</p>
                <p className="settings-stat-value">{overview.savedCollectionRequestCount}</p>
              </article>
              <article className="settings-stat-card">
                <p className="settings-stat-label">Workspaces</p>
                <p className="settings-stat-value">{overview.workspaceCount}</p>
              </article>
              <article className="settings-stat-card">
                <p className="settings-stat-label">Workspace collections</p>
                <p className="settings-stat-value">{overview.workspaceCollectionCount}</p>
              </article>
              <article className="settings-stat-card">
                <p className="settings-stat-label">Workspace requests</p>
                <p className="settings-stat-value">{overview.workspaceSavedRequestCount}</p>
              </article>
            </div>

            <div className="settings-privacy-note">
              <h3>Respect and privacy</h3>
              <p>
                You are always in control. Clearing account data removes your saved requests, history, collections, and
                workspaces from this account.
              </p>
            </div>

            <div className="settings-danger-zone">
              <h3>Danger zone</h3>
              <p>
                Clearing account data will permanently remove <strong>{totalArtifacts}</strong> stored items. This action
                cannot be undone.
              </p>
              <button type="button" className="btn settings-danger-btn" onClick={() => setShowDangerModal(true)}>
                Clear account data
              </button>
            </div>

            {clearResult && (
              <div className="settings-clear-result">
                <p>
                  Last cleanup removed {clearResult.totalDeletedItems} items (History: {clearResult.deletedHistoryCount},
                  Collections: {clearResult.deletedCollectionsCount}, Collection requests: {clearResult.deletedCollectionRequestsCount},
                  Workspaces: {clearResult.deletedWorkspacesCount}, Workspace collections: {clearResult.deletedWorkspaceCollectionsCount},
                  Workspace requests: {clearResult.deletedWorkspaceRequestsCount}).
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {showDangerModal && overview && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>Clear account data?</h2>
            <p className="settings-warning-text">
              This will permanently delete all history, collections, and workspace data for <strong>{overview.email}</strong>.
            </p>
            <p className="settings-warning-text">Type CLEAR to continue.</p>
            <input
              className="modal-input"
              type="text"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="Type CLEAR"
            />
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  if (!isClearingData) {
                    setShowDangerModal(false);
                    setConfirmText("");
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn settings-danger-btn"
                disabled={confirmText.trim().toUpperCase() !== "CLEAR" || isClearingData}
                onClick={handleClearAccountData}
              >
                {isClearingData ? "Clearing..." : "Yes, clear data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

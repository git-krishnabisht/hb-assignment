import { useEffect, useState } from "react";
import { type DashboardProps } from "../App";
import { StarIcon, TrashIcon } from "./Icons";
import { api } from "../utils/api";

export interface Note {
  id: number;
  note: string;
  createdAt: string;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [dashboardNotes, setDashboardNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllNotes();
  }, []);

  const fetchAllNotes = async () => {
    try {
      setError("");
      const response = await api.fetchNotes();
      if (response.body) {
        setDashboardNotes(response.body);
      }
    } catch (error: any) {
      console.error("Error fetching notes:", error);
      setError("Failed to load notes");
      if (error.message.includes("Authentication failed")) {
        onLogout();
      }
    }
  };

  const handleCreateNewNote = async () => {
    if (!noteText.trim()) {
      setShowNoteInput(true);
      return;
    }

    if (noteText.trim().length < 1 || noteText.trim().length > 1000) {
      setError("Note must be between 1 and 1000 characters");
      return;
    }

    setDashboardLoading(true);
    setError("");
    try {
      await api.createNote(noteText.trim());
      setNoteText("");
      setShowNoteInput(false);
      await fetchAllNotes();
    } catch (error: any) {
      console.error("Error creating note:", error);
      setError("Failed to create note");
      if (error.message.includes("Authentication failed")) {
        onLogout();
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleDeleteSelectedNotes = async (noteIds: number[]) => {
    if (noteIds.length === 0) return;

    setDeleteLoading(true);
    setError("");
    try {
      await api.deleteNotes(noteIds);
      setSelectedNoteIds([]);
      await fetchAllNotes();
    } catch (error: any) {
      console.error("Error deleting notes:", error);
      setError("Failed to delete notes");
      if (error.message.includes("Authentication failed")) {
        onLogout();
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleSelectNote = (noteId: number) => {
    setSelectedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleLogoutClick = async () => {
    setDashboardLoading(true);
    try {
      await onLogout();
    } finally {
      setDashboardLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
              <StarIcon />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          </div>
          <button
            onClick={handleLogoutClick}
            disabled={dashboardLoading}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
          >
            {dashboardLoading ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-1 text-gray-900">
            Welcome, {user.name || "User"}!
          </h2>
          <p className="text-gray-600 text-sm">
            Email:{" "}
            {user.email.length > 20
              ? user.email.substring(0, 6) +
                "***" +
                user.email.substring(user.email.indexOf("@"))
              : user.email}
          </p>
          {user.hasGoogleAuth && (
            <p className="text-gray-500 text-xs mt-1">Connected with Google</p>
          )}
        </div>

        <button
          onClick={handleCreateNewNote}
          disabled={dashboardLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-4 transition-colors"
        >
          {dashboardLoading ? "Creating..." : "Create Note"}
        </button>

        {showNoteInput && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-200">
            <textarea
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                setError("");
              }}
              placeholder="Write your note here... (1-1000 characters)"
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={1000}
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {noteText.length}/1000 characters
              </span>
            </div>
            <div className="flex space-x-3 mt-3">
              <button
                onClick={handleCreateNewNote}
                disabled={
                  dashboardLoading || !noteText.trim() || noteText.length > 1000
                }
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {dashboardLoading ? "Saving..." : "Save Note"}
              </button>
              <button
                onClick={() => {
                  setNoteText("");
                  setShowNoteInput(false);
                  setError("");
                }}
                disabled={dashboardLoading}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Notes ({dashboardNotes.length})
            </h3>
            {selectedNoteIds.length > 0 && (
              <button
                onClick={() => handleDeleteSelectedNotes(selectedNoteIds)}
                disabled={deleteLoading}
                className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-1 text-sm disabled:opacity-50"
              >
                <TrashIcon />
                <span>
                  {deleteLoading
                    ? "Deleting..."
                    : `Delete (${selectedNoteIds.length})`}
                </span>
              </button>
            )}
          </div>

          {dashboardNotes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No notes yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Create your first note to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardNotes.map((currentNote, index) => (
                <div
                  key={currentNote.id}
                  className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 ${
                    selectedNoteIds.includes(currentNote.id)
                      ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
                      : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNoteIds.includes(currentNote.id)}
                      onChange={() => toggleSelectNote(currentNote.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-medium mb-2 break-words">
                        Note {index + 1}
                      </p>
                      <p className="text-gray-700 text-sm break-words whitespace-pre-wrap">
                        {currentNote.note}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(currentNote.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleDeleteSelectedNotes([currentNote.id])
                      }
                      disabled={deleteLoading}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {dashboardNotes.length > 1 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                if (selectedNoteIds.length === dashboardNotes.length) {
                  setSelectedNoteIds([]);
                } else {
                  setSelectedNoteIds(dashboardNotes.map((note) => note.id));
                }
              }}
              disabled={deleteLoading}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
            >
              {selectedNoteIds.length === dashboardNotes.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        )}

        <div className="h-6"></div>
      </div>
    </div>
  );
}

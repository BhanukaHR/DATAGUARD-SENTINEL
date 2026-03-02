import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/auth-service";
import { useAuthStore } from "../../store/auth-store";
import { toast } from "sonner";
import { Trash2, ShieldAlert, AlertTriangle, X } from "lucide-react";

const DATA_COLLECTIONS = [
  { key: "uploadEvents", label: "Upload Events", description: "File upload activity logs" },
  { key: "clipboardEvents", label: "Clipboard Events", description: "Clipboard copy activity logs" },
  { key: "usbEvents", label: "USB Events", description: "Removable media activity logs" },
  { key: "aiApplicationEvents", label: "AI Application Events", description: "AI app detection logs" },
  { key: "ftpEvents", label: "FTP Events", description: "FTP transfer activity logs" },
  { key: "emailEvents", label: "Email Events", description: "Email exfiltration activity logs" },
  { key: "alerts", label: "Alerts", description: "DLP alerts and notifications" },
  { key: "riskProfiles", label: "Risk Profiles", description: "User behavioral risk scores" },
  { key: "users", label: "Users", description: "Registered user accounts" },
  { key: "agents", label: "Agents", description: "Endpoint agent registrations" },
];

export function DeleteDataSection() {
  const { admin } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [confirmText, setConfirmText] = useState("");

  const authMutation = useMutation({
    mutationFn: (pwd: string) => authService.reauthenticate(pwd),
    onSuccess: (result) => {
      if (result.success) {
        setIsAuthenticated(true);
        setAuthError("");
      } else {
        setAuthError(result.error || "Authentication failed");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (collections: string[]) => authService.deleteAllFirestoreData(collections),
    onSuccess: (result) => {
      if (result.success) {
        const total = Object.values(result.deletedCounts).reduce((a, b) => a + b, 0);
        const summary = Object.entries(result.deletedCounts)
          .filter(([, count]) => count > 0)
          .map(([col, count]) => `${col}: ${count}`)
          .join(", ");
        toast.success(`Deleted ${total} documents`, { description: summary, duration: 8000 });
        handleClose();
      } else {
        toast.error("Delete failed: " + result.error);
      }
    },
  });

  const handleClose = () => {
    setShowModal(false);
    setPassword("");
    setAuthError("");
    setIsAuthenticated(false);
    setSelectedCollections([]);
    setConfirmText("");
  };

  const toggleCollection = (key: string) => {
    setSelectedCollections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => {
    if (selectedCollections.length === DATA_COLLECTIONS.length) {
      setSelectedCollections([]);
    } else {
      setSelectedCollections(DATA_COLLECTIONS.map((c) => c.key));
    }
  };

  const canDelete = isAuthenticated && selectedCollections.length > 0 && confirmText === "DELETE";

  return (
    <>
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-900">Delete Data</h3>
            <p className="text-sm text-slate-500 mt-1">
              Clear event history, alerts, and other collected data. Admin re-authentication is required.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete Data…
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-slate-900">Delete Data</h2>
              </div>
              <button onClick={handleClose} className="p-1 rounded hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-5">
              {/* Step 1: Admin Authentication */}
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                      Enter your admin password to verify your identity before proceeding.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Admin Email
                    </label>
                    <input
                      type="text"
                      value={admin?.email || ""}
                      disabled
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && password && authMutation.mutate(password)}
                      placeholder="Enter your admin password"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      autoFocus
                    />
                    {authError && (
                      <p className="text-xs text-red-600 mt-1">{authError}</p>
                    )}
                  </div>

                  <button
                    onClick={() => authMutation.mutate(password)}
                    disabled={!password || authMutation.isPending}
                    className="w-full px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {authMutation.isPending ? "Verifying…" : "Verify Identity"}
                  </button>
                </div>
              ) : (
                /* Step 2: Select collections & confirm */
                <div className="space-y-4">
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <ShieldAlert className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-green-800">
                      Identity verified as <strong>{admin?.email}</strong>. Select data to delete.
                    </p>
                  </div>

                  {/* Collection selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700">Select Collections</label>
                      <button
                        onClick={selectAll}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {selectedCollections.length === DATA_COLLECTIONS.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div className="space-y-1 max-h-52 overflow-y-auto border border-slate-200 rounded-lg p-2">
                      {DATA_COLLECTIONS.map((col) => (
                        <label
                          key={col.key}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            selectedCollections.includes(col.key)
                              ? "bg-red-50 border border-red-200"
                              : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCollections.includes(col.key)}
                            onChange={() => toggleCollection(col.key)}
                            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-slate-800">{col.label}</span>
                            <span className="text-xs text-slate-400 ml-2">{col.description}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Confirm */}
                  {selectedCollections.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Type <span className="font-mono text-red-600">DELETE</span> to confirm
                      </label>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(selectedCollections)}
                      disabled={!canDelete || deleteMutation.isPending}
                      className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deleteMutation.isPending
                        ? "Deleting…"
                        : `Delete ${selectedCollections.length} Collection${selectedCollections.length !== 1 ? "s" : ""}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/auth-service";
import { toast } from "sonner";
import { formatDate } from "../../utils/formatters";

interface AgentAdmin {
  id: string;
  email?: string;
  machineName?: string;
  lastLoginAt?: { toDate?: () => Date } | string;
  passwordChangedAt?: { toDate?: () => Date } | string;
}

export function AgentAdminManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const { data: agentAdmins = [], isLoading } = useQuery({
    queryKey: ["agentAdmins"],
    queryFn: () => authService.listAgentAdmins(),
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      authService.changeAgentAdminPassword(id, password),
    onSuccess: () => {
      toast.success("Agent admin password updated");
      setEditingId(null);
      setNewPassword("");
      queryClient.invalidateQueries({ queryKey: ["agentAdmins"] });
    },
    onError: () => toast.error("Failed to update agent admin password"),
  });

  const changeEmailMutation = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      authService.changeAgentAdminEmail(id, email),
    onSuccess: () => {
      toast.success("Agent admin email updated");
      setEditingId(null);
      setNewEmail("");
      queryClient.invalidateQueries({ queryKey: ["agentAdmins"] });
    },
    onError: () => toast.error("Failed to update agent admin email"),
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-sm font-medium text-slate-900 mb-1">
        Agent Admin Accounts (ConfigUI)
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        These are the admin credentials used by ConfigUI / endpoint agent software.
        They are separate from your dashboard login. You can change their passwords
        and emails from here.
      </p>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading agent admins...</p>
      ) : agentAdmins.length === 0 ? (
        <p className="text-sm text-slate-400">No agent admin accounts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider border-b">
                <th className="py-2 text-left">Email</th>
                <th className="py-2 text-left">Machine</th>
                <th className="py-2 text-left">Last Login</th>
                <th className="py-2 text-left">Password Changed</th>
                <th className="py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(agentAdmins as AgentAdmin[]).map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50">
                  <td className="py-3">
                    {editingId === admin.id ? (
                      <input
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="px-2 py-1 text-sm border border-slate-200 rounded w-48"
                        placeholder="New email"
                      />
                    ) : (
                      <span className="text-slate-900">{admin.email}</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-500">{admin.machineName || "—"}</td>
                  <td className="py-3 text-slate-500">
                    {admin.lastLoginAt
                      ? formatDate(
                          typeof admin.lastLoginAt === "object" && admin.lastLoginAt.toDate
                            ? admin.lastLoginAt.toDate()
                            : new Date(String(admin.lastLoginAt))
                        )
                      : "Never"}
                  </td>
                  <td className="py-3 text-slate-500">
                    {admin.passwordChangedAt
                      ? formatDate(
                          typeof admin.passwordChangedAt === "object" && admin.passwordChangedAt.toDate
                            ? admin.passwordChangedAt.toDate()
                            : new Date(String(admin.passwordChangedAt))
                        )
                      : "—"}
                  </td>
                  <td className="py-3">
                    {editingId === admin.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          className="px-2 py-1 text-sm border border-slate-200 rounded w-32"
                        />
                        <button
                          onClick={() => {
                            if (newPassword) changePasswordMutation.mutate({ id: admin.id, password: newPassword });
                            if (newEmail && newEmail !== admin.email) changeEmailMutation.mutate({ id: admin.id, email: newEmail });
                          }}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setNewPassword(""); setNewEmail(""); }}
                          className="px-2 py-1 text-xs bg-slate-200 rounded hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(admin.id); setNewEmail(admin.email || ""); }}
                        className="px-2 py-1 text-xs bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                      >
                        Edit Credentials
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/user-service";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/Badges";
import { formatDate } from "../utils/formatters";
import { createColumnHelper } from "@tanstack/react-table";
import type { UserAccount } from "../types/user";
import { toast } from "sonner";
import { Users, Search } from "lucide-react";

const columnHelper = createColumnHelper<UserAccount>();

export function UsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userToRemove, setUserToRemove] = useState<string | null>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAllUsers(),
  });

  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => userService.removeUser(userId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("User and all associated data removed");
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error("Failed: " + result.error);
      }
      setUserToRemove(null);
    },
  });

  const markUninstalledMutation = useMutation({
    mutationFn: (userId: string) => userService.markUserAsUninstalled(userId),
    onSuccess: () => {
      toast.success("User marked as uninstalled");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const columns = useMemo(() => [
    columnHelper.accessor("username", {
      header: "Username",
      cell: (info) => (
        <button
          className="text-sm text-blue-600 hover:underline font-medium text-left"
          onClick={() => navigate(`/users/${info.row.original.userId}`)}
        >
          {info.getValue()}
        </button>
      ),
    }),
    columnHelper.accessor("employeeId", {
      header: "Employee ID",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("machineName", {
      header: "Machine",
      cell: (info) => <span className="text-xs text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("registeredAt", {
      header: "Registered",
      cell: (info) => (
        <span className="text-xs text-slate-500">
          {formatDate(info.getValue() instanceof Date ? info.getValue() : new Date(info.getValue() as string))}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div className="flex gap-1">
          <button
            onClick={() => navigate(`/users/${info.row.original.userId}`)}
            className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
          >
            View
          </button>
          {info.row.original.status === "active" && (
            <button
              onClick={() => markUninstalledMutation.mutate(info.row.original.userId)}
              className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 transition-colors"
            >
              Uninstall
            </button>
          )}
          <button
            onClick={() => setUserToRemove(info.row.original.userId)}
            className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          >
            Remove
          </button>
        </div>
      ),
    }),
  ], [navigate, markUninstalledMutation]);

  const filteredUsers = useMemo(() => {
    const users = usersData?.users || [];
    return users.filter((user) => {
      const matchesSearch = !searchTerm ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.machineName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [usersData, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search by name, employee ID, or machine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="uninstalled">Uninstalled</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredUsers} isLoading={isLoading} />

      {/* Remove User Dialog */}
      {userToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Remove User Permanently</h3>
            <p className="text-sm text-slate-600 mb-4">
              This action will permanently delete all data for user <strong className="font-mono">{userToRemove}</strong> including:
            </p>
            <ul className="text-sm text-slate-600 mb-4 space-y-1 list-disc pl-5">
              <li>User account record</li>
              <li>Risk profile and behavioral score</li>
              <li>All upload events</li>
              <li>All clipboard events</li>
              <li>All USB events</li>
              <li>All associated alerts</li>
              <li>Agent registration</li>
            </ul>
            <p className="text-xs text-amber-600 mb-4">
              Audit logs are preserved (immutable) for compliance.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setUserToRemove(null)}
                className="px-4 py-2 text-sm bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => removeUserMutation.mutate(userToRemove)}
                disabled={removeUserMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {removeUserMutation.isPending ? "Removing..." : "Remove User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

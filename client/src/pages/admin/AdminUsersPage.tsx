import { useDeferredValue, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { UserRole } from "../../types";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

interface AdminUsersResponse {
  data: AdminUser[];
  total: number;
}

const roleFilters: Array<{ label: string; value: "all" | UserRole }> = [
  { label: "All Roles", value: "all" },
  { label: "Students", value: "student" },
  { label: "Alumni", value: "alumni" },
  { label: "Admins", value: "admin" }
];

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" }
] as const;

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [role, setRole] = useState<(typeof roleFilters)[number]["value"]>("all");
  const [status, setStatus] = useState<(typeof statusFilters)[number]["value"]>("all");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery<AdminUsersResponse>({
    queryKey: ["admin-users", { search: deferredSearch, role, status }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (deferredSearch.trim()) params.search = deferredSearch.trim();
      if (role !== "all") params.role = role;
      if (status !== "all") params.status = status;
      const response = await api.get<AdminUsersResponse>("/admin/users", { params });
      return response.data;
    }
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, nextRole }: { id: string; nextRole: UserRole }) =>
      api.put(`/admin/user/${id}/role`, { role: nextRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setFeedback("Role updated successfully.");
      setErrorMessage(null);
    },
    onError: () => {
      setErrorMessage("Failed to update role. Please try again.");
      setFeedback(null);
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? api.delete(`/admin/users/${id}`) : api.patch(`/admin/users/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setFeedback("User status updated.");
      setErrorMessage(null);
    },
    onError: () => {
      setErrorMessage("Unable to update user status.");
      setFeedback(null);
    }
  });

  const activeCount = useMemo(() => users.filter((user) => user.isActive).length, [users]);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Manage Users</h2>
          <p className="text-sm text-muted">Search, filter, and moderate user accounts.</p>
          <p className="mt-2 text-xs text-muted/80">
            Showing {users.length} of {total} accounts • {activeCount} active
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="w-64 rounded bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40"
            placeholder="Search by email or name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded bg-white/5 px-3 py-2 text-sm text-white"
            value={role}
            onChange={(event) => setRole(event.target.value as typeof role)}
          >
            {roleFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="rounded bg-white/5 px-3 py-2 text-sm text-white"
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            {statusFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="neon-border overflow-hidden rounded-lg bg-surface/80">
        {(feedback || errorMessage) && (
          <div className="border-b border-white/10 bg-black/40 px-4 py-2 text-xs text-white/70">
            {feedback && <span className="text-green-300">{feedback}</span>}
            {errorMessage && <span className="text-red-300">{errorMessage}</span>}
          </div>
        )}
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/60">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading || isFetching ? (
              [...Array(6)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-3 text-white/40" colSpan={6}>
                    Loading users…
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-white/60" colSpan={6}>
                  No users match the current filters.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="text-white/90">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-white/50">{user._id}</div>
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded bg-white/10 px-2 py-1 text-xs"
                      value={user.role}
                      onChange={(event) =>
                        updateRoleMutation.mutate({ id: user._id, nextRole: event.target.value as UserRole })
                      }
                      disabled={updateRoleMutation.isPending || !user.isActive}
                    >
                      {roleFilters
                        .filter((option) => option.value !== "all")
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label.replace(/s$/, '')}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        user.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className={`rounded px-3 py-1 text-xs font-semibold transition ${
                        user.isActive
                          ? "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                          : "bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                      }`}
                      onClick={() => toggleActiveMutation.mutate({ id: user._id, isActive: user.isActive })}
                      disabled={toggleActiveMutation.isPending}
                    >
                      {user.isActive ? "Deactivate" : "Restore"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminUsersPage;

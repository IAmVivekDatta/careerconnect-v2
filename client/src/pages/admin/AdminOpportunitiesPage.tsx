import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";

type OpportunityStatus = "pending" | "approved" | "rejected";

interface AdminOpportunity {
  _id: string;
  title: string;
  company: string;
  status: OpportunityStatus;
  createdAt: string;
  applicantsCount: number;
  type: string;
  postedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

interface AdminOpportunityResponse {
  data: AdminOpportunity[];
  total: number;
}

const statusOptions: Array<{ label: string; value: "all" | OpportunityStatus }> = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" }
];

const AdminOpportunitiesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState<(typeof statusOptions)[number]["value"]>("pending");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery<AdminOpportunityResponse>({
    queryKey: ["admin-opportunities", { search: deferredSearch, status }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (deferredSearch.trim()) params.search = deferredSearch.trim();
      if (status !== "all") params.status = status;
      const response = await api.get<AdminOpportunityResponse>("/admin/opportunities", { params });
      return response.data;
    }
  });

  const opportunities = data?.data ?? [];

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/opportunities/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] });
      setFeedback("Opportunity approved.");
      setErrorMessage(null);
    },
    onError: () => {
      setErrorMessage("Could not approve opportunity.");
      setFeedback(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/opportunities/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] });
      setFeedback("Opportunity rejected.");
      setErrorMessage(null);
    },
    onError: () => {
      setErrorMessage("Could not reject opportunity.");
      setFeedback(null);
    }
  });

  const busy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Approve Opportunities</h2>
          <p className="text-sm text-muted">Approve or reject user-submitted job posts.</p>
          <p className="mt-1 text-xs text-white/60">{opportunities.length} records shown • {status.toUpperCase()} view</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="w-72 rounded bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40"
            placeholder="Search by title, company, or keywords"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded bg-white/5 px-3 py-2 text-sm text-white"
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {(feedback || errorMessage) && (
        <div className="neon-border rounded border border-white/10 bg-black/40 px-4 py-3 text-xs text-white/70">
          {feedback && <span className="text-green-300">{feedback}</span>}
          {errorMessage && <span className="text-red-300">{errorMessage}</span>}
        </div>
      )}

      <div className="grid gap-4">
        {isLoading || isFetching ? (
          [...Array(4)].map((_, index) => (
            <article key={index} className="neon-border animate-pulse rounded-lg bg-surface/70 p-5">
              <div className="h-4 w-1/3 rounded bg-white/10" />
              <div className="mt-3 h-3 w-2/3 rounded bg-white/10" />
              <div className="mt-2 h-3 w-1/4 rounded bg-white/10" />
            </article>
          ))
        ) : opportunities.length === 0 ? (
          <div className="neon-border rounded-lg bg-surface/80 p-6 text-center text-sm text-white/60">
            No opportunities match the current filters.
          </div>
        ) : (
          opportunities.map((opportunity) => (
            <article key={opportunity._id} className="neon-border rounded-lg bg-surface/80 p-5">
              <header className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-neonCyan">{opportunity.title}</h3>
                  <p className="text-sm text-white/70">{opportunity.company}</p>
                </div>
                <div className="text-right text-xs text-white/60">
                  <p>{new Date(opportunity.createdAt).toLocaleDateString()}</p>
                  <p className="mt-1">Submitted by {opportunity.postedBy.name}</p>
                  <p className="mt-1">Applicants: {opportunity.applicantsCount}</p>
                </div>
              </header>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full bg-white/5 px-3 py-1 text-white/70">{opportunity.type}</span>
                <span
                  className={`rounded-full px-3 py-1 font-semibold ${
                    opportunity.status === "pending"
                      ? "bg-yellow-500/10 text-yellow-300"
                      : opportunity.status === "approved"
                      ? "bg-green-500/10 text-green-300"
                      : "bg-red-500/10 text-red-300"
                  }`}
                >
                  {opportunity.status.toUpperCase()}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-white/50">ID: {opportunity._id}</span>
              </div>

              <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-white/50">
                  Contact: {opportunity.postedBy.email}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300 transition hover:bg-green-500/20 disabled:opacity-50"
                    onClick={() => approveMutation.mutate(opportunity._id)}
                    disabled={busy || opportunity.status === "approved"}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                    onClick={() => rejectMutation.mutate(opportunity._id)}
                    disabled={busy || opportunity.status === "rejected"}
                  >
                    Reject
                  </button>
                </div>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default AdminOpportunitiesPage;

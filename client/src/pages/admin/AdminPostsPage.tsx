import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";

interface ModerationPost {
  _id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  author: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ModerationPostResponse {
  data: ModerationPost[];
  total: number;
}

const AdminPostsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading, isFetching } = useQuery<ModerationPostResponse>({
    queryKey: ["admin-posts", { search: deferredSearch }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (deferredSearch.trim()) params.search = deferredSearch.trim();
      const response = await api.get<ModerationPostResponse>("/admin/posts", { params });
      return response.data;
    }
  });

  const posts = data?.data ?? [];
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => api.delete(`/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      setFeedback("Post removed successfully.");
      setErrorMessage(null);
    },
    onError: () => {
      setErrorMessage("Failed to remove post. Try again later.");
      setFeedback(null);
    }
  });

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Moderate Posts</h2>
          <p className="text-sm text-muted">Review recent posts and remove content that violates guidelines.</p>
          <p className="mt-1 text-xs text-white/60">{posts.length} posts loaded • search filters author or content</p>
        </div>
        <input
          className="w-72 rounded bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40"
          placeholder="Search by author or keywords"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </header>

      <div className="grid gap-4">
        {(feedback || errorMessage) && (
          <div className="neon-border rounded border border-white/10 bg-black/40 px-4 py-3 text-xs text-white/70">
            {feedback && <span className="text-green-300">{feedback}</span>}
            {errorMessage && <span className="text-red-300">{errorMessage}</span>}
          </div>
        )}
        {isLoading || isFetching ? (
          [...Array(5)].map((_, index) => (
            <article key={index} className="neon-border animate-pulse rounded-lg bg-surface/70 p-5">
              <div className="h-4 w-1/3 rounded bg-white/10" />
              <div className="mt-3 h-3 w-full rounded bg-white/10" />
              <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
            </article>
          ))
        ) : posts.length === 0 ? (
          <div className="neon-border rounded-lg bg-surface/80 p-6 text-center text-sm text-white/60">
            No posts found for the current filters.
          </div>
        ) : (
          posts.map((post) => (
            <article key={post._id} className="neon-border rounded-lg bg-surface/80 p-5">
              <header className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-neonCyan">{post.author.name}</h3>
                  <p className="text-xs text-white/60">{post.author.email}</p>
                </div>
                <div className="text-right text-xs text-white/50">
                  <p>{new Date(post.createdAt).toLocaleString()}</p>
                  <p className="mt-1">
                    {post.likesCount} likes • {post.commentsCount} comments
                  </p>
                </div>
              </header>

              <p className="mt-4 whitespace-pre-wrap text-sm text-white/90">{post.content}</p>

              {post.imageUrl && (
                <img src={post.imageUrl} alt="Post attachment" className="mt-4 max-h-64 w-full rounded-lg object-cover" />
              )}

              <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
                  ID: {post._id}
                </span>
                <button
                  type="button"
                  className="rounded bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                  onClick={() => deletePostMutation.mutate(post._id)}
                  disabled={deletePostMutation.isPending}
                >
                  Remove Post
                </button>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default AdminPostsPage;

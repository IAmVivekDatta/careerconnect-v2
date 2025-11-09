import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

const RouteError = () => {
  const error = useRouteError();
  const isRouteError = isRouteErrorResponse(error);

  const status = isRouteError ? error.status : 500;
  const statusText = isRouteError ? error.statusText : "Unexpected error";
  const message = (() => {
    if (isRouteError) {
      if (typeof error.data === "string") return error.data;
      if (typeof error.data === "object" && error.data && "message" in error.data) {
        return String((error.data as Record<string, unknown>).message ?? statusText);
      }
      return statusText;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong";
  })();

  const stackTrace = import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-surface/80 to-bgDark px-6 py-16 text-white">
      <section className="flex max-w-xl flex-col items-center gap-6 text-center">
        <div className="rounded-full border border-neonMagenta/30 bg-neonMagenta/10 p-4">
          <AlertTriangle className="h-12 w-12 text-neonMagenta" />
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">Error {status}</p>
          <h1 className="text-3xl font-semibold">We hit an unexpected snag</h1>
          <p className="text-sm text-white/70">{message}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-neonCyan hover:bg-neonCyan/10"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            to="/feed"
            className="flex items-center gap-2 rounded-full bg-neonCyan px-4 py-2 text-sm font-semibold text-black transition hover:bg-neonCyan/80"
          >
            <Home className="h-4 w-4" />
            Go to dashboard
          </Link>
        </div>
      </section>

      {stackTrace && (
        <section className="w-full max-w-2xl rounded-xl border border-white/10 bg-black/60 p-4 text-left text-xs text-white/70">
          <p className="mb-2 font-semibold text-white">Stack trace</p>
          <pre className="overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed">
            {stackTrace}
          </pre>
        </section>
      )}
    </main>
  );
};

export default RouteError;

import { Link } from "react-router-dom";
import NeonCard from "../../components/molecules/NeonCard";

const AuthSelectPage = () => {
  return (
    <main className="grid min-h-screen place-items-center bg-bgDark px-6 py-16 text-white">
      <div className="grid gap-6 sm:grid-cols-2">
        <NeonCard title="Student / Alumni Login">
          <p className="text-sm text-muted">
            Access your dashboard to manage posts, opportunities, and connections.
          </p>
          <Link to="/login" className="mt-4 inline-flex text-sm text-neonCyan">
            Continue
          </Link>
        </NeonCard>
        <NeonCard title="Admin Portal">
          <p className="text-sm text-muted">
            Moderate the community, approve jobs, and view analytics.
          </p>
          <Link to="/admin/login" className="mt-4 inline-flex text-sm text-neonMagenta">
            Admin Login
          </Link>
        </NeonCard>
      </div>
    </main>
  );
};

export default AuthSelectPage;

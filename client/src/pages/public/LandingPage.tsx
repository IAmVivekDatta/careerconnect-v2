import { Link } from "react-router-dom";
import NeonButton from "../../components/atoms/NeonButton";

const LandingPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-bgDark px-6 text-center text-white">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          The Digital Bridge Between Students, Alumni, and Opportunities
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted">
          Showcase your journey, connect with mentors, and apply to curated opportunities in a neon-futuristic hub.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <NeonButton asChild>
          <Link to="/register">Get Started</Link>
        </NeonButton>
        <Link to="/login" className="text-sm text-muted underline">
          Already have an account? Login
        </Link>
      </div>
    </main>
  );
};

export default LandingPage;

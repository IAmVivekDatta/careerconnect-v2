import { Link } from 'react-router-dom';
import LiquidEther from '@/components/LiquidEther';
import NeonButton from '../../components/atoms/NeonButton';

const LandingPage = () => {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-bgDark px-6 py-16 text-center text-white">
      <div className="absolute inset-0">
        <LiquidEther
          style={{
            width: '100%',
            height: '100%',
            filter: 'saturate(1.25) contrast(1.08)',
            background:
              'radial-gradient(circle at 20% 20%, rgba(82,39,255,0.45), transparent 55%), radial-gradient(circle at 80% 30%, rgba(255,159,252,0.35), transparent 60%), #050217'
          }}
          className="pointer-events-none"
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={20}
          cursorSize={100}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050217]/10 via-transparent to-[#050217]/55"
        />
      </div>
      <div className="relative z-10 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight drop-shadow-[0_8px_30px_rgba(0,0,0,0.65)] sm:text-5xl">
          The Digital Bridge Between Students, Alumni, and Opportunities
        </h1>
        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/85 drop-shadow-[0_4px_35px_rgba(0,0,0,0.6)] sm:text-xl">
          Showcase your journey, connect with mentors, and apply to curated
          opportunities in a neon-futuristic hub.
        </p>
      </div>
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
        <NeonButton asChild>
          <Link to="/register">Get Started</Link>
        </NeonButton>
        <Link
          to="/login"
          className="text-sm text-white/80 underline decoration-neonCyan/60 underline-offset-4 transition hover:text-white"
        >
          Already have an account? Login
        </Link>
      </div>
    </main>
  );
};

export default LandingPage;

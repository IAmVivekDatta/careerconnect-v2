import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import NeonButton from '../../components/atoms/NeonButton';
import { ArrowRight, Quote, Star } from 'lucide-react';
import api from '../../lib/axios';
import type { FeedbackItem } from '../../types';

const featureCards = [
  {
    title: 'Mentor Match Engine',
    text: 'Discover alumni based on domain, graduation year, and practical hiring experience.'
  },
  {
    title: 'Verified Opportunities',
    text: 'Apply to curated internships and jobs vetted by admins and industry mentors.'
  },
  {
    title: 'Campus-to-Career Feed',
    text: 'Share achievements, ask focused career questions, and get guidance from your community.'
  }
];

type PublicMetrics = {
  activeCommunity: number;
  mentorshipSessions: number;
  verifiedOpenings: number;
  updatedAt: string;
};

const LandingPage = () => {
  const [ticker, setTicker] = useState(Date.now());
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    kind: 'review' as 'review' | 'suggestion',
    rating: 5,
    message: ''
  });
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const { data: metrics } = useQuery<PublicMetrics>({
    queryKey: ['public-metrics'],
    queryFn: async () => {
      const response = await api.get('/public/metrics');
      return response.data;
    },
    refetchInterval: 30_000,
    staleTime: 15_000
  });

  const { data: feedbackData } = useQuery<{ data: FeedbackItem[] }>({
    queryKey: ['public-feedback'],
    queryFn: async () => {
      const response = await api.get('/feedback/public', {
        params: { limit: 6 }
      });
      return response.data;
    },
    refetchInterval: 45_000,
    staleTime: 15_000
  });

  const feedbackMutation = useMutation({
    mutationFn: (payload: {
      name?: string;
      email?: string;
      kind: 'review' | 'suggestion';
      rating?: number;
      message: string;
    }) => api.post('/feedback', payload),
    onSuccess: () => {
      setFeedbackNotice(
        'Thanks for your feedback. Admin will review it shortly.'
      );
      setFeedbackForm({
        name: '',
        email: '',
        kind: 'review',
        rating: 5,
        message: ''
      });
    },
    onError: () => {
      setFeedbackNotice(
        'Could not submit feedback right now. Please try again.'
      );
    }
  });

  useEffect(() => {
    const interval = window.setInterval(() => setTicker(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const refreshCountdown = useMemo(() => {
    if (!metrics?.updatedAt) return 30;
    const elapsed = Math.floor(
      (ticker - new Date(metrics.updatedAt).getTime()) / 1000
    );
    const windowSeconds = 30;
    return Math.max(0, windowSeconds - (elapsed % windowSeconds));
  }, [metrics?.updatedAt, ticker]);

  const activeCommunity = metrics?.activeCommunity ?? 0;
  const mentorshipSessions = metrics?.mentorshipSessions ?? 0;
  const verifiedOpenings = metrics?.verifiedOpenings ?? 0;
  const publishedFeedback = feedbackData?.data ?? [];

  const starsFor = (rating?: number) => {
    const count = Math.max(0, Math.min(5, rating ?? 0));
    return Array.from({ length: count });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-bgDark text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-120px] h-72 w-72 rounded-full bg-neonCyan/30 blur-3xl" />
        <div className="absolute right-[-140px] top-16 h-80 w-80 rounded-full bg-neonCyan/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-1/4 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-[#0b0b0b]/95 backdrop-blur">
        <div className="cc-container flex items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="text-xl font-extrabold tracking-wide text-white transition-colors duration-300 hover:text-neonCyan"
          >
            CareerConnect
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
            <a
              href="#features"
              className="transition-colors duration-300 hover:text-neonCyan"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="transition-colors duration-300 hover:text-neonCyan"
            >
              Testimonials
            </a>
            <a
              href="#footer"
              className="transition-colors duration-300 hover:text-neonCyan"
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-white transition duration-300 hover:border-neonCyan hover:text-neonCyan"
            >
              Login
            </Link>
            <NeonButton asChild className="px-5">
              <Link to="/register">Register</Link>
            </NeonButton>
          </div>
        </div>
      </header>

      <section className="cc-section relative z-10 px-6">
        <div className="cc-container grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-neonCyan/40 bg-neonCyan/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neonCyan cc-fade-up">
              VVIT Career Network
            </span>
            <h1 className="cc-fade-up cc-fade-delay-1 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Build Your Career with Alumni Who Have Already Walked the Path
            </h1>
            <p className="cc-fade-up cc-fade-delay-2 max-w-2xl text-lg leading-relaxed text-white/80">
              A focused platform for VVIT students and alumni to collaborate,
              mentor, and unlock meaningful career outcomes with verified
              opportunities.
            </p>
            <div className="cc-fade-up cc-fade-delay-3 flex flex-wrap items-center gap-4">
              <NeonButton asChild className="px-6 py-3">
                <Link to="/register" className="inline-flex items-center gap-2">
                  Start Your Journey
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </NeonButton>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors duration-300 hover:text-neonCyan"
              >
                Explore Portals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="cc-fade-up cc-fade-delay-2 space-y-5">
            <div className="neon-border bg-card p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-neonCyan/90">
                Active Community
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {activeCommunity.toLocaleString()} Members
              </p>
              <p className="mt-2 text-sm text-white/70">
                Students, alumni, mentors, and placement coordinators.
              </p>
              <p className="mt-2 text-xs text-white/55">
                Live refresh in {refreshCountdown}s
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="neon-border bg-card p-5">
                <p className="text-2xl font-bold text-neonCyan">
                  {mentorshipSessions.toLocaleString()}+
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/70">
                  Mentorship Sessions
                </p>
              </div>
              <div className="neon-border bg-card p-5">
                <p className="text-2xl font-bold text-neonCyan">
                  {verifiedOpenings.toLocaleString()}+
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/70">
                  Verified Openings
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="cc-section border-y border-border bg-[#101010] px-6"
      >
        <div className="cc-container">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything You Need for Career Momentum
            </h2>
            <p className="mt-4 text-white/75">
              Built for VVIT workflows with an interface designed for focus,
              trust, and measurable outcomes.
            </p>
          </div>
          <div className="cc-grid-cards">
            {featureCards.map((feature, index) => (
              <article
                key={feature.title}
                className={`neon-border bg-card p-6 cc-fade-up ${
                  index === 1
                    ? 'cc-fade-delay-1'
                    : index === 2
                      ? 'cc-fade-delay-2'
                      : ''
                }`}
              >
                <h3 className="text-xl font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-relaxed text-white/75">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="cc-section px-6">
        <div className="cc-container">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Community Reviews and Suggestions
              </h2>
              <p className="mt-4 max-w-2xl text-white/75">
                Published feedback from the VVIT community using CareerConnect
                to grow skills, confidence, and placement outcomes.
              </p>
            </div>
          </div>

          <div className="cc-grid-cards">
            {publishedFeedback.length === 0 && (
              <article className="neon-border bg-card p-6">
                <p className="text-sm text-white/75">
                  No reviews are published yet. Be the first to share feedback.
                </p>
              </article>
            )}

            {publishedFeedback.map((item, index) => (
              <article
                key={item._id}
                className={`neon-border bg-card p-6 cc-fade-up ${
                  index === 1
                    ? 'cc-fade-delay-1'
                    : index === 2
                      ? 'cc-fade-delay-2'
                      : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <Quote className="h-5 w-5 text-neonCyan" />
                  <div className="flex items-center gap-1 text-neonCyan">
                    {item.rating ? (
                      starsFor(item.rating).map((_, starIndex) => (
                        <Star
                          key={`${item._id}-star-${starIndex}`}
                          className="h-4 w-4 fill-current"
                        />
                      ))
                    ) : (
                      <span className="rounded-full border border-neonCyan/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                        Suggestion
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-4 leading-relaxed text-white/80">
                  “{item.message}”
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-neonCyan/20 text-sm font-semibold text-neonCyan">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-white/65">
                      {item.kind === 'review' ? 'Review' : 'Suggestion'} •{' '}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 neon-border bg-card p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">
                Share your feedback
              </h3>
              <p className="mt-1 text-sm text-white/70">
                Submit a review or suggestion. Admin can publish selected items
                on this page.
              </p>
            </div>

            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                const message = feedbackForm.message.trim();
                if (message.length < 8) {
                  setFeedbackNotice(
                    'Please enter at least 8 characters in your message.'
                  );
                  return;
                }

                feedbackMutation.mutate({
                  name: feedbackForm.name.trim() || undefined,
                  email: feedbackForm.email.trim() || undefined,
                  kind: feedbackForm.kind,
                  rating:
                    feedbackForm.kind === 'review'
                      ? feedbackForm.rating
                      : undefined,
                  message
                });
              }}
            >
              <input
                value={feedbackForm.name}
                onChange={(event) =>
                  setFeedbackForm((current) => ({
                    ...current,
                    name: event.target.value
                  }))
                }
                placeholder="Your name (optional)"
                className="rounded-lg border border-border/70 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50"
              />
              <input
                type="email"
                value={feedbackForm.email}
                onChange={(event) =>
                  setFeedbackForm((current) => ({
                    ...current,
                    email: event.target.value
                  }))
                }
                placeholder="Email (optional)"
                className="rounded-lg border border-border/70 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50"
              />
              <select
                value={feedbackForm.kind}
                onChange={(event) =>
                  setFeedbackForm((current) => ({
                    ...current,
                    kind: event.target.value as 'review' | 'suggestion'
                  }))
                }
                className="rounded-lg border border-border/70 bg-white/5 px-3 py-2 text-sm text-white"
              >
                <option value="review">Review</option>
                <option value="suggestion">Suggestion</option>
              </select>
              <select
                value={feedbackForm.rating}
                onChange={(event) =>
                  setFeedbackForm((current) => ({
                    ...current,
                    rating: Number(event.target.value)
                  }))
                }
                disabled={feedbackForm.kind !== 'review'}
                className="rounded-lg border border-border/70 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-40"
              >
                <option value={5}>5 stars</option>
                <option value={4}>4 stars</option>
                <option value={3}>3 stars</option>
                <option value={2}>2 stars</option>
                <option value={1}>1 star</option>
              </select>
              <textarea
                value={feedbackForm.message}
                onChange={(event) =>
                  setFeedbackForm((current) => ({
                    ...current,
                    message: event.target.value
                  }))
                }
                placeholder="Share your experience or suggestion"
                className="sm:col-span-2 min-h-[120px] rounded-lg border border-border/70 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50"
              />
              <div className="sm:col-span-2 flex items-center justify-between gap-3">
                <p className="text-xs text-white/65">Minimum 8 characters</p>
                <button
                  type="submit"
                  disabled={feedbackMutation.isPending}
                  className="rounded-lg border border-neonCyan/60 bg-neonCyan/10 px-4 py-2 text-sm font-semibold text-neonCyan transition hover:bg-neonCyan/20 disabled:opacity-50"
                >
                  {feedbackMutation.isPending
                    ? 'Submitting...'
                    : 'Submit Feedback'}
                </button>
              </div>
            </form>

            {feedbackNotice && (
              <p className="mt-3 text-sm text-white/80">{feedbackNotice}</p>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="cc-container rounded-2xl border border-neonCyan/45 bg-neonCyan/10 p-8 text-center sm:p-10">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to Connect Your Campus Journey to Your Career?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">
            Join CareerConnect and collaborate with the VVIT alumni network for
            mentorship, opportunities, and measurable growth.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <NeonButton asChild className="px-6 py-3">
              <Link to="/register">Create Free Account</Link>
            </NeonButton>
            <Link
              to="/login"
              className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:border-neonCyan hover:text-neonCyan"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer
        id="footer"
        className="border-t border-border bg-[#0a0a0a] px-6 py-16"
      >
        <div className="cc-container grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-neonCyan">CareerConnect</h3>
            <p className="text-sm leading-relaxed text-white/70">
              The digital bridge between VVIT students and alumni for
              mentorship, visibility, and opportunity.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide text-neonCyan">
              Platform
            </h4>
            <a
              href="#features"
              className="block text-sm text-white/70 transition-colors duration-300 hover:text-white"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="block text-sm text-white/70 transition-colors duration-300 hover:text-white"
            >
              Testimonials
            </a>
            <Link
              to="/auth"
              className="block text-sm text-white/70 transition-colors duration-300 hover:text-white"
            >
              Portals
            </Link>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide text-neonCyan">
              Accounts
            </h4>
            <Link
              to="/register"
              className="block text-sm text-white/70 transition-colors duration-300 hover:text-white"
            >
              Student & Alumni Signup
            </Link>
            <Link
              to="/login"
              className="block text-sm text-white/70 transition-colors duration-300 hover:text-white"
            >
              User Login
            </Link>
            <Link
              to="/admin/login"
              className="block text-sm text-white/70 transition-colors duration-300 hover:text-white"
            >
              Admin Login
            </Link>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide text-neonCyan">
              Campus
            </h4>
            <p className="text-sm text-white/70">VVIT, Andhra Pradesh</p>
            <p className="text-sm text-white/70">support@careerconnect.vvit</p>
            <p className="text-sm text-white/70">
              Mon - Sat, 9:00 AM - 6:00 PM
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;

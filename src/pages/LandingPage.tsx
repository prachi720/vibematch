import { Link } from 'react-router-dom';
import {
  Zap, Brain, Users, Target, Layers, Map, ListOrdered, Presentation, Gavel,
  FileText, ArrowRight, Moon, Sun, Sparkles, Check,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

const features = [
  { icon: Brain, title: 'Skill Analysis', desc: 'AI-powered breakdown of your strengths, gaps, and growth areas with a visual radar chart.' },
  { icon: Users, title: 'Team Building', desc: 'Find complementary teammates based on your skill gaps with AI-suggested matches.' },
  { icon: Target, title: 'Idea Validation', desc: 'Submit your project idea and get AI feedback on feasibility, originality, and scope.' },
  { icon: Layers, title: 'Architecture Generation', desc: 'Generate a full system architecture recommendation with a visual diagram.' },
  { icon: Map, title: 'Roadmap Planning', desc: 'Get an AI-generated execution timeline with milestones, effort estimates, and dependencies.' },
  { icon: ListOrdered, title: 'Feature Prioritization', desc: 'Rank your features using AI-assisted MoSCoW or impact/effort scoring.' },
  { icon: Presentation, title: 'Pitch Preparation', desc: 'Generate a structured pitch with problem, solution, demo, market, and ask sections.' },
  { icon: Gavel, title: 'Judge Simulation', desc: 'Practice with an AI judge that scores your project across multiple criteria.' },
  { icon: FileText, title: 'Documentation Generation', desc: 'Auto-generate README and technical docs from your project context, ready to download.' },
];

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>VibeMatch</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <Sparkles className="h-4 w-4 text-primary-500" />
              AI-powered hackathon preparation platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--text-primary)' }}>
              Win your next hackathon with{' '}
              <span className="gradient-text">AI-powered prep</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              VibeMatch analyzes your skills, helps you build the perfect team, validates your idea,
              generates architecture and roadmaps, prepares your pitch, simulates judges, and writes your docs —
              all in one place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {!user && (
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <a href="#features">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore features
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
            Everything you need to win
          </h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Nine AI-powered modules covering the entire hackathon journey
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card card-hover p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10">
                  <Icon className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
              How it works
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Set up your profile', desc: 'Tell us your skills and experience level. Takes 2 minutes.' },
              { step: '02', title: 'Run AI modules', desc: 'Analyze skills, build a team, validate ideas, generate architecture, roadmaps, and more.' },
              { step: '03', title: 'Win the hackathon', desc: 'Practice with a simulated judge, generate your docs, and walk in fully prepared.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="card p-8 lg:p-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(6,182,212,0.05))' }}>
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
            Ready to win?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'var(--text-secondary)' }}>
            Join VibeMatch and get AI-powered preparation for your next hackathon.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {!user ? (
              <Link to="/register">
                <Button size="lg">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/dashboard">
                <Button size="lg">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success-500" /> Free to use</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success-500" /> Dark mode support</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary-500" />
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>VibeMatch</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              AI-powered hackathon preparation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

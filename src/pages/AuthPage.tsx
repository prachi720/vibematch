import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // After registration, supabase auto-signs in (email confirmation off)
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Check if profile is complete — redirect to profile setup or dashboard
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('profile_complete')
            .eq('user_id', user.id)
            .maybeSingle();
          if (!profile?.profile_complete) {
            navigate('/profile-setup');
          } else {
            navigate('/dashboard');
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg.includes('Invalid login') || msg.includes('invalid')) {
        setError('Invalid email or password. Please try again.');
      } else if (msg.includes('already') || msg.includes('registered')) {
        setError('An account with this email already exists. Try logging in.');
      } else if (msg.includes('weak') || msg.includes('length')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>VibeMatch</span>
        </Link>

        <div className="card p-8 animate-slide-up">
          <h1 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isRegister
              ? 'Start your AI-powered hackathon prep journey.'
              : 'Sign in to continue your hackathon prep.'}
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-error-500/30 bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
            <Button type="submit" loading={loading} className="w-full">
              {isRegister ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isRegister ? (
              <>Already have an account? <Link to="/login" className="font-medium text-primary-500 hover:text-primary-600">Sign in</Link></>
            ) : (
              <>Don't have an account? <Link to="/register" className="font-medium text-primary-500 hover:text-primary-600">Sign up</Link></>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

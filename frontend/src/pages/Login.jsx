import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/useToast';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { Bot, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, CloudCog } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      showToast('Welcome back! Successfully logged in.', 'success');
      navigate('/');
    } catch (err) {
      console.log(err);
      console.log(err.response?.data);
      console.log(err.message);
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@buildsense.ai');
    setPassword('demo1234');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand logo */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="BuildSense Logo"
            className="w-14 h-14 rounded-2xl object-cover border border-zinc-700/80 mb-4 mx-auto shadow-xl shadow-black/40"
          />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back to <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">BuildSense</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Sign in to access your feedback intelligence dashboard
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-4 rounded-xl shadow-xl shadow-white/5 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Google OAuth Sign-In */}
          <GoogleAuthButton />

          {/* Quick Demo Fill Helper */}
          <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Testing out the app?</span>
            <button
              type="button"
              onClick={fillDemo}
              className="text-zinc-200 hover:text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Fill Demo Login
            </button>
          </div>
        </div>

        {/* Footer Toggle */}
        <p className="text-center text-sm text-zinc-400 mt-8">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-white hover:underline font-semibold transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

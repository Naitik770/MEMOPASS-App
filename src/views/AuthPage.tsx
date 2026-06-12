import React, { useState, useEffect } from 'react';
import { Mail, Lock, Sparkles, ArrowRight, Chrome, User, Eye, EyeOff, ShieldCheck, CheckCircle, RefreshCw, ChevronLeft } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface AuthPageProps {
  onLogin: () => void;
  onBack?: () => void;
}

// Browser-native SHA-256 helper to generate Gravatar emails without dependencies
async function getGravatarUrl(email: string): Promise<string> {
  const trimmedEmail = email.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(trimmedEmail);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `https://www.gravatar.com/avatar/${hashHex}?d=retro&s=200`;
}

export default function AuthPage({ onLogin, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify-pending' | 'forgot-password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Left intentionally blank
  }, []);

  // Auto check verification status if user is on the verify-pending screen
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'verify-pending' && auth.currentUser) {
      interval = setInterval(async () => {
        try {
          await auth.currentUser?.reload();
          if (auth.currentUser?.emailVerified) {
            clearInterval(interval);
            setSuccessMessage("Email successfully verified! Redirecting...");
            setTimeout(() => {
              onLogin();
            }, 1500);
          }
        } catch (err) {
          console.error("Reload verification check error:", err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, onLogin]);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password should be at least 6 characters.');
          setLoading(false);
          return;
        }

        // 1. Fetch zero-popup profile picture based on email address
        const avatarUrl = await getGravatarUrl(email);

        // 2. Register User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Update Name & PhotoURL in their profile immediately
        await updateProfile(user, {
          displayName: name.trim(),
          photoURL: avatarUrl
        });

        // 4. Send Verification Email (Optional for them to check later)
        try {
          await sendEmailVerification(user);
        } catch (e) {
          // Ignore if it fails
        }

        // 5. Proceed to login directly
        setLoading(false);
        onLogin();

      } else {
        // Mode is Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        onLogin();
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use by another account.');
      } else {
        setError(err.message || 'Authentication failed');
      }
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          setSuccessMessage("Email successfully verified! Redirecting...");
          setTimeout(() => {
            onLogin();
          }, 1000);
        } else {
          setError("Email is still not verified. Please check your inbox or resend another link.");
        }
      } else {
        setError("Session expired. Please log in again.");
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || "Failed to check status.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setSuccessMessage("A fresh activation link has been delivered to your email.");
      } else {
        setError("Session lost. Please log in again.");
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || "Failed to deliver link.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(err.message || "Failed to send reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError(null);
    setSuccessMessage(null);
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="flex w-full h-full min-h-screen bg-black/95 text-white">
      {/* Left Column: Ambient Mockup & Branding Overview (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-b from-zinc-900 to-black relative overflow-hidden border-r border-white/5 font-sans justify-between p-12">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_60%)] opacity-20 pointer-events-none transform-gpu" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_center,_rgba(82,82,91,1)_0%,_transparent_60%)] opacity-20 pointer-events-none transform-gpu" />
        
        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/memopass-icon.png" alt="MemoPass Icon" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
          <div className="flex flex-col justify-center">
            <span className="text-2xl text-white leading-none tracking-wide" style={{ fontFamily: 'var(--font-brand)', fontWeight: 300 }}>memopass</span>
            <span className="block text-[9px] uppercase tracking-[0.3em] text-[var(--color-accent)] mt-1 ml-0.5">Time Capsules</span>
          </div>
        </div>

        {/* Dynamic Display Presentation Card Mockup */}
        <div className="relative z-10 flex items-center justify-center my-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: -1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}
            className="w-[360px] bg-zinc-950/80 backdrop-blur-md rounded-[32px] border border-white/15 p-6 flex flex-col pointer-events-none relative group"
          >
             <div className="w-full aspect-[4/3] bg-zinc-900 rounded-2xl mb-5 flex justify-center items-center overflow-hidden border border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60 z-10" />
                <img src="https://images.unsplash.com/photo-1549298240-0d8e60513026?auto=format&fit=crop&w=800&q=80" alt="Ticket Memory Mockup" className="w-full h-full object-cover scale-105 group-hover:scale-110 duration-1000 transition-transform" />
                <div className="absolute top-3 left-3 bg-black/60 border border-white/15 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold text-[var(--color-accent)] z-20 flex items-center gap-1.5 backdrop-blur-md">
                   <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" /> Digital Pass
                </div>
             </div>
             
             <div className="flex justify-between items-center mb-3">
               <div className="h-4 w-1/2 bg-white/20 rounded-md"></div>
               <div className="h-3.5 w-1/4 bg-white/10 rounded-md"></div>
             </div>
             <div className="h-2 w-3/4 bg-white/10 rounded-md mb-5"></div>
             <div className="h-16 w-full bg-white/5 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
               <div className="h-1.5 w-full bg-white/5 rounded"></div>
               <div className="h-1.5 w-5/6 bg-white/5 rounded"></div>
               <div className="h-1.5 w-4/6 bg-white/5 rounded"></div>
             </div>
          </motion.div>
        </div>

        {/* Left Side Footer text */}
        <div className="relative z-10 max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-4 border border-white/5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Luxury Memory Tokens
          </div>
          <h1 className="text-3xl font-serif text-white leading-tight tracking-wide mb-3">
            Preserve your most precious moments.
          </h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            MemoPass creates beautiful digital ticket souvenirs and encrypted time capsules to protect your life stories.
          </p>
        </div>
      </div>

      {/* Right Column: Premium Auth Panel Interface */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-12 relative overflow-y-auto">
        <div className="absolute top-10 right-10 lg:hidden flex items-center gap-2">
          <img src="/memopass-icon.png" alt="MemoPass Icon" className="w-8 h-8 object-contain" />
          <span className="text-lg text-slate-200" style={{ fontFamily: 'var(--font-brand)', fontWeight: 300 }}>memopass</span>
        </div>

        <div className="w-full max-w-md mx-auto relative z-10 flex flex-col">
          {onBack && (
            <button 
              onClick={() => {
                if (mode === 'forgot-password' || mode === 'verify-pending') {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                } else if (mode === 'signup') {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                } else {
                  onBack();
                }
              }}
              className="group flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900/50 hover:bg-white hover:text-black text-slate-400 transition-all duration-300 mb-8 self-start"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
            </button>
          )}
          <AnimatePresence mode="wait">
            {mode === 'verify-pending' ? (
              /* Premium Email Verification Pending Screen */
              <motion.div 
                key="verify"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/5 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/10 animate-bounce">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif text-white tracking-wide mb-2">Check Your Inbox</h2>
                <p className="text-sm text-slate-400 mb-6 font-light max-w-md mx-auto">
                  A verification link was transmitted to <span className="text-white font-medium">{auth.currentUser?.email || email}</span>. 
                  Please open the link to activate your digital vault.
                </p>

                {(successMessage || error) && (
                  <div className="mb-6">
                    {successMessage && (
                      <div className="p-4 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm border border-[var(--color-accent)]/20 text-center flex items-center justify-center gap-2 font-medium">
                        <CheckCircle className="w-4 h-4" /> {successMessage}
                      </div>
                    )}
                    {error && (
                      <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20 text-center font-medium">
                        {error}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleCheckVerification}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-slate-100 py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-70"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    ) : (
                      <>
                        Verify & Log In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleResendEmail}
                      disabled={loading}
                      className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-slate-300 font-semibold text-xs transition-all"
                    >
                      Resend Link
                    </button>
                    <button
                      onClick={() => {
                        auth.signOut();
                        setMode('login');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-slate-300 font-semibold text-xs transition-all"
                    >
                      Log In Page
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  Auto-checking status in background...
                </div>
              </motion.div>
            ) : mode === 'forgot-password' ? (
              /* Premium Forgot Password Section */
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-serif font-medium tracking-wide text-white mb-2">
                    Reset Password
                  </h2>
                  <p className="text-sm text-slate-400 font-light">
                    Enter your email address to receive a password reset link.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20 text-center font-medium animate-pulse">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-4 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm border border-[var(--color-accent)]/20 text-center font-medium">
                      {successMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Email address</label>
                    <div className="relative font-sans">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all text-sm text-white placeholder-slate-500"
                        placeholder="your@email.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 py-4 px-4 rounded-xl text-sm font-semibold transition-all mt-6 shadow-md disabled:opacity-75 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-4 h-4 text-zinc-950" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-xs text-slate-500">
                  Remembered your password?{' '}
                  <button
                    onClick={() => {
                        setError(null);
                        setSuccessMessage(null);
                        setMode('login');
                    }}
                    className="font-medium text-white hover:text-zinc-300 border-b border-transparent hover:border-zinc-300 transition-all"
                  >
                    Log in
                  </button>
                </p>
              </motion.div>
            ) : (
              /* Premium Login & Register Forms Section */
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-serif font-medium tracking-wide text-white mb-2">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-sm text-slate-400 font-light">
                    {mode === 'login' 
                      ? 'Log in to manage your digital memory archives.' 
                      : 'Create a secure account to save your memories.'
                    }
                  </p>
                </div>

                {/* Google Sign In Call to Action */}
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-white/10 rounded-xl text-sm font-semibold hover:border-white/20 hover:bg-white/5 transition-all bg-zinc-950 text-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.4)] disabled:opacity-75 cursor-pointer"
                >
                  <Chrome className="w-4 h-4 text-white" />
                  Continue with Google
                </button>

                {/* Faux Divider Line */}
                <div className="relative my-6 select-none leading-none">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-black/95 text-slate-500 font-medium tracking-widest uppercase">Or use email</span>
                  </div>
                </div>

                {/* Core Authentication Fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20 text-center font-medium animate-pulse">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-4 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm border border-[var(--color-accent)]/20 text-center font-medium">
                      {successMessage}
                    </div>
                  )}

                  {/* Name field (Only used on Sign Up) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 o h-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all text-sm text-white placeholder-slate-500 font-sans"
                          placeholder="Your real name"
                          required
                          autoComplete="name"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email address */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Email address</label>
                    <div className="relative font-sans">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all text-sm text-white placeholder-slate-500"
                        placeholder="your@email.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password / Create Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                        {mode === 'login' ? 'Password' : 'Create password'}
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            setSuccessMessage(null);
                            setMode('forgot-password');
                          }}
                          className="text-xs text-slate-400 hover:text-white transition-colors font-medium"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative font-sans">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3.5 bg-zinc-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all text-sm text-white placeholder-slate-500"
                        placeholder="••••••••"
                        required
                        autoComplete={mode === 'login' ? "current-password" : "new-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (Only used on Sign Up) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Re-enter password</label>
                      <div className="relative font-sans">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3.5 bg-zinc-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all text-sm text-white placeholder-slate-500"
                          placeholder="••••••••"
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Primary Dispatch Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 py-4 px-4 rounded-xl text-sm font-semibold transition-all mt-6 shadow-md disabled:opacity-75 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    ) : (
                      <>
                        {mode === 'login' ? 'Log In' : 'Sign Up'}
                        <ArrowRight className="w-4 h-4 text-zinc-950" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer mode toggle links */}
                <p className="mt-8 text-center text-xs text-slate-500">
                  {mode === 'login' ? "New to MemoPass?" : "Already have an account?"}{' '}
                  <button
                    onClick={toggleMode}
                    className="font-medium text-white hover:text-zinc-300 border-b border-transparent hover:border-zinc-300 transition-all"
                  >
                    {mode === 'login' ? 'Create new account' : 'Log in'}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

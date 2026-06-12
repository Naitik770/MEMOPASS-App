import React from 'react';
import { User } from 'firebase/auth';
import { Memory } from '../types';
import { LogOut, Settings, Award, Grid, Clock, Sparkles, ShieldCheck, Mail, Database, Camera } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  user: User;
  memories: Memory[];
  onLogout: () => void;
  onNavigate: (view: any) => void;
}

export default function Profile({ user, memories, onLogout, onNavigate }: ProfileProps) {
  const favoriteCount = memories.filter(m => m.isFavorite).length;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 pb-32 overflow-y-auto">
      
      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-white">Your Workspace</h1>
        <button className="p-2 sm:px-4 sm:py-2 rounded-full sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all shadow-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Membership Card / Identity */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Identity Pass Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full aspect-[4/5] rounded-[24px] border border-white/20 p-6 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black z-0" />
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_60%)] opacity-30 pointer-events-none transition-transform group-hover:scale-110 duration-700 transform-gpu" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[radial-gradient(circle_at_center,_rgba(82,82,91,1)_0%,_transparent_60%)] opacity-40 pointer-events-none transform-gpu" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0" />

            {/* Top row */}
            <div className="relative z-10 flex justify-between items-start w-full">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent)] opacity-80">MemoPass</span>
                <span className="text-[9px] font-medium tracking-wider uppercase text-slate-400 mt-0.5">Membership Pass</span>
              </div>
              <ShieldCheck className="w-5 h-5 text-[var(--color-accent)] opacity-80" />
            </div>

            {/* Middle: Profile Image */}
            <div className="relative z-10 flex flex-col items-center flex-1 justify-center mt-4">
               <div className="relative w-28 h-28 rounded-full bg-zinc-900 border border-white/20 shadow-[0_0_30px_rgba(212,175,55,0.15)] flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-500">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-serif text-4xl text-[var(--color-accent)]">{user.email?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                  {/* Premium Badge */}
                  <div className="absolute -bottom-2 bg-[var(--color-accent)] text-zinc-900 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-lg border border-[var(--color-accent-light)]">
                    Premium
                  </div>
               </div>
               
               <h2 className="text-xl font-serif text-white tracking-tight text-center w-full px-2 truncate">
                 {user.displayName || 'Authorized User'}
               </h2>
            </div>

            {/* Bottom row */}
            <div className="relative z-10 w-full pt-4 border-t border-white/10 flex justify-between items-end mt-4">
               <div className="flex flex-col">
                 <span className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5">Account ID</span>
                 <span className="text-[10px] font-mono text-slate-300">{user.uid.substring(0, 12)}...</span>
               </div>
               <div className="h-6 w-16 opacity-50 space-x-0.5 flex items-end justify-end">
                  {/* Faux barcode */}
                  {[...Array(12)].map((_, idx) => (
                    <div key={idx} className={`bg-white h-full ${idx % 3 === 0 ? 'w-1' : idx % 2 === 0 ? 'w-0.5 object-cover' : 'w-1.5'}`} />
                  ))}
               </div>
            </div>
          </motion.div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 rounded-2xl text-sm font-semibold transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Right Column: Stats and Settings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* User Details Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[24px] p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 border-b border-[var(--color-border)] pb-3">Identity Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="text-sm font-medium text-white truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Data Storage</p>
                  <p className="text-sm font-medium text-white truncate">Cloud Synced & Secured</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[var(--color-surface)] to-zinc-900 border border-[var(--color-border)] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col justify-between aspect-square sm:aspect-auto"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 text-[var(--color-accent)] flex items-center justify-center mb-4 sm:mb-8 shadow-inner">
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-3xl sm:text-5xl font-serif font-medium text-white mb-1">{memories.length}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest">Digital Tokens</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[var(--color-surface)] to-zinc-900 border border-[var(--color-border)] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col justify-between aspect-square sm:aspect-auto relative overflow-hidden group hover:border-[var(--color-accent)]/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center mb-4 sm:mb-8 z-10">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="z-10">
                <p className="text-3xl sm:text-5xl font-serif font-medium text-white mb-1 group-hover:text-[var(--color-accent)] transition-colors">{favoriteCount}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest">Highlights</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_60%)] opacity-20 pointer-events-none transform-gpu" />
            </motion.div>
          </div>
          
          {/* Achievements */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[24px] p-6 shadow-sm mt-2"
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 border-b border-[var(--color-border)] pb-3">Memory Achievements</h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${memories.length >= 5 ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]' : 'bg-black/20 border-white/5 text-slate-500'} flex items-center justify-between`}>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-current/10 flex items-center justify-center shrink-0">
                     <Award className="w-5 h-5 opacity-90" />
                   </div>
                   <div>
                     <p className="text-sm font-bold tracking-wide text-white">Story Keeper</p>
                     <p className="text-xs opacity-70 mt-0.5">Collect 5 or more unique memories.</p>
                   </div>
                 </div>
                 <div className="font-mono text-xs opacity-60">{Math.min(memories.length, 5)}/5</div>
              </div>

              <div className={`p-4 rounded-xl border ${memories.some(m => m.isTimeCapsule) ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]' : 'bg-black/20 border-white/5 text-slate-500'} flex items-center justify-between`}>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-current/10 flex items-center justify-center shrink-0">
                     <Clock className="w-5 h-5 opacity-90" />
                   </div>
                   <div>
                     <p className="text-sm font-bold tracking-wide text-white">Time Traveler</p>
                     <p className="text-xs opacity-70 mt-0.5">Lock a memory in a Time Capsule.</p>
                   </div>
                 </div>
                 <div className="font-mono text-xs opacity-60">{memories.some(m => m.isTimeCapsule) ? '1/1' : '0/1'}</div>
              </div>

              <div className={`p-4 rounded-xl border ${memories.length >= 1 ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]' : 'bg-black/20 border-white/5 text-slate-500'} flex items-center justify-between`}>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-current/10 flex items-center justify-center shrink-0">
                     <Grid className="w-5 h-5 opacity-90" />
                   </div>
                   <div>
                     <p className="text-sm font-bold tracking-wide text-white">Master of the Code</p>
                     <p className="text-xs opacity-70 mt-0.5">Initialize the system with your first entry.</p>
                   </div>
                 </div>
                 <div className="font-mono text-xs opacity-60">{memories.length >= 1 ? '1/1' : '0/1'}</div>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-[20px] p-5 flex items-center justify-between"
          >
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-sm font-semibold text-white">Vault Encrypted</p>
                   <p className="text-[11px] text-slate-400 mt-0.5">Your memories are safely stored across regions.</p>
                </div>
             </div>
          </motion.div>

        </div>
      </div>

      {/* Legal Links */}
      <div className="mt-12 flex items-center justify-center gap-6">
        <a 
          href="/privacy"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/privacy');
            onNavigate('privacy');
          }} 
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
        >
          Privacy Policy
        </a>
        <span className="text-slate-700">|</span>
        <a 
          href="/terms"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/terms');
            onNavigate('terms');
          }} 
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
        >
          Terms of Service
        </a>
      </div>
    </div>
  );
}

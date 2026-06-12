import React from 'react';
import { Home, Plus, Image as ImageIcon, User as UserIcon, Ticket } from 'lucide-react';
import { CurrentView } from './AppLayout';
import { User } from 'firebase/auth';

interface NavigationProps {
  currentView: CurrentView;
  onNavigate: (view: CurrentView) => void;
  user: User;
}

export default function Navigation({ currentView, onNavigate }: NavigationProps) {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] xs:w-auto max-w-[360px] xs:max-w-none">
      {/* Floating Glass Container */}
      <div className="flex items-center justify-between xs:justify-start gap-1 sm:gap-2 px-2.5 sm:px-4 py-3.5 sm:py-4 bg-[var(--color-surface)]/85 backdrop-blur-2xl border border-[var(--color-border)] rounded-full shadow-[0_22px_45px_rgba(0,0,0,0.5)]">
        
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center w-11 sm:w-14 h-11 sm:h-12 transition-all ${
            currentView === 'dashboard' ? 'text-[var(--color-accent)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] mb-1 shrink-0" strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
          <span className="text-[9px] sm:text-[10px] font-medium tracking-wide">Home</span>
        </button>

        <button
          onClick={() => onNavigate('create')}
          className={`flex flex-col items-center justify-center w-11 sm:w-14 h-11 sm:h-12 transition-all ${
            currentView === 'create' ? 'text-[var(--color-accent)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] mb-1 shrink-0" strokeWidth={currentView === 'create' ? 2.5 : 2} />
          <span className="text-[9px] sm:text-[10px] font-medium tracking-wide">Create</span>
        </button>

        {/* Center Glowing Action */}
        <div className="px-1.5 sm:px-3">
          <div className="relative group cursor-pointer" onClick={() => onNavigate('vault')}>
            <div className="absolute inset-0 bg-[var(--color-accent)]/80 blur-xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-12 h-12 sm:w-[52px] sm:h-[52px] bg-gradient-to-tr from-[var(--color-accent-hover)] to-[var(--color-accent-light)] shadow-lg shadow-[var(--color-accent)]/30 border border-white/20 rounded-full flex items-center justify-center transform group-hover:scale-105 transition-all text-[#451A03]">
               <Ticket className="w-5.5 h-5.5 sm:w-6 sm:h-6 rotate-[-15deg]" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('gallery')}
          className={`flex flex-col items-center justify-center w-11 sm:w-14 h-11 sm:h-12 transition-all ${
            currentView === 'gallery' || currentView === 'detail' ? 'text-[var(--color-accent)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] mb-1 shrink-0" strokeWidth={currentView === 'gallery' || currentView === 'detail' ? 2.5 : 2} />
          <span className="text-[9px] sm:text-[10px] font-medium tracking-wide">Gallery</span>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center w-11 sm:w-14 h-11 sm:h-12 transition-all ${
            currentView === 'profile' ? 'text-[var(--color-accent)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserIcon className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] mb-1 shrink-0" strokeWidth={currentView === 'profile' ? 2.5 : 2} />
          <span className="text-[9px] sm:text-[10px] font-medium tracking-wide">Profile</span>
        </button>

      </div>
    </nav>
  );
}

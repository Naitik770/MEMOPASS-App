import React from 'react';
import { Memory } from '../types';
import { CurrentView } from '../components/AppLayout';
import { Sparkles, Calendar, Heart, ArrowRight, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import TicketStub from '../components/TicketStub';
import { User } from 'firebase/auth';

interface DashboardProps {
  user: User;
  memories: Memory[];
  onNavigate: (view: CurrentView, memory?: Memory) => void;
}

export default function Dashboard({ user, memories, onNavigate }: DashboardProps) {
  const recentMemories = memories.slice(0, 3);
  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Explorer';
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    if (clientWidth === 0) return;
    
    const children = containerRef.current.children;
    if (children.length > 0) {
      let closestIndex = 0;
      let minDiff = Infinity;
      const containerCenter = scrollLeft + clientWidth / 2;
      
      for (let i = 0; i < recentMemories.length; i++) {
        const child = children[i] as HTMLElement;
        if (child) {
          const childCenter = child.offsetLeft + child.clientWidth / 2;
          const diff = Math.abs(containerCenter - childCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        }
      }
      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
      }
    }
  };

  // Calculate this month's memories
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthMemories = memories.filter(m => {
    if (!m.createdAt) return false;
    const d = new Date(m.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  return (
    <div className="w-full h-full pb-20 overflow-y-auto">
      <div className="w-full max-w-lg mx-auto p-6 space-y-10">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[var(--color-secondary)] text-sm tracking-wide">Good Evening,</p>
            <h1 className="text-3xl font-serif font-medium tracking-tight text-white flex items-center gap-2">
              {firstName} <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
            </h1>
            <p className="text-[var(--color-secondary)] text-sm pt-1">
              Capture moments. Cherish forever.
            </p>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Recent Memories Carousel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Recent Memories</h2>
            <button 
              onClick={() => onNavigate('gallery')}
              className="text-sm font-medium text-[var(--color-secondary)] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentMemories.length === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-[var(--color-background)] border border-[var(--color-border)] rounded-full flex items-center justify-center mb-4 text-[var(--color-accent)]">
                 <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-medium text-white mb-2">No Memories Yet</h3>
              <p className="text-sm text-[var(--color-secondary)] max-w-sm mb-6">
                Your luxury digital archive is empty. Begin capturing your precious moments.
              </p>
            </div>
          ) : (
            <div className="relative -mx-6">
              <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-hide px-[7.5%] scroll-px-[7.5%]"
              >
                {recentMemories.map((memory, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={memory.id}
                    onClick={() => onNavigate('detail', memory)}
                    className="cursor-pointer flex-none snap-center w-[78%] max-w-[280px] transition-transform duration-300 transform-gpu will-change-transform hover:scale-[1.02]"
                  >
                    <TicketStub memory={memory} />
                  </motion.div>
                ))}
                {/* Spacer to ensure last item can scroll fully */}
                <div className="flex-none w-2 opacity-0 shrink-0" />
              </div>
              {/* Pagination Dots indicator visual */}
              <div className="flex justify-center gap-2 mt-2">
                 {recentMemories.map((_, idx) => (
                   <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-[var(--color-accent)] scale-125' : 'bg-white/20'}`} />
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Memory Highlights (Stats Grid) */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white">Memory Highlights</h2>
          <div className="grid grid-cols-3 gap-3">
            {/* Total */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg shadow-black/20">
               <Sparkles className="w-5 h-5 text-[var(--color-accent)] mb-2" />
               <p className="text-xl font-medium text-white">{memories.length}</p>
               <p className="text-[10px] text-[var(--color-secondary)] uppercase tracking-wider mt-1">Memories</p>
            </div>
            {/* This Month */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg shadow-black/20">
               <Calendar className="w-5 h-5 text-[var(--color-accent)] mb-2" />
               <p className="text-xl font-medium text-white">{thisMonthMemories.length}</p>
               <p className="text-[10px] text-[var(--color-secondary)] uppercase tracking-wider mt-1">This Month</p>
            </div>
            {/* Favorites */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg shadow-black/20">
               <Heart className="w-5 h-5 text-rose-500 mb-2" />
               <p className="text-xl font-medium text-white">{memories.filter(m => m.isFavorite).length}</p>
               <p className="text-[10px] text-[var(--color-secondary)] uppercase tracking-wider mt-1">Favorites</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

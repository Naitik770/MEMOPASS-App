import React from 'react';
import { MapPin, Calendar, Sparkles, Folder, Lock } from 'lucide-react';
import { Memory } from '../types';

export const LUXURY_THEMES: Record<string, any> = {
  'ivory-gold': {
    name: 'Ivory Gold',
    desc: 'Classic premium ivory paper with gold text',
    bgHex: '#Fdfaf3',
    title: '#1A1A1A',
    story: '#4A4A4A',
    divider: 'border-[#C4B79A] opacity-60',
    border: 'border-[#C4B79A]/30',
    badge: 'bg-black/40 border-white/20 text-white',
    stamp: 'border-[var(--color-accent)] text-[var(--color-accent)]',
    shadow: 'shadow-[0_20px_45px_rgba(0,0,0,0.15)]',
    previewBg: 'bg-[#Fdfaf3]',
    previewBorder: 'border-[#C4B79A]',
    previewText: 'text-[#1A1A1A]',
    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.25)) drop-shadow(0 2px 6px rgba(196,183,154,0.15))',
  },
  'obsidian': {
    name: 'Obsidian Black',
    desc: 'Deep cinematic obsidian with classic gold accents',
    bgHex: '#1E222B',
    title: '#F8FAFC',
    story: '#CBD5E1',
    divider: 'border-[#D4AF37] opacity-40',
    border: 'border-[#D4AF37]/30',
    badge: 'bg-white/10 border-white/15 text-white',
    stamp: 'border-[#D4AF37] text-[#D4AF37]',
    shadow: 'shadow-[0_20px_45px_rgba(212,175,55,0.25)]',
    previewBg: 'bg-[#1E222B]',
    previewBorder: 'border-[#D4AF37]',
    previewText: 'text-[#F8FAFC]',
    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.65)) drop-shadow(0 2px 10px rgba(212,175,55,0.22))',
  },
  'midnight': {
    name: 'Midnight Blue',
    desc: 'Luminous mystical deep blue with silver accents',
    bgHex: '#151D30',
    title: '#F8FAFC',
    story: '#CBD5E1',
    divider: 'border-[#93C5FD] opacity-35',
    border: 'border-[#93C5FD]/30',
    badge: 'bg-white/10 border-white/15 text-white',
    stamp: 'border-[#93C5FD] text-[#93C5FD]',
    shadow: 'shadow-[0_20px_45px_rgba(147,197,253,0.22)]',
    previewBg: 'bg-[#151D30]',
    previewBorder: 'border-[#93C5FD]',
    previewText: 'text-[#F8FAFC]',
    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.65)) drop-shadow(0 2px 10px rgba(147,197,253,0.2))',
  },
  'rose-gold': {
    name: 'Rose Gold',
    desc: 'Soft blush paper with deep crimson text',
    bgHex: '#FFF5F5',
    title: '#4C0519',
    story: '#881337',
    divider: 'border-[#E11D48] opacity-20',
    border: 'border-[#E11D48]/20',
    badge: 'bg-[#4C0519]/40 border-[#E11D48]/20 text-white',
    stamp: 'border-[#E11D48] text-[#E11D48]',
    shadow: 'shadow-[0_20px_45px_rgba(225,29,72,0.1)]',
    previewBg: 'bg-[#FFF5F5]',
    previewBorder: 'border-[#E11D48]',
    previewText: 'text-[#4C0519]',
    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.15)) drop-shadow(0 2px 6px rgba(225,29,72,0.12))',
  },
  'emerald': {
    name: 'Emerald Green',
    desc: 'Rich premium forest green with bright mint details',
    bgHex: '#093B30',
    title: '#F0FDFA',
    story: '#BCF0E6',
    divider: 'border-[#10B981] opacity-40',
    border: 'border-[#10B981]/30',
    badge: 'bg-white/10 border-[#10B981]/30 text-white',
    stamp: 'border-[#10B981] text-[#10B981]',
    shadow: 'shadow-[0_20px_45px_rgba(16,185,129,0.22)]',
    previewBg: 'bg-[#093B30]',
    previewBorder: 'border-[#10B981]',
    previewText: 'text-[#F0FDFA]',
    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.65)) drop-shadow(0 2px 10px rgba(16,185,129,0.2))',
  },
  'glass-frost': {
    name: 'Frosted Glass',
    desc: 'Translucent light base with soft backdrop blur',
    bgHex: 'rgba(255, 255, 255, 0.15)',
    backdropClass: 'backdrop-blur-xl',
    title: '#F8FAFC',
    story: '#CBD5E1',
    divider: 'border-white/50 opacity-80',
    border: 'border-white/50 border-2',
    badge: 'bg-white/15 border-white/25 text-white',
    stamp: 'border-white/75 text-white',
    shadow: 'shadow-[0_20px_45px_rgba(255,255,255,0.08)]',
    previewBg: 'bg-white/15 backdrop-blur-md',
    previewBorder: 'border-white/50',
    previewText: 'text-white',
    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.455)) drop-shadow(0 2px 8px rgba(255,255,255,0.08))',
  },
  'glass-cyber': {
    name: 'Cyber Glass',
    desc: 'Smoked glass with higher contrast glowing neon cyan accents',
    bgHex: 'rgba(28, 37, 54, 0.75)',
    backdropClass: 'backdrop-blur-2xl',
    title: '#f8fafc',
    story: '#94a3b8',
    divider: 'border-[#38bdf8] opacity-55',
    border: 'border-[#38bdf8]/50 border-2',
    badge: 'bg-black/50 border-[#38bdf8]/50 text-[#38bdf8]',
    stamp: 'border-[#38bdf8] text-[#38bdf8]',
    shadow: 'shadow-[0_0_40px_rgba(56,189,248,0.35)]',
    previewBg: 'bg-black/50 backdrop-blur-md',
    previewBorder: 'border-[#38bdf8]/50',
    previewText: 'text-white',
    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.7)) drop-shadow(0 2px 12px rgba(56,189,248,0.35))',
  },
  'imperial-gold': {
    name: 'Imperial Gold',
    desc: 'Luminous pure gold gradient with premium obsidian text',
    bgHex: 'linear-gradient(135deg, #FFDF00 0%, #D4AF37 50%, #996515 100%)',
    backdropClass: '',
    title: '#1A1A1A',
    story: '#4A4A4A',
    divider: 'border-[#1A1A1A] opacity-30',
    border: 'border-[#ffffff]/50 border-2',
    badge: 'bg-[#1A1A1A] border-[#1A1A1A] text-[#FFDF00]',
    stamp: 'border-[#1A1A1A] text-[#1A1A1A]',
    shadow: 'shadow-[0_20px_45px_rgba(212,175,55,0.35)]',
    previewBg: 'bg-gradient-to-br from-[#FFDF00] to-[#D4AF37]',
    previewBorder: 'border-[#ffffff]/50',
    previewText: 'text-[#1A1A1A]',
    filter: 'drop-shadow(0 15px 35px rgba(212,175,55,0.45))',
  }
};

interface TicketStubProps {
  memory: Memory;
  bgClass?: string;
  className?: string;
  innerRef?: React.RefObject<HTMLDivElement | null>;
  compact?: boolean;
}

export default function TicketStub({ memory, bgClass = 'bg-[var(--color-background)]', className = '', innerRef, compact = false }: TicketStubProps) {
  // Use 15 scallops for a finer, more realistic stamp edge
  const scallopArray = [...Array(15)];

  const theme = LUXURY_THEMES[memory.themePreset || 'ivory-gold'] || LUXURY_THEMES['ivory-gold'];
  const cutoutSize = '12px';
  
  const topMask = {
    WebkitMaskImage: `radial-gradient(circle at 50% 0, transparent 5px, black 5.5px), radial-gradient(circle at 0 100%, transparent ${cutoutSize}, black calc(${cutoutSize} + 0.5px)), radial-gradient(circle at 100% 100%, transparent ${cutoutSize}, black calc(${cutoutSize} + 0.5px))`,
    WebkitMaskSize: `20px 20px, 51% calc(100% - 18px), 51% calc(100% - 18px)`,
    WebkitMaskPosition: `top left, left bottom, right bottom`,
    WebkitMaskRepeat: `repeat-x, no-repeat, no-repeat`,
  };
  
  const bottomMask = {
    WebkitMaskImage: `radial-gradient(circle at 50% 100%, transparent 5px, black 5.5px), radial-gradient(circle at 0 0, transparent ${cutoutSize}, black calc(${cutoutSize} + 0.5px)), radial-gradient(circle at 100% 0, transparent ${cutoutSize}, black calc(${cutoutSize} + 0.5px))`,
    WebkitMaskSize: `20px 20px, 51% calc(100% - 18px), 51% calc(100% - 18px)`,
    WebkitMaskPosition: `bottom left, left top, right top`,
    WebkitMaskRepeat: `repeat-x, no-repeat, no-repeat`,
  };

  const isLocked = memory.isTimeCapsule && memory.unlockDate && new Date() < new Date(memory.unlockDate);
  const primaryImage = memory.images && memory.images.length > 0 ? memory.images[0].uri : memory.imageUri;
  const imageCount = memory.images && memory.images.length > 1 ? memory.images.length : 0;
  const hasMultipleImages = memory.images && memory.images.length > 1;
  const ticketIdDisplay = memory.collectionName ? memory.collectionName : (memory.id?.substring(0,8) || 'PREVIEW');

  return (
    <div 
      ref={innerRef}
      className={`relative flex flex-col w-full mx-auto max-w-[380px] transition-all duration-300 transform-gpu will-change-transform ${compact ? 'aspect-[3/4]' : 'aspect-[5/8]'} ${className}`}
      style={{ filter: theme.filter || 'drop-shadow(0 20px 45px rgba(0,0,0,0.4))', transform: 'translateZ(0)' }}
    >
      {compact ? (
        // COMPACT GALLERY LAYOUT: Image -> Divider -> Title
        <>
          <div 
             className={`flex-1 flex flex-col min-h-0 items-center p-3 pt-3 pb-0 rounded-t-[16px] ${theme.backdropClass || ''}`}
             style={{ background: theme.bgHex, ...topMask }}
          >
            <div className={`w-full relative shadow-[0_10px_20px_rgba(0,0,0,0.1)] rounded-[12px] overflow-hidden flex-1 min-h-0 ${isLocked ? 'bg-black/80' : 'bg-black/5'}`}>
              {isLocked ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white/50 bg-black/50 backdrop-blur-sm shadow-inner">
                  <Lock className="w-8 h-8 mb-2 opacity-80 text-[var(--color-accent)]" strokeWidth={1.5} />
                </div>
              ) : primaryImage ? (
                <>
                  <img src={primaryImage} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover select-none filter group-hover:brightness-105 transition-all" alt={memory.title} />
                  {imageCount > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                      +{imageCount - 1} Images
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center opacity-50" style={{ color: theme.story }}>
                  <span className="font-serif italic capitalize text-sm">No Image</span>
                </div>
              )}
              
              <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1.5 z-10">
                {isLocked && memory.unlockDate && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase bg-black/70 text-[var(--color-accent)] backdrop-blur-md border border-[var(--color-accent)]/30 rounded-full shadow-lg">
                     <Lock className="w-3 h-3" />
                     {new Date(memory.unlockDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short', hour12: true })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative flex items-center shrink-0 h-0 z-10 -my-[1px]">
            <div className={`w-full border-t border-dashed mx-4 ${theme.divider}`} />
          </div>

          <div 
             className={`px-3 pb-4 pt-4 shrink-0 flex items-center justify-center text-center rounded-b-[16px] ${theme.backdropClass || ''}`}
             style={{ background: theme.bgHex, ...bottomMask }}
          >
            <h3 className="font-serif font-semibold tracking-tight leading-tight truncate w-full text-[16px] sm:text-lg" style={{ color: theme.title }}>
              {isLocked ? 'Time Capsule' : (memory.title || 'Untitled')}
            </h3>
          </div>
        </>
      ) : (
        // FULL LAYOUT: Image + Title + Meta -> Divider -> Quote + Stamp
        <>
          <div 
             className={`flex-1 flex flex-col min-h-0 text-center items-center p-4 sm:p-5 pt-5 sm:pt-6 pb-2 sm:pb-3 rounded-t-[16px] ${theme.backdropClass || ''}`}
             style={{ background: theme.bgHex, ...topMask }}
          >
            <div className={`w-full relative shadow-[0_10px_20px_rgba(0,0,0,0.1)] rounded-[12px] overflow-hidden flex-1 min-h-0 ${isLocked ? 'bg-black/90' : 'bg-black/5'}`}>
              {isLocked ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white bg-black/60 backdrop-blur-md shadow-inner border border-white/5">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mb-4 border border-[var(--color-accent)]/30">
                     <Lock className="w-8 h-8 text-[var(--color-accent)] opacity-90" strokeWidth={1.5} />
                  </div>
                  <p className="font-serif text-[var(--color-accent)] italic text-lg opacity-90 drop-shadow-md tracking-wide mb-1">Time Capsule</p>
                  <p className="text-white/60 text-xs font-mono tracking-widest uppercase">Memory Sealed</p>
                </div>
              ) : primaryImage ? (
                <>
                  <img src={primaryImage} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover select-none filter group-hover:brightness-105 transition-all" alt={memory.title} />
                  {imageCount > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur border border-white/20 text-white text-[11px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none">
                      +{imageCount - 1} Images
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center opacity-50" style={{ color: theme.story }}>
                  <span className="font-serif italic capitalize text-sm">No Image</span>
                </div>
              )}
              
              <div className="absolute top-2 left-2 right-2 flex flex-wrap justify-between gap-1.5 z-10">
                {isLocked && memory.unlockDate && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] sm:text-[11px] font-bold tracking-widest uppercase bg-black/80 text-[var(--color-accent)] backdrop-blur-md border border-[var(--color-accent)]/40 rounded-full shadow-lg w-full justify-center">
                    <Lock className="w-3.5 h-3.5" />
                     Opens on {new Date(memory.unlockDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short', hour12: true })}
                  </span>
                )}
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col items-center w-full mt-4 sm:mt-5 px-2">
              <h3 className="font-serif font-semibold tracking-tight leading-tight truncate w-full text-center text-2xl sm:text-3xl mb-2 sm:mb-3" style={{ color: isLocked ? theme.story : theme.title }}>
                {isLocked ? 'Sealed Memory' : (memory.title || 'Untitled')}
              </h3>
              <div className="flex items-center justify-center font-medium gap-2 sm:gap-3 text-[10px] sm:text-[11px]" style={{ color: theme.story }}>
                {isLocked ? (
                  <span className="flex items-center gap-1 leading-none uppercase tracking-widest opacity-60">
                    <Lock className="w-3.5 h-3.5" /> Hidden until unlock date
                  </span>
                ) : (
                  <>
                    <span className="flex items-center gap-1 leading-none">
                      <MapPin className="w-3.5 h-3.5" style={{ color: theme.story }} />
                      <span className="truncate max-w-[90px]">{memory.location || 'Unknown'}</span>
                    </span>
                    <span style={{ color: theme.story, opacity: 0.4 }}>|</span>
                    <span className="flex items-center gap-1 leading-none">
                      <Calendar className="w-3.5 h-3.5" style={{ color: theme.story }} />
                      {memory.date || 'Timeless'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="relative flex items-center shrink-0 h-0 z-10 -my-[1px]">
            <div className={`w-full border-t-2 border-dashed mx-6 sm:mx-8 ${theme.divider}`} />
          </div>

          <div 
             className={`flex flex-col justify-between shrink-0 relative text-center px-6 sm:px-8 pb-6 sm:pb-8 pt-5 sm:pt-6 min-h-[60px] sm:min-h-[70px] rounded-b-[16px] ${theme.backdropClass || ''}`}
             style={{ background: theme.bgHex, ...bottomMask }}
          >
            <div className="flex flex-col items-center justify-center flex-1 px-2">
              <div className="relative font-medium leading-tight sm:leading-relaxed font-sans text-[11px] sm:text-[13px]" style={{ color: theme.story }}>
                {isLocked ? (
                  <span className="opacity-50 italic">The contents of this memory remains a mystery until the set time...</span>
                ) : (
                  <>
                    <span className="absolute -top-3 -left-3 text-3xl font-serif" style={{ color: 'inherit', opacity: 0.2 }}>“</span>
                    <span className="px-1 relative z-10 line-clamp-2">{memory.story || 'A cherished memory preserved.'}</span>
                    <span className="absolute -bottom-1 -right-2 text-3xl font-serif line-height-[0]" style={{ color: 'inherit', opacity: 0.2 }}>”</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-end justify-between w-full mt-3 sm:mt-4 opacity-80 shrink-0">
              <span className="font-mono tracking-wider text-[8px] sm:text-[9.5px] opacity-75 flex items-center" style={{ color: theme.story }}>
                {hasMultipleImages && memory.collectionName ? (
                  <span className="inline-flex items-center gap-1 font-sans text-[10px] tracking-normal font-semibold leading-none">
                    <Folder className="w-3.5 h-3.5 text-inherit opacity-90 inline-block align-middle shrink-0 mr-1" />
                    <span className="truncate max-w-[155px]">{memory.collectionName}</span>
                  </span>
                ) : (
                  `ID #M-${(memory.id?.substring(0, 6) || 'PREVIEW').toUpperCase()}`
                )}
              </span>
              <div className={`rounded-full border opacity-60 flex items-center justify-center p-0.5 transform rotate-[-15deg] w-7 h-7 sm:w-8 sm:h-8 ${theme.stamp}`}>
                 <div className={`w-full h-full rounded-full border border-dashed flex flex-col items-center justify-center leading-[0.9] font-bold text-[4px] sm:text-[5px] ${theme.stamp}`}>
                    {isLocked ? <Lock className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                 </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

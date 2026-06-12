import React from 'react';
import { MapPin, Calendar, QrCode, Sparkles, Lock } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Memory } from '../types';
import { LUXURY_THEMES } from './TicketStub';

interface TicketBackProps {
  memory: Memory;
  bgClass?: string;
  className?: string;
  innerRef?: React.RefObject<HTMLDivElement | null>;
  compact?: boolean;
}

export default function TicketBack({ memory, bgClass = 'bg-[var(--color-background)]', className = '', innerRef, compact = false }: TicketBackProps) {
  // Use 15 scallops for a finer, more realistic stamp edge
  const scallopArray = [...Array(15)];

  const theme = LUXURY_THEMES[memory.themePreset || 'ivory-gold'] || LUXURY_THEMES['ivory-gold'];
  const qrUrl = `${window.location.origin}/?memoryId=${memory.id}`;

  const cutoutSize = '12px';
  const isLocked = memory.isTimeCapsule && memory.unlockDate && new Date() < new Date(memory.unlockDate);

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

  return (
    <div 
      ref={innerRef}
      className={`relative flex flex-col w-full mx-auto max-w-[380px] transition-all duration-300 transform-gpu will-change-transform ${compact ? 'aspect-[3/4]' : 'aspect-[5/8]'} ${className}`}
      style={{ filter: theme.filter || 'drop-shadow(0 20px 45px rgba(0,0,0,0.4))', transform: 'translateZ(0)' }}
    >
      {compact ? (
        // COMPACT GALLERY LAYOUT: QR -> Divider -> Title
        <>
          <div 
             className={`flex-1 flex flex-col min-h-0 items-center p-3 pt-3 pb-0 rounded-t-[16px] ${theme.backdropClass || ''}`}
             style={{ background: theme.bgHex, ...topMask }}
          >
            <div className="w-full relative shadow-[0_10px_20px_rgba(0,0,0,0.1)] rounded-[12px] overflow-hidden bg-white flex-1 min-h-0 flex items-center justify-center p-4 border border-black/10">
              <QRCode
                value={qrUrl}
                size={256}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                viewBox="0 0 256 256"
                fgColor="#1A1A1A"
                bgColor="#FFFFFF"
              />
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
              {isLocked ? 'Locked Capsule' : 'Scan to View Live'}
            </h3>
          </div>
        </>
      ) : (
        // FULL LAYOUT
        <>
          <div 
             className={`flex-1 flex flex-col min-h-0 text-center items-center p-4 sm:p-5 pt-5 sm:pt-6 pb-2 sm:pb-3 rounded-t-[16px] ${theme.backdropClass || ''}`}
             style={{ background: theme.bgHex, ...topMask }}
          >
            <div className={`w-full relative shadow-inner rounded-[12px] overflow-hidden shrink-0 flex items-center justify-center p-5 sm:p-6 border flex-1 min-h-[140px] ${theme.border}`}>
              <div className="w-full h-full flex items-center justify-center opacity-90 drop-shadow-sm bg-white/50 backdrop-blur-sm rounded-[12px] p-2">
                 <QRCode
                   value={qrUrl}
                   size={256}
                   style={{ height: '100%', maxWidth: '100%', width: '100%', objectFit: 'contain' }}
                   viewBox="0 0 256 256"
                   fgColor="#1A1A1A"
                   bgColor="transparent"
                 />
              </div>
              
              {/* Glass Badge */}
              <div className={`absolute top-3 right-3 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm text-[10px] font-bold tracking-wide uppercase ${theme.badge}`}>
                <QrCode className="w-3 h-3" />
                <span className="truncate max-w-[80px]">Scan Me</span>
              </div>
            </div>
            
            {/* Title & Meta */}
            <div className="shrink-0 flex flex-col items-center w-full mt-4 sm:mt-5 px-2">
              <h3 className="font-serif font-semibold tracking-tight leading-tight w-full text-center text-xl sm:text-2xl mb-2 sm:mb-3" style={{ color: theme.title }}>
                {isLocked ? 'Locked Capsule' : 'Digital Token'}
              </h3>
              <p className="font-medium text-center leading-tight sm:leading-relaxed text-[10px] sm:text-[11px] px-2 sm:px-4" style={{ color: theme.story }}>
                {isLocked ? 'Scan with a camera to share this ticket.' : 'Scan with any smartphone camera to view the interactive live version.'}
              </p>
            </div>
          </div>

          {/* Divider with side cutouts */}
          <div className="relative flex items-center shrink-0 h-0 z-10 -my-[1px]">
            <div className={`w-full border-t-2 border-dashed mx-6 sm:mx-8 ${theme.divider}`} />
          </div>

          {/* Bottom Area */}
          <div 
             className={`flex flex-col justify-between shrink-0 relative text-center px-6 sm:px-8 pb-6 sm:pb-8 pt-4 sm:pt-5 min-h-[60px] sm:min-h-[70px] rounded-b-[16px] ${theme.backdropClass || ''}`}
             style={{ background: theme.bgHex, ...bottomMask }}
          >
            {/* Authenticity Message */}
            <div className="flex flex-col items-center justify-center flex-1 px-2 mb-3">
               <div className="flex items-center gap-1.5 rounded-full border border-current font-bold tracking-[0.2em] uppercase opacity-80 px-3 py-1.5 text-[8px] sm:text-[9px]" style={{ color: theme.title }}>
                 <Sparkles className="w-3 h-3" />
                 Authenticated Memory
               </div>
            </div>

            {/* Bottom row: Ticket ID & Stamp */}
            <div className="flex items-end justify-between w-full mt-3 sm:mt-4 opacity-80 shrink-0">
               <span className="font-mono tracking-wider text-[8px] sm:text-[9.5px] opacity-70" style={{ color: theme.story }}>
                 ID #M-{memory.id.substring(0, 6).toUpperCase()}
               </span>
               
               {/* Abstract Stamp Graphic */}
               <div className={`rounded-full border opacity-60 flex items-center justify-center p-0.5 transform rotate-[-15deg] w-7 h-7 sm:w-8 sm:h-8 ${theme.stamp}`}>
                  <div className={`w-full h-full rounded-full border border-dashed flex flex-col items-center justify-center leading-[0.9] font-bold text-[4px] sm:text-[5px] ${theme.stamp}`}>
                     <Sparkles className="w-3 h-3" />
                  </div>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

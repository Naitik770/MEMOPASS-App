import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Memory } from '../types';
import { ChevronLeft, MoreVertical, Download, Share2, Sparkles, Edit2, Heart, Trash2, QrCode, Lock, Folder, Award, Hash, Clock, Calendar, Save } from 'lucide-react';
import TicketStub from '../components/TicketStub';
import TicketBack from '../components/TicketBack';
import { downloadTicketElement, shareTicketElement } from '../utils/ImageUtility';
import { doc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface MemoryDetailProps {
  memory: Memory;
  onBack: () => void;
  onEdit: (memory: Memory) => void;
  isOwner?: boolean;
  onCreateAccount?: () => void;
}

export default function MemoryDetail({ memory, onBack, onEdit, isOwner = true, onCreateAccount }: MemoryDetailProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(memory.isFavorite);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const ticketFrontRef = useRef<HTMLDivElement>(null);
  const ticketBackRef = useRef<HTMLDivElement>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const imageCount = memory.images?.length || (memory.imageUri ? 1 : 0);
  
  const displayMemory = imageCount > 0 ? {
    ...memory,
    images: memory.images ? [memory.images[currentImageIndex]] : [],
    imageUri: memory.images ? memory.images[currentImageIndex].uri : memory.imageUri,
    title: memory.images?.[currentImageIndex]?.title || memory.title
  } : memory;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : imageCount - 1);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentImageIndex(prev => prev < imageCount - 1 ? prev + 1 : 0);
  };

  const isFromSomeoneElse = memory.originalCreatorId 
    ? (!auth.currentUser || memory.originalCreatorId !== auth.currentUser.uid)
    : (!isOwner || (memory.creatorName && memory.creatorName !== (auth.currentUser?.displayName || 'MemoPass Member') && memory.creatorName !== 'MemoPass Member'));

  const [isLocked, setIsLocked] = useState(
    memory.isTimeCapsule && memory.unlockDate ? new Date() < new Date(memory.unlockDate) : false
  );

  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!memory.isTimeCapsule || !memory.unlockDate) return;
    
    // Auto-unlock checker
    const checkStatus = () => {
       const unlockDateObj = new Date(memory.unlockDate!);
       const now = new Date();
       const diff = unlockDateObj.getTime() - now.getTime();
       const currentlyLocked = diff > 0;
       
       if (currentlyLocked) {
         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
         const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
         const seconds = Math.floor((diff % (1000 * 60)) / 1000);
         
         const timeStringParts = [];
         if (days > 0) timeStringParts.push(`${days}d`);
         if (hours > 0 || days > 0) timeStringParts.push(`${hours}h`);
         if (minutes > 0 || hours > 0 || days > 0) timeStringParts.push(`${minutes}m`);
         timeStringParts.push(`${seconds}s`);
         
         setTimeRemaining(timeStringParts.join(' '));
       } else if (isLocked && !currentlyLocked) {
          setIsLocked(false);
          triggerUnlockEffects();
       }
    };
    
    checkStatus();
    const intervalId = setInterval(checkStatus, 1000);
    return () => clearInterval(intervalId);
  }, [isLocked, memory]);

  const triggerUnlockEffects = () => {
    // Removed confetti and vibrate for stability
  };

  // Optional: Add a hidden dev trick -> click lock to instantly unlock for testing
  const devUnlock = () => { if (isLocked) { setIsLocked(false); triggerUnlockEffects(); } };

  // Check exact time remaining
  const handleDelete = async () => {
    if (!isOwner || isLocked) return;
    try {
      await deleteDoc(doc(db, 'memories', memory.id));
      onBack();
    } catch (e) {
      console.error("Failed to delete memory", e);
      alert("Failed to delete memory.");
    }
  };

  const toggleFavorite = async () => {
    if (!isOwner) return;
    const newFav = !isFavorite;
    setIsFavorite(newFav);
    try {
      const docRef = doc(db, 'memories', memory.id);
      await updateDoc(docRef, { isFavorite: newFav });
    } catch (e) {
      console.error("Failed to update favorite status", e);
      setIsFavorite(!newFav);
    }
  };

  const triggerDownload = async () => {
    try {
       await downloadTicketElement(
         isFlipped ? 'ticket-back-element' : 'ticket-front-element', 
         `ticket-${memory.title || 'memory'}-${isFlipped ? 'backside' : 'frontside'}.png`
       );
    } catch (e) {
      console.error("Failed to download ticket", e);
      alert("Failed to download ticket.");
    }
  };

  const triggerSharing = async () => {
    try {
      await shareTicketElement(
         isFlipped ? 'ticket-back-element' : 'ticket-front-element',
         isLocked ? 'Locked Time Capsule' : memory.title || 'Memory',
         (msg, err) => { if(err) console.error(msg); else console.log(msg); }
      );
    } catch (e) {
      console.error("Failed to share", e);
    }
  };

  const generateTags = () => {
    if (isLocked) return [];
    const tags = [];
    if (typeof memory.aiSummary === 'string') tags.push(`#${memory.aiSummary.split(' ')[0].toLowerCase()}`);
    if (memory.title) tags.push(`#${memory.title.split(' ')[0].toLowerCase()}`);
    return tags;
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveTicket = async () => {
    if (!auth.currentUser || isSaving || saveSuccess) return;
    setIsSaving(true);
    try {
      const newMemoryData = {
        ...memory,
        originalCreatorId: memory.originalCreatorId || memory.userId,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        isFavorite: false,
      };
      // Remove id before adding
      delete (newMemoryData as any).id;
      
      await addDoc(collection(db, 'memories'), newMemoryData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to save ticket", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-background)] overflow-y-auto text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center opacity-40">
        <div className="w-[100vw] h-[100vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_60%)] opacity-20 -translate-y-[10%] transform-gpu" />
      </div>

      <div className="flex items-center justify-between p-6 shrink-0 mt-2 md:mt-0 max-w-lg mx-auto w-full relative z-20">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="font-serif text-lg tracking-wide text-white">{isLocked ? 'Time Capsule' : 'Ticket Details'}</h2>
        
        <div className="relative">
          {isOwner ? (
            <button onClick={() => !isLocked && setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-full transition-colors ${isLocked ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}`}>
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button 
              onClick={handleSaveTicket} 
              disabled={isSaving || saveSuccess}
              className={`p-2 rounded-full transition-colors ${saveSuccess ? 'text-green-400 bg-green-500/10' : 'hover:bg-white/10 text-white cursor-pointer'}`}
            >
              {saveSuccess ? <Sparkles className="w-5 h-5" /> : <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />}
            </button>
          )}

          {isMenuOpen && isOwner && !isLocked && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={() => { setIsMenuOpen(false); onEdit(memory); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer text-left">
                  <Edit2 className="w-4 h-4 text-[var(--color-accent)]" /> Edit Ticket
                </button>
                <button onClick={() => { setIsMenuOpen(false); setIsFlipped(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer text-left">
                  <QrCode className="w-4 h-4 text-[var(--color-accent)]" /> Show QR
                </button>
                <button onClick={() => { setIsMenuOpen(false); setShowDeleteConfirm(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left border-t border-white/10">
                  <Trash2 className="w-4 h-4 text-rose-400" /> Delete Ticket
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full px-6 pb-40 flex flex-col items-center">
        {/* Ticket Flipper Wrapper Container */}
        <div className={imageCount > 1 
          ? "relative w-full max-w-[320px] xs:max-w-[340px] sm:max-w-[360px] mx-auto flex items-center justify-center px-10 py-4 mb-2 select-none"
          : "w-full flex justify-center items-center py-4 mb-2 select-none"
        }>
            <div 
              onClick={() => {
                if (isLocked) {
                   triggerUnlockEffects(); // Just for fun if they click the locked capsule
                }
                setIsFlipped(prev => !prev);
              }}
              className={imageCount > 1
                ? "w-full max-w-[210px] xs:max-w-[220px] sm:max-w-[245px] aspect-[5/8] cursor-pointer perspective-1500 relative active:scale-[0.98] transition-transform duration-200 shrink-0"
                : "w-full max-w-[340px] aspect-[5/8] cursor-pointer perspective-1500 select-none group relative active:scale-[0.98] transition-transform duration-200"
              }
            >
              <div className={`w-full h-full transition-transform duration-700 preserve-3d relative transform-gpu will-change-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div id="ticket-front-element" className="absolute inset-0 backface-hidden w-full h-full overflow-hidden rounded-[16px]">
                  {imageCount > 1 ? (
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={currentImageIndex}
                        initial={{ x: direction * 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -direction * 60, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="w-full h-full transform-gpu will-change-transform"
                      >
                        <TicketStub innerRef={ticketFrontRef} memory={displayMemory} className="w-full h-full" bgClass="bg-[#07090D]" />
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <TicketStub innerRef={ticketFrontRef} memory={displayMemory} className="w-full h-full" bgClass="bg-[#07090D]" />
                  )}
                </div>
                <div id="ticket-back-element" className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full">
                  <TicketBack innerRef={ticketBackRef} memory={displayMemory} className="w-full h-full" bgClass="bg-[#07090D]" />
                </div>
              </div>
            </div>
            
            {imageCount > 1 && !isFlipped && (
               <>
                 <button 
                  onClick={handlePrevImage}
                  className="pointer-events-auto absolute left-1 xs:left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition cursor-pointer shadow-xl z-20">
                    <span className="text-xl font-serif leading-none">‹</span>
                 </button>
                 <button 
                  onClick={handleNextImage}
                  className="pointer-events-auto absolute right-1 xs:right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition cursor-pointer shadow-xl z-20">
                    <span className="text-xl font-serif leading-none">›</span>
                 </button>
               </>
            )}
        </div>
        
        <div className="text-[10px] text-[var(--color-accent)]/70 uppercase tracking-widest font-mono mb-8 flex flex-col items-center gap-2 opacity-80 mt-2">
          <div className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" />
          {isFlipped ? "Tap ticket to see front" : "Tap ticket to scan QR"}</div>
          {imageCount > 1 && !isFlipped && (
            <div className="flex gap-2 mt-2">
              {Array.from({length: imageCount}).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-[var(--color-accent)] scale-125' : 'bg-white/20'}`} />
              ))}
            </div>
          )}
        </div>

        {/* About this memory text */}
        <div className="w-full space-y-4 px-2">
          {isLocked ? (
             <div className="p-5 border border-white/10 rounded-2xl bg-white/5 text-center shadow-lg">
              <Lock className="w-8 h-8 mx-auto mb-3 text-[var(--color-accent)] opacity-80" />
              <h4 className="text-white font-medium mb-1 tracking-wide">Time Capsule Locked</h4>
              <p className="text-[var(--color-secondary)] text-[13px] leading-relaxed mb-3">
                This memory is sealed and cannot be fully viewed until the unlock date.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-xl font-mono text-sm border border-[var(--color-accent)]/20 shadow-inner">
                <Clock className="w-4 h-4" />
                <span>{timeRemaining || 'Unlocking soon...'}</span>
              </div>
            </div>
          ) : (
             <>
                {imageCount > 1 && (
                  <div className="mb-6 w-full text-center sm:text-left border-b border-white/10 pb-4">
                    <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest font-mono font-bold block mb-1">Pass Title</span>
                    <h1 className="text-white font-serif text-2xl font-bold leading-tight">
                      {memory.title || 'Untitled Memory'}
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-xs text-slate-400 font-mono">
                      <span>Image {currentImageIndex + 1} of {imageCount}</span>
                      {memory.images?.[currentImageIndex]?.title && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="italic">"{memory.images[currentImageIndex].title}"</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <h4 className="text-white font-medium text-sm">About this memory</h4>
                <p className="text-[var(--color-secondary)] text-[13px] leading-relaxed">
                  {memory.story || "A beautiful moment that will stay in my heart forever. The day filled with peace, blessings and unforgettable memories."}
                </p>

                {memory.specialDetail && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-white font-medium text-sm mb-1.5 flex items-center gap-2">
                       <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Why it matters
                    </h4>
                    <p className="text-[var(--color-secondary)] text-[13px] leading-relaxed">
                      {memory.specialDetail}
                    </p>
                  </div>
                )}
                
                {isFromSomeoneElse && memory.creatorName && (
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#bda664]/40 to-[#bda664]/10 border border-[#bda664]/30 flex items-center justify-center text-[#bda664] font-serif text-lg overflow-hidden shrink-0 shadow-inner uppercase">
                        {memory.creatorPhotoURL ? (
                          <img src={memory.creatorPhotoURL} alt={memory.creatorName} className="w-full h-full object-cover" />
                        ) : (
                          memory.creatorName.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">{memory.creatorName}</h4>
                        <p className="text-[10px] text-[var(--color-accent)]/80 uppercase tracking-widest font-medium">Original Creator</p>
                      </div>
                    </div>
                  </div>
                )}
             </>
          )}
          
          <div className="flex flex-wrap gap-2 pt-2">
            {generateTags().map((tag, i) => (
              <span key={i} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] text-[var(--color-accent)] font-mono tracking-wide">
                {tag}
              </span>
            ))}
          </div>

          {isLocked ? (
            <div className="mt-8 pt-6 border-t border-white/5">
               <h4 className="text-[var(--color-secondary)] font-medium text-xs uppercase tracking-widest mb-4 flex items-center gap-2 opacity-50"><Lock className="w-3 h-3" /> Hidden Details</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-30 blur-[4px] pointer-events-none select-none">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center"><Folder className="w-4 h-4 text-slate-400" /></div>
                     <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Location</p>
                        <p className="text-sm text-slate-200">Classified</p>
                     </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-slate-400" /></div>
                     <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Date</p>
                        <p className="text-sm text-slate-200">Classified</p>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="mt-8 pt-6 border-t border-white/5">
               <h4 className="text-slate-400 font-medium text-xs uppercase tracking-widest mb-4">Memory Metadata</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {memory.collectionName && (
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                          <Folder className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Collection</p>
                          <p className="text-sm text-slate-200 font-medium">{memory.collectionName}</p>
                       </div>
                    </div>
                  )}

                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Hash className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Memory ID</p>
                        <p className="text-sm text-slate-200 font-medium font-mono">#{memory.id.substring(0, 6).toUpperCase()}</p>
                     </div>
                  </div>

                  {memory.isTimeCapsule && (
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                          {isLocked ? <Lock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Capsule Status</p>
                          <p className="text-sm text-slate-200 font-medium">{isLocked ? `Locked (${timeRemaining || '...'})` : 'Unlocked'}</p>
                       </div>
                    </div>
                  )}
                  
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Award className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Achievement Impact</p>
                        <p className="text-sm text-slate-200 font-medium">Story Keeper</p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[360px]">
        <div className="flex items-center justify-between px-8 py-3 bg-[var(--color-surface)]/80 backdrop-blur-2xl border border-[var(--color-border)] rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          
          <button onClick={triggerSharing} className="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-white transition-colors cursor-pointer w-14">
            <Share2 className="w-5 h-5 mb-1 text-[var(--color-secondary)]" strokeWidth={2} />
            <span className="text-[10px] font-medium tracking-wide">Share</span>
          </button>

          {/* Center Glowing Action (Heart) */}
          <div className="px-2">
            <div className="relative group cursor-pointer" onClick={toggleFavorite}>
              <div className={`absolute inset-0 ${isFavorite ? 'bg-pink-500' : 'bg-rose-500'} blur-xl rounded-full opacity-40 group-hover:opacity-80 transition-opacity`}></div>
              <div className={`relative w-16 h-16 shadow-[0_0_20px_rgba(244,63,94,0.3)] border border-white/30 rounded-full flex items-center justify-center transform group-hover:scale-105 transition-all flex-col gap-0.5 ${isFavorite ? 'bg-gradient-to-tr from-pink-500 to-rose-400 text-white' : 'bg-[#1A1A1A] text-slate-400 hover:text-rose-400'}`}>
                 <Heart className="w-5 h-5" strokeWidth={2.5} fill={isFavorite ? "currentColor" : "none"} />
                 <span className="text-[9px] font-bold tracking-wide">{isFavorite ? 'Saved' : 'Love'}</span>
              </div>
            </div>
          </div>

          <button onClick={triggerDownload} className={`flex flex-col items-center justify-center p-2 transition-colors w-14 text-slate-400 hover:text-white cursor-pointer`}>
            <Download className="w-5 h-5 mb-1 text-[var(--color-secondary)]" strokeWidth={2} />
            <span className="text-[10px] font-medium tracking-wide">Download</span>
          </button>
          
        </div>
      </div>
      
      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-white mb-2">Delete Ticket</h3>
            <p className="text-sm text-[var(--color-secondary)] mb-6">
              Are you sure you want to delete this memory? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-rose-500 hover:bg-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.3)] transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


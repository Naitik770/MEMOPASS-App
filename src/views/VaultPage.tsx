import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, X, QrCode, Scan, Loader2, Sparkles, Search, Gift, Clock, Calendar, Hash, Award, Lock, FileText, ChevronLeft } from 'lucide-react';
import jsQR from 'jsqr';
const Scanner = React.lazy(() => import('@yudiel/react-qr-scanner').then(module => ({ default: module.Scanner })));
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Memory } from '../types';
import { User } from 'firebase/auth';
import TicketStub from '../components/TicketStub';

interface VaultPageProps {
  user: User;
  memories: Memory[];
  onMemoryFound: (memory: Memory) => void;
  onClose: () => void;
}

export default function VaultPage({ user, memories, onMemoryFound, onClose }: VaultPageProps) {
  const [showScannerModal, setShowScannerModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'scan' | 'upload'>('scan');
  const [isScanning, setIsScanning] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  const processQrData = async (data: string) => {
    if (!data || isLoading) return;
    setIsScanning(false);
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let memoryId = null;

      try {
        const url = new URL(data);
        if (url.searchParams.has('memoryId')) {
           memoryId = url.searchParams.get('memoryId');
        } else if (data.includes('memopass:')) {
           memoryId = data.split('memopass:')[1];
        } else {
           memoryId = data;
        }
      } catch (e) {
        if (data.startsWith('memopass:')) {
           memoryId = data.replace('memopass:', '');
        } else {
           memoryId = data; 
        }
      }

      if (!memoryId) {
        throw new Error("Invalid QR Code configuration.");
      }

      const cleanMemoryId = memoryId.trim();
      const docRef = doc(db, 'memories', cleanMemoryId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const memData = docSnap.data();
        const memory: Memory = {
          id: docSnap.id,
          title: memData.title,
          location: memData.location,
          date: memData.date,
          story: memData.story,
          specialDetail: memData.specialDetail,
          imageUri: memData.imageUri,
          userId: memData.userId,
          createdAt: memData.createdAt,
          isFavorite: memData.isFavorite,
          collectionName: memData.collectionName,
          isTimeCapsule: memData.isTimeCapsule,
          unlockDate: memData.unlockDate,
          aiSummary: memData.aiSummary,
          backgroundColor: memData.backgroundColor,
          titleColor: memData.titleColor,
          storyColor: memData.storyColor,
          themePreset: memData.themePreset,
          creatorName: memData.creatorName || 'MemoPass Member',
          creatorPhotoURL: memData.creatorPhotoURL || null,
          originalCreatorId: memData.originalCreatorId || memData.userId,
        };
        setTimeout(() => {
          setShowScannerModal(false);
          setIsLoading(false);
          onMemoryFound(memory);
        }, 1000);
      } else {
        throw new Error("This is not a MemoPass Memory Ticket.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("This is not a MemoPass Memory Ticket.");
      setTimeout(() => {
        setErrorMsg(null);
        if (activeTab === 'scan') {
          setIsScanning(true);
        }
      }, 4000);
    } finally {
      if (errorMsg) setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const imageUrl = window.URL.createObjectURL(file);
      const img = new window.Image();
      img.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      window.URL.revokeObjectURL(imageUrl);

      const canvas = document.createElement("canvas");
      // Scale down if too large, jsqr works better on reasonable sizes
      const MAX_DIMENSION = 1200;
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Could not create canvas context");
      
      // Draw image
      ctx.drawImage(img, 0, 0, width, height);
      
      const imageData = ctx.getImageData(0, 0, width, height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });

      if (code && code.data) {
        processQrData(code.data);
      } else {
        throw new Error("No QR found");
      }
    } catch (error) {
      console.error("QR Upload Error:", error);
      setIsLoading(false);
      setErrorMsg("No readable Memory Ticket found in this image. Please ensure the QR code is clearly visible.");
      setTimeout(() => setErrorMsg(null), 4000);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Pre-calculate insights
  const insights = useMemo(() => {
    const totalMemories = memories.length;
    const timeCapsules = memories.filter(m => m.isTimeCapsule);
    const lockedCapsules = timeCapsules.filter(m => m.unlockDate && new Date() < new Date(m.unlockDate));
    const activeCapsules = timeCapsules.length - lockedCapsules.length;
    
    // Nearest unlock date
    let nextUnlock: Date | null = null;
    lockedCapsules.forEach(m => {
        if (m.unlockDate) {
            const d = new Date(m.unlockDate);
            if (!nextUnlock || d < nextUnlock) nextUnlock = d;
        }
    });

    // Most active month
    const monthCounts: Record<string, number> = {};
    memories.forEach(m => {
        if (m.date) {
            const date = new Date(m.date);
            if (!isNaN(date.getTime())) {
                const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                monthCounts[month] = (monthCounts[month] || 0) + 1;
            }
        }
    });
    let mostActiveMonth = 'None yet';
    let maxCount = 0;
    Object.entries(monthCounts).forEach(([m, count]) => {
        if (count > maxCount) {
            mostActiveMonth = m;
            maxCount = count;
        }
    });

    // On this day
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    const onThisDayMemories = memories.filter(m => {
        if (!m.date) return false;
        const d = new Date(m.date);
        if (isNaN(d.getTime())) return false;
        return d.getMonth() === todayMonth && d.getDate() === todayDate && d.getFullYear() < today.getFullYear();
    });

    return {
        totalMemories,
        totalTimeCapsules: timeCapsules.length,
        lockedCapsules: lockedCapsules.length,
        activeCapsules,
        mostActiveMonth,
        nextUnlock,
        onThisDayMemories
    };
  }, [memories]);

  // Search logic
  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return memories.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.location.toLowerCase().includes(q) || 
      (m.collectionName && m.collectionName.toLowerCase().includes(q)) ||
      (m.aiSummary && typeof m.aiSummary === 'string' && m.aiSummary.toLowerCase().includes(q))
    ).slice(0, 5); // Just top 5
  }, [memories, searchQuery]);

  const handleRandomMemory = () => {
    if (memories.length > 0) {
        const randomIndex = Math.floor(Math.random() * memories.length);
        onMemoryFound(memories[randomIndex]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-0"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[radial-gradient(circle_at_center,_#bda664_0%,_transparent_60%)] opacity-20 pointer-events-none transform-gpu"></div>

      {/* Header */}
      <header className="px-6 pt-12 pb-4 relative z-10 flex justify-between items-start shrink-0">
        <div className="pt-2">
           <div className="flex items-center gap-2 mb-2">
             <Hash className="w-5 h-5 text-[#bda664]" />
             <span className="font-serif tracking-wide text-2xl text-white font-medium">MemoPass Vault</span>
           </div>
           <p className="text-sm text-slate-400 max-w-[280px] font-light leading-relaxed">
             Your personal memory control center.
           </p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => {
                    setShowScannerModal(true);
                    setActiveTab('scan');
                    setIsScanning(true);
                    setErrorMsg(null);
                }}
                className="p-3 border border-[#bda664]/30 rounded-full text-[#bda664] bg-[#bda664]/10 hover:bg-[#bda664]/20 transition-all shadow-sm"
                title="Scan QR Code"
            >
                <QrCode className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Main Content scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 relative z-10 space-y-8">
          
          {/* Search Bar */}
          <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-zinc-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles, locations, tags..."
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-[#bda664]/50 focus:bg-zinc-900 transition-all shadow-inner"
              />
              {filteredMemories.length > 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                      {filteredMemories.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => onMemoryFound(m)}
                            className="px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors"
                          >
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                                  {m.imageUri ? (
                                      <img src={m.imageUri} alt={m.title} className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center"><FileText className="w-4 h-4 text-zinc-500" /></div>
                                  )}
                              </div>
                              <div>
                                  <h4 className="text-sm font-medium text-white line-clamp-1">{m.title || 'Untitled Memory'}</h4>
                                  <p className="text-xs text-zinc-500">{m.date || 'No Date'}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Random Memory */}
            <div 
                onClick={handleRandomMemory}
                className="bg-gradient-to-br from-[#bda664]/10 to-transparent border border-[#bda664]/20 rounded-3xl p-6 cursor-pointer hover:border-[#bda664]/40 transition-all group"
            >
                <div className="w-12 h-12 rounded-xl bg-[#bda664]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Gift className="w-6 h-6 text-[#bda664]" />
                </div>
                <h3 className="font-serif text-xl font-medium text-white mb-2">Surprise Me</h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">Rediscover a random memory from your archive. Let fate choose.</p>
            </div>

            {/* On This Day */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
                <h3 className="font-serif text-xl font-medium text-white mb-2">On This Day</h3>
                {insights.onThisDayMemories.length > 0 ? (
                    <div className="space-y-3 mt-4">
                        {insights.onThisDayMemories.slice(0, 2).map(m => {
                            const yearsAgo = new Date().getFullYear() - new Date(m.date).getFullYear();
                            return (
                                <div key={m.id} onClick={() => onMemoryFound(m)} className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                                        {m.imageUri ? (
                                            <img src={m.imageUri} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-800" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white">{yearsAgo} {yearsAgo === 1 ? 'year' : 'years'} ago</h4>
                                        <p className="text-xs text-zinc-500 truncate">{m.title}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-zinc-500 font-light mt-4 italic">No memories recorded on this date in past years.</p>
                )}
            </div>
          </div>

          {/* Memory Insights */}
          <div>
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4 px-2">Insights</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                      <p className="text-2xl font-serif text-white mb-1">{insights.totalMemories}</p>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Total Tickets</p>
                  </div>
                  <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                      <p className="text-2xl font-serif text-white mb-1">{insights.totalTimeCapsules}</p>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Time Capsules</p>
                  </div>
                  <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-start col-span-2 md:col-span-1">
                      <p className="text-lg font-serif text-white mb-0.5 truncate w-full">{insights.mostActiveMonth}</p>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Most Active</p>
                  </div>
              </div>
          </div>

          {/* Time Capsules Quick Access */}
          <div>
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4 px-2">Capsule Status</h3>
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-5">
                  <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                      <div className="flex gap-4">
                          <div>
                              <p className="text-xl font-medium text-emerald-400">{insights.activeCapsules}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Unlocked</p>
                          </div>
                          <div className="w-px h-8 bg-white/10" />
                          <div>
                              <p className="text-xl font-medium text-rose-400">{insights.lockedCapsules}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Locked</p>
                          </div>
                      </div>
                      {insights.nextUnlock && (
                         <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                             <Clock className="w-4 h-4 text-amber-400" />
                             <div>
                                 <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Next Unlock</p>
                                 <p className="text-xs text-white font-medium">{insights.nextUnlock.toLocaleDateString()}</p>
                             </div>
                         </div>
                      )}
                  </div>
                  {insights.totalTimeCapsules === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-2">Create a Time Capsule to see stats here.</p>
                  )}
              </div>
          </div>

      </div>

      {/* QR Scanner Modal Overlay */}
      <AnimatePresence>
          {showScannerModal && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              >
                  <div className="absolute inset-0 z-0" onClick={() => setShowScannerModal(false)} />
                  
                  <motion.div 
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
                  >
                      {/* Modal Header */}
                      <div className="flex items-center gap-4 p-5 border-b border-white/5 relative z-20">
                          <button onClick={() => setShowScannerModal(false)} className="p-2 -ml-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                              <ChevronLeft className="w-6 h-6 text-white" />
                          </button>
                          <div>
                              <h3 className="font-serif text-lg text-white">Scan Memory Ticket</h3>
                              <p className="text-xs text-zinc-400">Import a digital token</p>
                          </div>
                      </div>

                      <div className="p-5">
                        {/* Action Toggle */}
                        <div className="flex p-1.5 bg-black/50 border border-white/5 rounded-2xl mb-6 shadow-inner">
                        <button 
                            onClick={() => { setActiveTab('scan'); setIsScanning(true); setErrorMsg(null); setIsLoading(false); }}
                            className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${activeTab === 'scan' ? 'bg-[#2a2a2a] text-white shadow-md border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Scan className="w-4 h-4" />
                            Scanner
                        </button>
                        <button 
                            onClick={() => { setActiveTab('upload'); setIsScanning(false); setErrorMsg(null); setIsLoading(false); }}
                            className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${activeTab === 'upload' ? 'bg-[#2a2a2a] text-white shadow-md border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <ImageIcon className="w-4 h-4" />
                            Upload
                        </button>
                        </div>

                        {/* Scanner Area */}
                        <div className="flex-1 flex items-center justify-center w-full max-w-sm mx-auto">
                            <div className="w-full aspect-[4/5] relative bg-[#111] border border-white/5 rounded-[1.5rem] overflow-hidden shadow-xl flex flex-col items-center justify-center">
                                
                                <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div 
                                    key="loading"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex flex-col items-center gap-6 z-20"
                                    >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#bda664] blur-xl opacity-30 rounded-full animate-pulse"></div>
                                        <div className="w-16 h-16 bg-[#1a1a1a] border border-[#bda664]/30 rounded-2xl flex items-center justify-center relative shadow-xl">
                                        <Sparkles className="w-7 h-7 text-[#bda664] animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[#bda664] font-medium tracking-widest uppercase text-xs mb-2">Decrypting</p>
                                        <p className="text-sm text-slate-300 font-light">Unlocking memory capsule...</p>
                                    </div>
                                    </motion.div>

                                ) : errorMsg ? (
                                    <motion.div 
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="px-8 text-center flex flex-col items-center z-20"
                                    >
                                    <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                                        <X className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-lg font-serif font-medium text-white mb-2">Invalid Ticket</h3>
                                    <p className="text-zinc-400 font-light text-sm leading-relaxed">{errorMsg}</p>
                                    </motion.div>

                                ) : activeTab === 'scan' ? (
                                    <motion.div 
                                    key="scanner"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black"
                                    >
                                    {isScanning && (
                                        <React.Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white/50"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                                            <Scanner
                                            onScan={(detectedCodes) => {
                                                if (detectedCodes && detectedCodes.length > 0) {
                                                processQrData(detectedCodes[0].rawValue);
                                                }
                                            }}
                                            scanDelay={500}
                                            components={{ tracker: true, audio: false }}
                                            styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
                                            />
                                        </React.Suspense>
                                    )}
                                    {/* Premium Scanner Overlay Frame */}
                                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
                                        <div className="absolute inset-6 border border-white/10 rounded-2xl overflow-hidden">
                                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#bda664] rounded-tl-2xl"></div>
                                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#bda664] rounded-tr-2xl"></div>
                                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#bda664] rounded-bl-2xl"></div>
                                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#bda664] rounded-br-2xl"></div>
                                        
                                        {/* Animated Scan Line */}
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#bda664] to-transparent shadow-[0_0_15px_#bda664] animate-[scanLine_2.5s_ease-in-out_infinite]"></div>
                                        </div>
                                    </div>
                                    </motion.div>

                                ) : (
                                    <motion.div 
                                    key="upload"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center text-center px-6 h-full w-full"
                                    >
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-20 h-20 bg-black border border-white/5 group-hover:border-[#bda664]/30 rounded-full flex items-center justify-center mb-6 text-zinc-500 group-hover:text-[#bda664] transition-all duration-300 shadow-xl relative z-10">
                                        <ImageIcon className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-serif text-white mb-2 tracking-wide">Gallery Image</h3>
                                    <p className="text-zinc-400 text-xs mb-8 font-light leading-relaxed max-w-[200px]">
                                        Upload a saved Memory Ticket image to decrypt it.
                                    </p>
                                    
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold text-sm rounded-xl transition-colors shadow-lg active:scale-[0.98]"
                                    >
                                        Browse Device
                                    </button>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </div>
                      </div>
                      
                      {/* Mobile action explicit close */}
                      <button onClick={() => setShowScannerModal(false)} className="py-4 border-t border-white/5 text-zinc-400 sm:hidden hover:text-white transition-colors text-sm font-medium">Cancel QR Scan</button>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
      
      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(0); opacity: 0;}
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(280px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

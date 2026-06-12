import React, { useState } from 'react';
import { Camera, MapPin, Calendar, Sparkles, ChevronRight, ChevronLeft, Check, Image as ImageIcon, Folder, Lock, Unlock, X } from 'lucide-react';
import { processImageFile } from '../utils/ImageUtility';
import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import TicketStub, { LUXURY_THEMES } from '../components/TicketStub';
import ImageCropper from '../components/ImageCropper';
import { requestNotificationPermission } from '../utils/NotificationManager';

import { Memory } from '../types';

interface CreateMemoryProps {
  onComplete: () => void;
  initialMemory?: Memory | null;
}

export default function CreateMemory({ onComplete, initialMemory }: CreateMemoryProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showAchievementToast, setShowAchievementToast] = useState(false);
  const [achievementTitle, setAchievementTitle] = useState('');

  // Form State
  const [images, setImages] = useState<{uri: string; title: string}[]>(initialMemory?.images || (initialMemory?.imageUri ? [{uri: initialMemory.imageUri, title: ''}] : []));
  const imageUri = images.length > 0 ? images[0].uri : null;
  const [rawImageUri, setRawImageUri] = useState<string | null>(null);
  const [croppingImageIndex, setCroppingImageIndex] = useState<number>(0);
  const [globalImageTitle, setGlobalImageTitle] = useState('');
  const [applyGlobalTitle, setApplyGlobalTitle] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [title, setTitle] = useState(initialMemory?.title || '');
  const [location, setLocation] = useState(initialMemory?.location || '');
  const [date, setDate] = useState(initialMemory?.date || '');
  const [story, setStory] = useState(initialMemory?.story || '');
  const [specialDetail, setSpecialDetail] = useState(initialMemory?.specialDetail || '');
  const [themePreset, setThemePreset] = useState(initialMemory?.themePreset || 'ivory-gold');
  const [backgroundColor, setBackgroundColor] = useState(initialMemory?.backgroundColor || '#FFFFFF');
  const [titleColor, setTitleColor] = useState(initialMemory?.titleColor || '#0F172A');
  const [storyColor, setStoryColor] = useState(initialMemory?.storyColor || '#64748B');
  const [collectionName, setCollectionName] = useState(initialMemory?.collectionName || '');
  const [isTimeCapsule, setIsTimeCapsule] = useState(initialMemory?.isTimeCapsule || false);
  const [unlockDate, setUnlockDate] = useState(initialMemory?.unlockDate || '');
  
  const [existingCollections, setExistingCollections] = useState<string[]>([]);
  
  React.useEffect(() => {
    if (auth.currentUser) {
      getDocs(query(collection(db, 'memories'), where('userId', '==', auth.currentUser.uid)))
        .then(snap => {
          const cols = new Set<string>();
          snap.forEach(d => {
            if (d.data().collectionName) cols.add(d.data().collectionName);
          });
          setExistingCollections(Array.from(cols));
        }).catch(console.error);
    }
  }, []);

  const bgColors = [
    // Lights
    { id: 'white', hex: '#FFFFFF', name: 'Alabaster' },
    { id: 'cream', hex: '#FDFBF7', name: 'Cream' },
    { id: 'sand', hex: '#F5F2EB', name: 'Sand' },
    { id: 'blush', hex: '#FDF8F6', name: 'Blush' },
    { id: 'sage', hex: '#F4F7F5', name: 'Sage' },
    { id: 'mist', hex: '#F0F5F9', name: 'Mist' },
    { id: 'lavender', hex: '#F5F3FF', name: 'Lavender' },
    { id: 'peach', hex: '#FFF5F5', name: 'Peach' },
    { id: 'mint', hex: '#F0FFF4', name: 'Mint' },
    // Mediums & Rich
    { id: 'slate', hex: '#64748B', name: 'Slate' },
    { id: 'camel', hex: '#C19A6B', name: 'Camel' },
    { id: 'rose', hex: '#BE123C', name: 'Rose' },
    { id: 'rust', hex: '#9A3412', name: 'Rust' },
    // Darks
    { id: 'charcoal', hex: '#1E293B', name: 'Charcoal' },
    { id: 'navy', hex: '#172554', name: 'Navy' },
    { id: 'forest', hex: '#064E3B', name: 'Forest' },
    { id: 'wine', hex: '#4C0519', name: 'Wine' },
    { id: 'espresso', hex: '#451A03', name: 'Espresso' },
    { id: 'midnight', hex: '#0F172A', name: 'Midnight' },
  ];

  const textColors = [
    // Extremely dark
    { id: 'black', hex: '#000000', name: 'Black' },
    { id: 'pure-charcoal', hex: '#0F172A', name: 'Rich Charcoal' },
    ...bgColors
  ];

  React.useEffect(() => {
    if (titleColor === backgroundColor) {
      setTitleColor(textColors.find(c => c.hex !== backgroundColor)?.hex || '#0F172A');
    }
    if (storyColor === backgroundColor) {
      setStoryColor(textColors.find(c => c.hex !== backgroundColor)?.hex || '#64748B');
    }
  }, [backgroundColor, titleColor, storyColor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = Array.from((e.target as HTMLInputElement).files || []) as File[];
    if (!files.length) return;
    
    let excessWarning = false;
    if (images.length + files.length > 5) {
      excessWarning = true;
      files = files.slice(0, 5 - images.length);
    }
    
    if (files.length === 0) {
      alert('Maximum of 5 images reached. Remove an existing image first.');
      return;
    }
    
    if (excessWarning) {
      alert(`Only selected the first ${files.length} images to keep within the maximum 5 image limit.`);
    }
    try {
      const newImages: {uri: string, title: string}[] = [];
      for (const file of files) {
        const b64 = await processImageFile(file, 800, 1000);
        newImages.push({ uri: b64, title: '' });
      }
      setImages(prev => {
        const next = [...prev, ...newImages];
        if (prev.length === 0 && newImages.length > 0) {
          setRawImageUri(newImages[0].uri);
          setCroppingImageIndex(0);
          setShowCropper(true);
        }
        return next;
      });
    } catch (err) {
      console.error(err);
      alert('Failed to process images');
    }
  };

  const nextStep = () => {
    if (step === 1 && !imageUri && !story) {
      if (!confirm('Proceed without an image?')) return;
    }
    if (step === 2 && !title) {
      alert('Title is required to categorize this memory.');
      return;
    }
    setStep(s => Math.min(s + 1, 5));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    if (isTimeCapsule) {
       requestNotificationPermission().catch(console.error);
    }
    
    try {
      const payload = {
        userId: auth.currentUser.uid,
        title,
        location,
        date,
        story,
        specialDetail,
        imageUri,
        images: images.map(img => ({ uri: img.uri, title: applyGlobalTitle ? globalImageTitle : img.title })),
        themePreset,
        backgroundColor,
        titleColor,
        storyColor,
        collectionName: collectionName || null,
        isTimeCapsule,
        unlockDate: isTimeCapsule ? unlockDate : null,
        aiSummary: false, // We'll mock the AI flag for now, or true if they used it
        creatorName: initialMemory?.creatorName || auth.currentUser.displayName || 'MemoPass Member',
        creatorPhotoURL: initialMemory?.creatorPhotoURL || auth.currentUser.photoURL || null,
        originalCreatorId: initialMemory?.originalCreatorId || auth.currentUser.uid,
      };

      if (initialMemory && initialMemory.id) {
        await updateDoc(doc(db, 'memories', initialMemory.id), payload);
      } else {
        await addDoc(collection(db, 'memories'), {
          ...payload,
          createdAt: serverTimestamp(),
          isFavorite: false,
        });
      }

      // Check achievements locally based on what they just did
      let achievementObj = '';
      if (!initialMemory) {
        if (isTimeCapsule) achievementObj = 'Time Traveler';
        else achievementObj = 'Master of the Code'; // simple fallback just to show effect
      }

      if (achievementObj) {
         setAchievementTitle(achievementObj);
         setShowAchievementToast(true);
         setTimeout(() => {
           setShowAchievementToast(false);
           onComplete();
         }, 2500);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save memory.');
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col min-h-full md:min-h-0 bg-transparent text-[var(--color-primary)] md:mt-6 md:mb-6 md:rounded-3xl md:border-0 shadow-none md:overflow-hidden relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showAchievementToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 30, scale: 1 }} 
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent)]/50 rounded-2xl p-4 shadow-2xl flex items-center gap-4 w-[90%] max-w-sm"
          >
            <div className="w-12 h-12 bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
               <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-accent)] font-bold mb-0.5">Achievement Unlocked</p>
              <p className="text-white font-serif text-lg leading-tight">{achievementTitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Wizard Header */}
      <div className="px-6 sm:px-10 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-black/10">
        <div>
          <h2 className="text-xl font-bold">{initialMemory ? 'Edit Memory' : 'Create Memory'}</h2>
          <p className="text-[var(--color-secondary)] text-sm font-medium mt-0.5">Step {step} of 5</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step >= i ? 'bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 relative flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: UPLOAD IMAGE */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-center max-w-lg mx-auto w-full flex-1">
              <div className="text-center mb-8 shrink-0">
                <h3 className="text-2xl font-bold mb-2">Upload Visuals</h3>
                <p className="text-[var(--color-secondary)]">Provide an image for the ticket stub.</p>
              </div>
              
              <div className="relative group w-full aspect-square sm:aspect-video rounded-[24px] border border-white/10 hover:border-white/20 bg-white/5 transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer shadow-inner shrink-0">
                {imageUri ? (
                  <img src={imageUri} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="pointer-events-none flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-slate-300 group-hover:scale-105 transition-transform group-hover:text-white">
                      <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <p className="font-semibold text-slate-300">Click to upload photo</p>
                    <p className="text-xs text-[var(--color-accent)] mt-1.5 font-semibold tracking-wider uppercase">Select up to 5 images (Max 5)</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">JPEG, PNG • Max 10MB each</p>
                  </div>
                )}
                <input 
                  type="file" 
                  id="file-upload-input"
                  accept="image/*" 
                  multiple
                  onChange={handleImageUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
              </div>

              {images.length > 0 && (
                <div className="mt-4 w-full">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-white/10 group cursor-pointer" onClick={() => {
                        setRawImageUri(img.uri);
                        setCroppingImageIndex(idx);
                        setShowCropper(true);
                      }}>
                        <img src={img.uri} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setImages(images.filter((_, i) => i !== idx)); }} className="absolute -top-1 -right-1 bg-rose-500 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"><X className="w-3 h-3 text-white" /></button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <div className="relative w-16 h-16 shrink-0 rounded-lg border border-white/10 border-dashed flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                      <label className="flex items-center gap-2 text-sm font-medium text-white mb-2 cursor-pointer">
                        <input type="checkbox" checked={applyGlobalTitle} onChange={(e) => setApplyGlobalTitle(e.target.checked)} className="accent-[var(--color-accent)] cursor-pointer" />
                        Apply one title to all images
                      </label>
                      {applyGlobalTitle ? (
                        <input type="text" placeholder="Title for all images..." value={globalImageTitle} onChange={e => setGlobalImageTitle(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                      ) : (
                        <div className="space-y-2 mt-2 max-h-32 overflow-y-auto pr-2">
                          {images.map((img, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <img src={img.uri} className="w-8 h-8 rounded border border-white/10 object-cover" />
                              <input type="text" placeholder={`Title for image ${idx + 1}`} value={img.title} onChange={e => {
                                const newImgs = [...images];
                                newImgs[idx].title = e.target.value;
                                setImages(newImgs);
                              }} className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-1 gap-3 mt-4 w-full shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                        setRawImageUri(images[0].uri);
                        setCroppingImageIndex(0);
                        setShowCropper(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                    Crop the first image
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: EVENT INFO */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-center max-w-lg mx-auto w-full flex-1">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Memory Details</h3>
                <p className="text-[var(--color-secondary)]">Where and when did this happen?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Title <span className="text-rose-400">*</span></label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer in Kyoto" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all font-serif text-xl placeholder-slate-600 text-white outline-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all text-white outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Japan" className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all text-white outline-none text-sm" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Folder className="w-3.5 h-3.5" /> Collection</label>
                  <input 
                     list="collections" 
                     value={collectionName} 
                     onChange={(e) => setCollectionName(e.target.value)} 
                     placeholder="e.g. Travel, Family, School Life" 
                     className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all text-white outline-none text-sm placeholder-slate-600" 
                  />
                  <datalist id="collections">
                    {existingCollections.map(c => <option key={c} value={c} />)}
                    <option value="School Life" />
                    <option value="Family" />
                    <option value="Travel" />
                    <option value="Personal Growth" />
                  </datalist>
                </div>
                
                <div className="border border-white/10 rounded-xl p-5 bg-black/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isTimeCapsule ? 'bg-[var(--color-accent)] text-black' : 'bg-white/10 text-slate-400'}`}>
                        {isTimeCapsule ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">Time Capsule</h4>
                        <p className="text-xs text-[var(--color-secondary)] leading-tight">Lock this memory until a future date.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={isTimeCapsule} onChange={e => setIsTimeCapsule(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                    </label>
                  </div>
                  
                  <AnimatePresence>
                    {isTimeCapsule && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-4 border-t border-white/10 mt-4">
                           <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Unlock Date & Time <span className="text-rose-400">*</span></label>
                           <input type="datetime-local" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} className="w-full px-5 py-3.5 bg-white/5 border border-[var(--color-accent)]/50 rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all text-[var(--color-accent)] font-medium outline-none text-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: STORY */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-start pt-4 max-w-2xl mx-auto w-full flex-1 gap-6 overflow-y-auto min-h-0 pb-10">
              <div className="text-center mb-2 shrink-0">
                <h3 className="text-2xl font-bold mb-2">The Narrative</h3>
                <p className="text-[var(--color-secondary)]">Write the story behind this memory.</p>
              </div>

              <div className="flex-1 min-h-[220px] flex flex-col">
                 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Main Story</label>
                 <textarea 
                   value={story} 
                   onChange={(e) => setStory(e.target.value)} 
                   placeholder="Describe the feeling, the people, the atmosphere..." 
                   className="w-full h-full min-h-[200px] px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]/50 transition-all resize-none font-serif text-lg leading-relaxed placeholder-slate-600 text-white outline-none flex-1 shadow-inner"
                 />
              </div>

              <div className="flex flex-col shrink-0">
                 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Why it matters <span className="text-[10px] text-slate-500 font-normal lowercase">(Optional)</span></label>
                 <textarea 
                   value={specialDetail} 
                   onChange={(e) => setSpecialDetail(e.target.value)} 
                   placeholder="A specific detail, a funny moment, or a hidden gem..." 
                   className="w-full h-28 px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]/50 transition-all resize-none text-sm leading-relaxed placeholder-slate-600 text-slate-300 outline-none shadow-inner"
                 />
              </div>
            </motion.div>
          )}

          {/* STEP 4: THEMING PRESET */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-center max-w-4xl mx-auto w-full flex-1">
              <div className="text-center mb-6 shrink-0 px-4">
                <h3 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-3 tracking-tight">Architectural Theme</h3>
                <p className="text-[var(--color-secondary)]">Choose a material finish for your memory ticket.</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-4 pb-6">
                {Object.entries(LUXURY_THEMES).map(([id, pt]) => (
                  <button
                    key={id}
                    onClick={() => setThemePreset(id)}
                    className={`relative p-4 sm:p-5 rounded-2xl sm:rounded-[24px] border-2 text-left transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group
                      ${themePreset === id 
                        ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 shadow-[0_10px_30px_-10px_rgba(212,175,55,0.2)] scale-[1.02]' 
                        : 'border-white/10 hover:border-white/30 hover:bg-black/60 bg-black/40 hover:scale-[1.01]'
                      }`}
                  >
                    {/* Visual Preview Badge */}
                    <div className={`w-full aspect-[4/3] rounded-xl sm:rounded-2xl border shadow-[0_5px_15px_rgba(0,0,0,0.5)] mb-4 shrink-0 transition-all duration-300 ${pt.previewBg} ${pt.previewBorder} flex flex-col items-center justify-center p-3 gap-1.5 overflow-hidden ${themePreset === id ? 'scale-105 shadow-md border-[var(--color-accent)]' : 'group-hover:scale-103'}`}>
                       {/* Static abstract layout resembling a mini digital ticket stub */}
                       <div className={`w-10 h-6 border rounded opacity-30 flex flex-col justify-between p-1 border-current ${pt.previewText}`}>
                         <div className={`h-0.5 w-3 rounded-full bg-current`} />
                         <div className="border-t border-dashed w-full my-0.5 opacity-50 border-current" />
                         <div className="h-0.5 w-5 rounded-full self-end bg-current" />
                       </div>
                       <div className={`h-1.5 w-1/2 rounded-full opacity-60 bg-current ${pt.previewText}`} />
                       <div className={`h-1 w-1/3 rounded-full opacity-40 bg-current ${pt.previewText}`} />
                    </div>

                    <div className="flex-1 min-w-0 w-full text-center px-1">
                      <h4 className={`font-serif text-[15px] sm:text-lg mb-1 tracking-tight transition-colors ${themePreset === id ? 'text-[var(--color-accent)]' : 'text-slate-200 group-hover:text-white'}`}>
                        {pt.name}
                      </h4>
                      <p className="text-[12px] sm:text-sm text-[var(--color-secondary)] font-medium leading-snug line-clamp-2 max-w-[180px] mx-auto">{pt.desc}</p>
                    </div>

                    {themePreset === id && (
                      <div className="absolute top-3 right-3 bg-[var(--color-accent)] text-amber-950 rounded-full p-1.5 shadow-lg animate-in zoom-in spin-in-12 duration-300">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: PREVIEW */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full w-full max-w-lg mx-auto py-2 flex flex-col items-center flex-1">
              <div className="text-center mb-6 shrink-0">
                <h3 className="text-2xl font-bold mb-1">Ticket Customization</h3>
                <p className="text-[var(--color-secondary)]">Personalize your premium ticket.</p>
              </div>

              <div className="flex-1 w-full flex items-center justify-center p-4 min-h-0">
                 <TicketStub memory={{ id: 'preview', title, location, date, story, imageUri, isFavorite: false, themePreset, backgroundColor, titleColor, storyColor } as any} bgClass="bg-[var(--color-surface)]" className="h-full" />
              </div>

              <div className="w-full shrink-0 mt-6 space-y-4">
                  <div className="text-center p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 shadow-sm">
                    <p className="text-sm font-medium tracking-wide" style={{ color: 'var(--color-accent)' }}>
                      Premium aesthetics applied.
                    </p>
                  </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Wizard Footer */}
      <div className="p-6 sm:p-10 border-t border-[var(--color-border)] bg-transparent flex items-center justify-between mt-auto">
        <button 
          onClick={prevStep}
          disabled={step === 1 || isSaving}
          className={`flex items-center gap-1.5 px-4 sm:px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'
          }`}
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        {step < 5 ? (
          <button 
            onClick={nextStep}
            className="flex items-center gap-2 px-6 sm:px-10 py-3.5 bg-white text-black hover:bg-slate-200 rounded-xl text-[15px] font-bold transition-all hover:scale-105 flex-shrink-0 cursor-pointer shadow-lg"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 sm:px-12 py-3.5 bg-white hover:bg-slate-200 text-black rounded-xl text-[15px] font-bold transition-all hover:scale-105 flex-shrink-0 cursor-pointer disabled:opacity-70 disabled:hover:scale-100 shadow-lg"
          >
            {isSaving ? 'Processing...' : (
              <>
                <Check className="w-5 h-5 stroke-[3]" /> Save Memory
              </>
            )}
          </button>
        )}
      </div>

      {/* Image Cropping Modal Overlay */}
      {showCropper && rawImageUri && (
        <ImageCropper
          imageSrc={rawImageUri}
          onCropComplete={(croppedImgBase64) => {
            setImages(prev => {
              const next = [...prev];
              if (next[croppingImageIndex]) {
                next[croppingImageIndex].uri = croppedImgBase64;
              }
              return next;
            });
            setShowCropper(false);
          }}
          onClose={() => setShowCropper(false)}
        />
      )}

    </div>
  );
}

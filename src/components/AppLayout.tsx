import React, { useState, useEffect, Suspense, lazy } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Memory } from '../types';
import { scheduleCapsuleNotifications } from '../utils/NotificationManager';

import AuthPage from '../views/AuthPage';
import WelcomePage from '../views/WelcomePage';
import Navigation from './Navigation';
import { motion, AnimatePresence } from 'motion/react';

const Dashboard = lazy(() => import('../views/Dashboard'));
const CreateMemory = lazy(() => import('../views/CreateMemory'));
const Gallery = lazy(() => import('../views/Gallery'));
const MemoryDetail = lazy(() => import('../views/MemoryDetail'));
const Profile = lazy(() => import('../views/Profile'));
const VaultPage = lazy(() => import('../views/VaultPage'));
const PrivacyPolicy = lazy(() => import('../views/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../views/TermsOfService'));

export type CurrentView = 'welcome' | 'auth' | 'dashboard' | 'create' | 'gallery' | 'detail' | 'profile' | 'vault' | 'privacy' | 'terms';

export default function AppLayout() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('memopass_cached_user');
      if (cached) return JSON.parse(cached) as User;
    } catch(e) {}
    return null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(() => {
    try {
      return !localStorage.getItem('memopass_cached_user');
    } catch(e) {
      return true;
    }
  });
  const [currentView, setCurrentView] = useState<CurrentView>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('memoryId')) return 'detail';
      const pathName = window.location.pathname.replace(/^\/+/, '');
      const hash = window.location.hash.replace('#', '');
      if (pathName === 'privacy' || hash === 'privacy') return 'privacy';
      if (pathName === 'terms' || hash === 'terms') return 'terms';
      
      const validViews = ['dashboard', 'create', 'gallery', 'detail', 'profile', 'vault', 'auth'];
      if (validViews.includes(pathName)) return pathName as CurrentView;
      if (validViews.includes(hash)) return hash as CurrentView;
      
      if (localStorage.getItem('memopass_cached_user')) return 'dashboard';
    } catch(e) {}
    return 'welcome';
  });
  const [memories, setMemories] = useState<Memory[]>(() => {
    try {
      const cached = localStorage.getItem('memopass_cached_memories');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [];
  });
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Authentication Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const minimalUser = { uid: firebaseUser.uid, displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL, email: firebaseUser.email };
          localStorage.setItem('memopass_cached_user', JSON.stringify(minimalUser));
        } catch(e) {}
      } else {
        setUser(null);
        try {
          localStorage.removeItem('memopass_cached_user');
        } catch(e) {}
      }
      
      // Let's decide routing on load
      if (firebaseUser) {
        setIsAuthLoading(false);
        setCurrentView(prev => (prev === 'auth' || prev === 'welcome') ? 'dashboard' : prev);
      } else {
        // If there's a memoryId in parameters, allow them to view it even without signing in!
        const params = new URLSearchParams(window.location.search);
        const pathName = window.location.pathname.replace(/^\/+/, '');
        const hash = window.location.hash.replace('#', '');
        
        if (params.get('memoryId')) {
          setCurrentView('detail');
        } else if (pathName === 'privacy' || hash === 'privacy') {
          setCurrentView('privacy');
        } else if (pathName === 'terms' || hash === 'terms') {
          setCurrentView('terms');
        } else {
          setCurrentView('welcome');
        }
        setIsAuthLoading(false);
      }
    }); // fixed line
    return () => unsubscribe();
  }, []);

  // Load Shared Memory via QR Link if query parameter exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedMemoryId = params.get('memoryId');
    if (sharedMemoryId) {
      const fetchSharedMemory = async () => {
        try {
          setIsAuthLoading(true);
          const docRef = doc(db, 'memories', sharedMemoryId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const d = docSnap.data();
            const sharedMem: Memory = {
              id: docSnap.id,
              userId: d.userId,
              title: d.title || 'Untitled Memory',
              location: d.location || '',
              date: d.date || '',
              story: d.story || '',
              specialDetail: d.specialDetail || '',
              imageUri: d.imageUri || null,
              createdAt: d.createdAt ? (d.createdAt.seconds ? new Date(d.createdAt.seconds * 1000).toISOString() : d.createdAt) : '',
              isFavorite: !!d.isFavorite,
              images: d.images,
              collectionName: d.collectionName,
              isTimeCapsule: !!d.isTimeCapsule,
              unlockDate: d.unlockDate,
              aiSummary: d.aiSummary,
              backgroundColor: d.backgroundColor,
              titleColor: d.titleColor,
              storyColor: d.storyColor,
              themePreset: d.themePreset,
              creatorName: d.creatorName,
              creatorPhotoURL: d.creatorPhotoURL,
              originalCreatorId: d.originalCreatorId,
            };
            setSelectedMemory(sharedMem);
            setCurrentView('detail');
          } else {
            console.warn("Shared memory link contains an invalid or non-existent document ID.");
          }
        } catch (err) {
          console.error("Failed to parse and pull shared memory ticket details:", err);
        } finally {
          setIsAuthLoading(false);
        }
      };
      fetchSharedMemory();
    }
  }, []);

  // Load Memories
  useEffect(() => {
    if (!user) {
      setMemories([]);
      return;
    }
    const q = query(collection(db, 'memories'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Memory[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: d.userId,
          title: d.title,
          location: d.location,
          date: d.date,
          story: d.story,
          specialDetail: d.specialDetail,
          imageUri: d.imageUri,
          images: d.images,
          createdAt: d.createdAt ? (d.createdAt.seconds ? new Date(d.createdAt.seconds * 1000).toISOString() : d.createdAt) : '',
          isFavorite: !!d.isFavorite,
          collectionName: d.collectionName,
          isTimeCapsule: !!d.isTimeCapsule,
          unlockDate: d.unlockDate,
          aiSummary: d.aiSummary,
          backgroundColor: d.backgroundColor,
          titleColor: d.titleColor,
          storyColor: d.storyColor,
          themePreset: d.themePreset,
          creatorName: d.creatorName,
          creatorPhotoURL: d.creatorPhotoURL,
          originalCreatorId: d.originalCreatorId,
        });
      });
      list.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA; // Newest first
      });
      setMemories(list);
      
      list.forEach(m => {
        if (m.isTimeCapsule && m.unlockDate) {
          scheduleCapsuleNotifications(m.id, m.unlockDate, m.title);
        }
      });
      
      try {
        localStorage.setItem('memopass_cached_memories', JSON.stringify(list));
      } catch(e) {}
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.view) {
        setCurrentView(state.view);
      } else {
        setCurrentView(user ? 'dashboard' : 'welcome');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-8"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute w-24 h-24 border border-zinc-800 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="w-16 h-16 rounded-full border border-zinc-800 border-t-zinc-400 animate-spin duration-1000"></div>
            <img src="/memopass-icon.png" alt="MemoPass" className="absolute w-8 h-8 object-contain opacity-80" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs tracking-[0.3em] font-medium text-zinc-500 uppercase">MemoPass</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleNavigate = (view: CurrentView, memory?: Memory) => {
    if (!user && view !== 'welcome' && view !== 'auth' && view !== 'detail' && view !== 'privacy' && view !== 'terms') return;
    
    if (memory) {
      setSelectedMemory(memory);
    } else if (view !== 'detail') {
      setSelectedMemory(null);
    }

    if (currentView !== view) {
      let path = '/';
      if (view !== 'welcome') {
        path = `/${view}`;
      }
      
      const search = window.location.search;
      window.history.pushState({ view }, "", `${path}${search}`);
      setCurrentView(view);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-primary)] font-sans antialiased flex flex-col md:flex-row">
      {/* Navigation Layer */}
      {user && currentView !== 'welcome' && currentView !== 'auth' && (
        <Navigation 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          user={user} 
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-[100dvh] overflow-y-auto pb-[100px] md:pb-0">
        <Suspense fallback={
          <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-8">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 border border-zinc-800 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="w-16 h-16 rounded-full border border-zinc-800 border-t-zinc-400 animate-spin duration-1000"></div>
                <img src="/memopass-icon.png" alt="MemoPass" className="absolute w-8 h-8 object-contain opacity-80" />
              </div>
            </div>
          </div>
        }>
          <AnimatePresence mode="wait">
            {!isAuthLoading && currentView === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="h-full">
                <WelcomePage onLogin={() => handleNavigate('auth')} onNavigate={handleNavigate} />
              </motion.div>
            )}
            {currentView === 'auth' && (
              <motion.div key="auth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                <AuthPage onLogin={() => handleNavigate('dashboard')} onBack={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    handleNavigate('welcome');
                  }
                }} />
              </motion.div>
            )}
            {currentView === 'dashboard' && user && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                <Dashboard user={user} memories={memories} onNavigate={handleNavigate} />
              </motion.div>
            )}
            {currentView === 'create' && user && (
              <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                <CreateMemory onComplete={() => handleNavigate('gallery')} initialMemory={selectedMemory} />
              </motion.div>
            )}
            {currentView === 'gallery' && user && (
              <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                <Gallery memories={memories} onNavigate={handleNavigate} />
              </motion.div>
            )}
            {currentView === 'detail' && selectedMemory && (
              <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                <MemoryDetail 
                  memory={selectedMemory} 
                  isOwner={!!user && selectedMemory.userId === user.uid}
                  onCreateAccount={() => handleNavigate('auth')}
                  onBack={() => {
                    if (window.history.length > 1) {
                      window.history.back();
                    } else if (user) {
                      handleNavigate('gallery');
                    } else {
                      handleNavigate('auth');
                    }
                  }} 
                  onEdit={(m) => handleNavigate('create', m)} 
                />
              </motion.div>
            )}
            {currentView === 'vault' && user && (
              <motion.div key="vault" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                  <VaultPage 
                    user={user}
                    memories={memories}
                    onClose={() => handleNavigate('dashboard')} 
                    onMemoryFound={(memory) => {
                      setSelectedMemory(memory);
                      setCurrentView('detail');
                    }} 
                  />
              </motion.div>
            )}
            {currentView === 'profile' && user && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                <Profile user={user} memories={memories} onLogout={() => auth.signOut()} onNavigate={handleNavigate} />
              </motion.div>
            )}
            {currentView === 'privacy' && (
              <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                <PrivacyPolicy onBack={() => {
                  window.history.pushState({}, '', '/');
                  handleNavigate(user ? 'dashboard' : 'welcome');
                }} />
              </motion.div>
            )}
            {currentView === 'terms' && (
              <motion.div key="terms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                <TermsOfService onBack={() => {
                  window.history.pushState({}, '', '/');
                  handleNavigate(user ? 'dashboard' : 'welcome');
                }} />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}

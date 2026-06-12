import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface WelcomePageProps {
  onLogin: () => void;
  onNavigate?: (view: any) => void;
}

export default function WelcomePage({ onLogin, onNavigate }: WelcomePageProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black overflow-hidden font-sans text-white w-full">
      {/* Background Decor Elements */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 400 600" className="w-[120vw] max-w-[800px] h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="360" height="560" rx="32" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
          <path d="M 20 150 L 380 150" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
          <circle cx="20" cy="150" r="16" fill="black" stroke="currentColor" strokeWidth="2" />
          <circle cx="380" cy="150" r="16" fill="black" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 w-full max-w-2xl text-center">
        {/* Logo and Brand */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-12 flex flex-col items-center gap-4"
        >
          <img src="/memopass-logo.png" alt="MemoPass Logo" className="h-36 md:h-44 lg:h-56 w-auto object-contain drop-shadow-md" />
        </motion.div>

        {/* Text Area */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-wide font-light leading-tight">
             Every Memory<br />Deserves a Pass
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-sm font-light leading-relaxed">
            Turn meaningful moments into beautiful Memory Tickets that can be preserved forever.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="mt-14 flex flex-col items-center gap-5"
        >
          <button 
            onClick={onLogin}
            className="group relative px-10 py-4 bg-white text-black text-sm font-semibold tracking-wider uppercase rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          </button>
          
          <button 
            onClick={() => setShowModal(true)}
            className="text-xs tracking-widest text-zinc-500 uppercase font-medium hover:text-white transition-colors duration-300"
          >
            Learn More
          </button>
        </motion.div>
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-6 w-full flex justify-center gap-6 z-20">
        <a 
          href="/privacy"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/privacy');
            onNavigate && onNavigate('privacy');
          }}
          className="text-[10px] sm:text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest"
        >
          Privacy Policy
        </a>
        <a 
          href="/terms"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/terms');
            onNavigate && onNavigate('terms');
          }}
          className="text-[10px] sm:text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest"
        >
          Terms of Service
        </a>
      </div>

      {/* Learn More Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,_rgba(39,39,42,1)_0%,_transparent_60%)] opacity-20 pointer-events-none transform-gpu -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10">
                <img src="/memopass-icon.png" alt="MemoPass Icon" className="h-8 w-auto mb-8 opacity-80" />
                
                <h3 className="text-xl font-serif text-white mb-6">Digital Archives, Reimagined.</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm text-zinc-300 font-semibold mb-2">Memory Tickets</h4>
                    <p className="text-sm text-zinc-500 font-light leading-relaxed">
                      Capture locations, dates, and photographic artifacts inside highly structured, beautiful digital ticket stubs.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-zinc-300 font-semibold mb-2">Time Capsules</h4>
                    <p className="text-sm text-zinc-500 font-light leading-relaxed">
                      Lock your most precious stories away until a future date. Perfect for letters to your future self.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-zinc-300 font-semibold mb-2">Collections</h4>
                    <p className="text-sm text-zinc-500 font-light leading-relaxed">
                      Group your digital passes into meaningful collections—road trips, concert tours, or chapters of life.
                    </p>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-zinc-900">
                  <button 
                    onClick={() => {
                      setShowModal(false);
                      onLogin();
                    }}
                    className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs tracking-wider uppercase font-medium rounded-xl transition-colors duration-300"
                  >
                    Begin Your Archive
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

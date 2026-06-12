import React, { useState } from 'react';
import { Memory } from '../types';
import { CurrentView } from '../components/AppLayout';
import { Search, Heart, LayoutGrid, Clock, Folder, Lock } from 'lucide-react';
import TicketStub from '../components/TicketStub';

interface GalleryProps {
  memories: Memory[];
  onNavigate: (view: CurrentView, memory?: Memory) => void;
}

type TabType = 'timeline' | 'collections' | 'capsules';

export default function Gallery({ memories, onNavigate }: GalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const filteredMemories = React.useMemo(() => {
    return memories.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (m.location && m.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFav = filterFavorites ? m.isFavorite : true;
      const matchesCol = selectedCollection ? m.collectionName === selectedCollection : true;
      return matchesSearch && matchesFav && matchesCol;
    });
  }, [memories, searchTerm, filterFavorites, selectedCollection]);

  const groupedMemories = React.useMemo(() => {
    const groupsMap = new Map<string, { title: string, dateValue: number, items: Memory[] }>();
    
    filteredMemories.forEach(memory => {
      let groupTitle = 'Unknown Date';
      let dateValue = 0;
      
      if (memory.date) {
        const dateObj = new Date(memory.date);
        if (!isNaN(dateObj.getTime())) {
          // Month Name Year (e.g., "June 2026")
          groupTitle = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
          // Use start of month for sorting
          dateValue = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1).getTime();
        }
      }
      
      if (!groupsMap.has(groupTitle)) {
        groupsMap.set(groupTitle, { title: groupTitle, dateValue, items: [] });
      }
      groupsMap.get(groupTitle)!.items.push(memory);
    });

    const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => b.dateValue - a.dateValue);
    
    // Sort items within each group by date descending
    sortedGroups.forEach(group => {
      group.items.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
    });

    return sortedGroups;
  }, [filteredMemories]);

  // Compute stats for collections
  const collections = React.useMemo(() => {
    const map = new Map<string, { name: string, count: number, latestImage: string | null }>();
    memories.filter(m => m.collectionName).forEach(m => {
      const name = m.collectionName!;
      if (!map.has(name)) map.set(name, { name, count: 0, latestImage: null });
      const c = map.get(name)!;
      c.count++;
      if (m.imageUri && !c.latestImage) c.latestImage = m.imageUri;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [memories]);

  const capsules = React.useMemo(() => {
    const now = new Date();
    return memories.filter(m => m.isTimeCapsule).sort((a, b) => {
      const aDate = a.unlockDate ? new Date(a.unlockDate).getTime() : 0;
      const bDate = b.unlockDate ? new Date(b.unlockDate).getTime() : 0;
      return aDate - bDate;
    });
  }, [memories]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 flex flex-col h-full overflow-y-auto pb-32">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 max-w-5xl mx-auto w-full">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight mb-2 text-white">Your Collection</h1>
          <p className="text-[var(--color-secondary)] text-sm tracking-wide">
            All your captured moments, organized.
          </p>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="flex w-full md:w-auto px-1 py-1 bg-white/5 border border-white/10 rounded-full">
             <button onClick={() => { setActiveTab('timeline'); setSelectedCollection(null); }} className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap ${activeTab === 'timeline' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}>
                <LayoutGrid className="w-3.5 h-3.5" /> Timeline
             </button>
             <button onClick={() => { setActiveTab('collections'); setSelectedCollection(null); }} className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap ${activeTab === 'collections' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Folder className="w-3.5 h-3.5" /> Albums
             </button>
             <button onClick={() => { setActiveTab('capsules'); setSelectedCollection(null); }} className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap ${activeTab === 'capsules' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Lock className="w-3.5 h-3.5" /> Capsules
             </button>
          </div>
        </div>
      </div>
      
      {/* Sub-search functionality */}
      {activeTab === 'timeline' && !selectedCollection && (
        <div className="flex items-center gap-3 w-full max-w-5xl mx-auto mb-10">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-secondary)]" />
            <input 
              type="text" 
              placeholder="Search moments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full focus:outline-none focus:border-[var(--color-accent)] transition-all text-sm shadow-sm text-white placeholder-[var(--color-secondary)]"
            />
          </div>
          <button 
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`p-3 rounded-full border transition-all text-sm font-medium flex items-center justify-center shrink-0 shadow-sm ${
              filterFavorites 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-secondary)] hover:text-white'
            }`}
            title="Toggle Favorites"
          >
            <Heart className={`w-4 h-4 ${filterFavorites ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      )}

      {selectedCollection && (
         <div className="w-full max-w-5xl mx-auto mb-10 flex items-center gap-4">
            <button onClick={() => setSelectedCollection(null)} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-semibold">← Back to Collections</button>
            <h2 className="text-xl font-serif text-white tracking-wide">Album: <span className="text-[var(--color-accent)]">{selectedCollection}</span></h2>
         </div>
      )}

      {/* Grid */}
      {activeTab === 'collections' && !selectedCollection ? (
        <div className="mx-auto w-full max-w-5xl">
          {collections.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-10 text-center">
               <Folder className="w-12 h-12 text-slate-500 mb-4" />
               <h3 className="text-white font-medium text-lg">No Albums</h3>
               <p className="text-slate-400 text-sm mt-1">Organize your memories into collections when you create them.</p>
             </div>
          ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {collections.map(c => (
                  <div key={c.name} onClick={() => setSelectedCollection(c.name)} className="group cursor-pointer aspect-square rounded-2xl relative overflow-hidden bg-black/20 border border-white/5 hover:border-[var(--color-accent)]/50 transition-all">
                     {c.latestImage ? (
                        <img src={c.latestImage} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-80" alt={c.name} />
                     ) : (
                        <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                           <Folder className="w-10 h-10 opacity-20" />
                        </div>
                     )}
                     <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h4 className="text-white font-serif tracking-wide text-lg">{c.name}</h4>
                        <p className="text-white/70 text-xs font-mono">{c.count} Memories</p>
                     </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      ) : activeTab === 'capsules' && !selectedCollection ? (
        <div className="mx-auto w-full max-w-5xl">
          {capsules.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-10 text-center">
               <Lock className="w-12 h-12 text-slate-500 mb-4" />
               <h3 className="text-white font-medium text-lg">No Time Capsules</h3>
               <p className="text-slate-400 text-sm mt-1">Lock memories away for the future.</p>
             </div>
          ) : (
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-4 sm:gap-x-10 items-start">
               {capsules.map((memory) => (
                 <div 
                   key={memory.id}
                   onClick={() => onNavigate('detail', memory)}
                   className="group cursor-pointer hover:scale-105 transition-transform duration-300 transform-gpu will-change-transform flex items-center justify-center p-1"
                 >
                   <TicketStub memory={memory} compact={true} className="w-full" />
                 </div>
               ))}
             </div>
          )}
        </div>
      ) : (
         <>
          {filteredMemories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-[var(--color-surface)] rounded-full flex items-center justify-center mb-6 border border-[var(--color-border)] text-[var(--color-accent)] shadow-lg shadow-black/20">
                <Search className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-xl font-serif font-medium mb-2 text-white">No tickets found</h3>
              <p className="text-[var(--color-secondary)] max-w-sm text-sm">
                {searchTerm || filterFavorites ? 'Try adjusting your search criteria.' : 'Your collection is empty.'}
              </p>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-5xl space-y-12">
              {groupedMemories.map((group) => (
                <div key={group.title} className="w-full">
                  <h2 className="text-xl font-serif font-medium text-white mb-6 border-b border-white/10 pb-2">{group.title}</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-4 sm:gap-x-10 items-start">
                    {group.items.map((memory) => (
                      <div 
                        key={memory.id}
                        onClick={() => onNavigate('detail', memory)}
                        className="group cursor-pointer hover:scale-105 transition-transform duration-300 transform-gpu will-change-transform flex items-center justify-center p-1"
                      >
                        <TicketStub memory={memory} compact={true} className="w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
         </>
      )}

    </div>
  );
}

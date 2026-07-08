import React, { useState, useEffect } from 'react';

// Safe dynamic import for confetti to bypass any local bundler / node_modules issues
let confettiInstance: any = null;
const getConfetti = async () => {
  if (confettiInstance) return confettiInstance;
  try {
    const module = await import('canvas-confetti');
    confettiInstance = module.default || module;
    return confettiInstance;
  } catch (e) {
    console.warn('canvas-confetti is not installed or available:', e);
    return null;
  }
};

const confetti = (options?: any) => {
  getConfetti().then((func) => {
    if (func) func(options);
  });
};

import { 
  collection, 
  onSnapshot, 
  doc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, Owner, Bid, AuctionState } from './types';
import { seedDatabase } from './dbHelper';
import AdminPanel from './components/AdminPanel';
import OwnerDashboard from './components/OwnerDashboard';
import AdminLogin from './components/AdminLogin';
import { Trophy, Users, ShieldAlert, Star, Sparkles, HelpCircle, Search, SlidersHorizontal, EyeOff, RotateCcw } from 'lucide-react';
import { PlayerCard } from './components/CommonUI';
import { motion, AnimatePresence } from 'motion/react';
// Big Static Player Card for Live Bidding
function FlippingCard({ player, owners }: { player: Player, owners: Owner[] }) {
  return (
    <div className="w-full max-w-none relative">
      <PlayerCard player={player} owners={owners} isActive={true} isAuctionScreen={true} />
    </div>
  );
}

// Sparkles / Celebratory Overlay for Player Acquisition has been disabled as requested


// Page level continuous celebration blasts for the Falabella Live Arena view
function PageLevelBlasts({ color }: { color: string }) {
  useEffect(() => {
    // Initial spectacular blast when loaded/active
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: [color, '#ffffff', '#f59e0b', '#ec4899', '#3b82f6']
    });

    // Gentle ongoing celebration bursts every 6.5 seconds
    const interval = setInterval(() => {
      confetti({
        particleCount: 25,
        angle: 60,
        spread: 50,
        origin: { x: 0.05, y: 0.75 },
        colors: [color, '#ffffff', '#f59e0b']
      });
      confetti({
        particleCount: 25,
        angle: 120,
        spread: 50,
        origin: { x: 0.95, y: 0.75 },
        colors: [color, '#ffffff', '#f59e0b']
      });
    }, 6500);

    return () => clearInterval(interval);
  }, [color]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0">
      {/* Radiant ambient glow in owner's team color */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-screen transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 80%)`
        }}
      />
      
      {/* Interactive floating sparkles */}
      {[...Array(15)].map((_, i) => {
        const size = Math.random() * 6 + 4;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = Math.random() * 4 + 4;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}`,
            }}
            animate={{
              y: [0, -35, 0],
              opacity: [0.15, 0.85, 0.15],
              scale: [0.8, 1.3, 0.8]
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

// Simple stable hash function to randomize player display order deterministically (prevents re-render jumps)
const getStableRandomValue = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 100) / 100;
};

export default function App() {
  const [role, setRole] = useState<'USER_SELECTION' | 'ADMIN' | 'OWNER'>('USER_SELECTION');
  const [players, setPlayers] = useState<Player[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  
  // Home page showcase state
  const [showcaseSearch, setShowcaseSearch] = useState('');
  const [showcaseGender, setShowcaseGender] = useState<'ALL' | 'Female' | 'Male'>('ALL');
  const [showcaseStatus, setShowcaseStatus] = useState<'ALL' | 'AVAILABLE' | 'SOLD' | 'UNSOLD'>('ALL');
  const [showcaseTeamFilter, setShowcaseTeamFilter] = useState<string>('ALL');
  const [auctionState, setAuctionState] = useState<AuctionState>({
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0
  });

  // Celebration states
  const [lastSoldPlayer, setLastSoldPlayer] = useState<Player | null>(null);
  const [lastSoldPlayerId, setLastSoldPlayerId] = useState<string | null>(() => {
    return localStorage.getItem('last_sold_player_id');
  });
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);
  const [readingSecondsLeft, setReadingSecondsLeft] = useState<number>(0);
  const prevSoldIdsRef = React.useRef<string[]>([]);
  const isFirstLoadRef = React.useRef<boolean>(true);

  // Local storage/session storage for admin authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('is_admin_authenticated') === 'true';
  });

  // Local storage to persist selected owner ID for owners
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(() => {
    return localStorage.getItem('selected_owner_id');
  });

  const activePlayer = players.find(p => p.id === auctionState.activePlayerId);
  const resolvedLastSoldPlayer = players.find(p => p.id === lastSoldPlayerId) || lastSoldPlayer;

  const handleSelectOwner = (id: string | null) => {
    setSelectedOwnerId(id);
    if (id) {
      localStorage.setItem('selected_owner_id', id);
    } else {
      localStorage.removeItem('selected_owner_id');
    }
  };

  // State initialization status
  const [loading, setLoading] = useState<boolean>(true);
  const [dbEmpty, setDbEmpty] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(false);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    // 1. Players subscription
    const unsubPlayers = onSnapshot(collection(db, 'players'), (snap) => {
      const list: Player[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Player);
      });
      // Sort deterministically randomized using the stable hash function
      setPlayers(list.sort((a, b) => getStableRandomValue(a.id) - getStableRandomValue(b.id)));
      
      if (snap.empty) {
        setDbEmpty(false); // Disable forced seeding UI so players can be freely deleted and manually added/uploaded
      } else {
        setDbEmpty(false);
      }
      setLoading(false);
    }, (err) => {
      console.error('Players listener error:', err);
      setLoading(false);
    });

    // 2. Owners subscription
    const unsubOwners = onSnapshot(collection(db, 'owners'), (snap) => {
      const list: Owner[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Owner);
      });
      // Sort by name
      setOwners(list.sort((a, b) => a.name.localeCompare(b.name)));
    });

    // 3. Auction Status subscription
    const unsubStatus = onSnapshot(doc(db, 'auction', 'status'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AuctionState;
        setAuctionState(data);
        if (data.lastSoldPlayerId !== undefined) {
          setLastSoldPlayerId(data.lastSoldPlayerId);
        }
      }
    });

    // 4. Bids subscription
    const unsubBids = onSnapshot(collection(db, 'bids'), (snap) => {
      const list: Bid[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Bid);
      });
      setBids(list);
    });

    return () => {
      unsubPlayers();
      unsubOwners();
      unsubStatus();
      unsubBids();
    };
  }, []);

  // Monitor players collection for new sales in real-time
  useEffect(() => {
    if (players.length > 0) {
      const soldPlayers = players.filter(p => p.status === 'SOLD' && p.ownerId && p.winningBid);
      
      // Initialize ref on first load so we don't trigger updates for historical sold players
      if (isFirstLoadRef.current) {
        prevSoldIdsRef.current = soldPlayers.map(p => p.id);
        isFirstLoadRef.current = false;
        return;
      }

      const newlySold = soldPlayers.find(p => !prevSoldIdsRef.current.includes(p.id));
      if (newlySold) {
        setLastSoldPlayer(newlySold);
        setLastSoldPlayerId(newlySold.id);
        localStorage.setItem('last_sold_player_id', newlySold.id);
      }

      // Keep synced
      prevSoldIdsRef.current = soldPlayers.map(p => p.id);
    }
  }, [players]);

  // Active player selected trigger for Reading Mode
  useEffect(() => {
    if (activePlayer) {
      setIsReadingMode(true);
      setReadingSecondsLeft(15); // 15 seconds countdown
    } else {
      setIsReadingMode(false);
      setReadingSecondsLeft(0);
    }
  }, [activePlayer?.id]);

  // Countdown timer for Reading Mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isReadingMode && readingSecondsLeft > 0) {
      timer = setTimeout(() => {
        setReadingSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isReadingMode && readingSecondsLeft === 0) {
      setIsReadingMode(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isReadingMode, readingSecondsLeft]);

  const handleInitializeDb = async () => {
    setInitializing(true);
    try {
      await seedDatabase();
      setDbEmpty(false);
    } catch (err) {
      console.error('Failed to initialize Database:', err);
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-fala-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">LOADING BIDDING ARENA...</p>
        </div>
      </div>
    );
  }

  if (dbEmpty) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-[#121212] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-4xl">
            🏟️
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Arena Database Empty</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Before players can be auctioned, we need to seed the default roster of elite office competitors and create standard corporate team profiles.
            </p>
          </div>
          <button
            onClick={handleInitializeDb}
            disabled={initializing}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0a0a0a] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50"
          >
            {initializing ? 'Seeding Arena Data...' : 'Initialize & Seed Database 🚀'}
          </button>
        </div>
      </div>
    );
  }

  // General counts
  const soldCount = players.filter(p => p.status === 'SOLD').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col font-sans selection:bg-fala-blue selection:text-white">
      
      {/* Top Navigation / Status Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/85 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none" role="img" aria-label="arena">🏟️</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm tracking-tight text-white uppercase flex items-center gap-1.5 font-display">
                  FALALIGA AUCTION 4.0
                </h1>
                <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8e9099' }} title="Falabella Silver" />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#e1005a' }} title="Falabella Magenta" />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1b4be0' }} title="Falabella Blue" />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8ac43f' }} title="Falabella Lime" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                <span>Roster Status: {soldCount} / {players.length} Sold</span>
                {activePlayer && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="text-fala-magenta animate-pulse">Bidding: {activePlayer.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* View Role Selectors */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setRole('USER_SELECTION');
                handleSelectOwner(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'USER_SELECTION' 
                  ? 'bg-fala-magenta text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Falabella Live 🔴
            </button>
            <button
              onClick={() => setRole('OWNER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'OWNER' 
                  ? 'bg-fala-blue text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Falabella Owners
            </button>
            <button
              onClick={() => setRole('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'ADMIN' 
                  ? 'bg-fala-green text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Screen
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {role === 'USER_SELECTION' && (
          <div className="space-y-12 animate-fade-in">

            {/* Active Live Bidding Showcase */}
            {activePlayer ? (
              <div className="bg-gradient-to-b from-[#111111] to-[#050505] border-2 border-fala-blue/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-5xl mx-auto">
                <div className="absolute top-0 right-0 w-32 h-32 bg-fala-blue/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-fala-blue/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="w-full">
                  <FlippingCard 
                    player={activePlayer} 
                    owners={owners} 
                  />
                </div>
              </div>
            ) : resolvedLastSoldPlayer ? (
              (() => {
                const winningOwner = owners.find(o => o.id === resolvedLastSoldPlayer.ownerId);
                const teamColor = winningOwner?.color || '#10b981';
                
                return (
                  /* Spectacular Live Sports broadcaster style "RECENTLY ACQUIRED" spotlight card with beautiful ongoing blasts */
                  <div 
                    className="bg-gradient-to-b from-[#111111] to-[#050505] border-2 p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-4xl mx-auto transition-all duration-500"
                    style={{ 
                      borderColor: `${teamColor}44`, 
                      boxShadow: `0 0 40px ${teamColor}20`
                    }}
                  >
                    {winningOwner && <PageLevelBlasts color={teamColor} />}
                    
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${teamColor}10` }} />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${teamColor}10` }} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                      {/* Left Column: Player Card */}
                      <div className="md:col-span-5 flex justify-center pb-6 md:pb-0">
                        <div className="w-full max-w-sm">
                          <PlayerCard player={resolvedLastSoldPlayer} owners={owners} isActive={false} />
                        </div>
                      </div>

                      {/* Right Column: Winning Owner & Team stats */}
                      <div className="md:col-span-7">
                        {(() => {
                          if (!winningOwner) {
                            return (
                              <div className="text-center space-y-4 py-6">
                                <p className="text-slate-400">This player went unsold in the latest round.</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                  <Sparkles className="w-3.5 h-3.5" /> FALABELLA INTEGRATION ARENA
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-8 py-4">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                🏆 RECENT ACQUISITION COMPLETED
                              </div>

                              <div className="space-y-6">
                                {/* Highlight Player */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">DRAFTED PLAYER</span>
                                  <h2 className="text-4xl font-black text-white tracking-tight leading-none uppercase">
                                    {resolvedLastSoldPlayer.name}
                                  </h2>
                                </div>

                                {/* Highlight Team */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">DRAFTED BY TEAM</span>
                                  <h2 className="text-3xl font-black tracking-tight leading-none uppercase" style={{ color: teamColor }}>
                                    {winningOwner.name}
                                  </h2>
                                </div>

                                {/* Highlight Sold Amount */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">SOLD AMOUNT</span>
                                  <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono flex items-center gap-2">
                                    🪙 {(resolvedLastSoldPlayer.winningBid || 0).toLocaleString()} <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">coins</span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Ready for the next bidding cycle...
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : null}

            {/* Showcase & Roster Boards */}
            <div className="border-t border-white/10 pt-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" /> Live Arena Boards
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Real-time status of all corporate competitors and team allocations</p>
                </div>

                <div className="text-xs font-semibold px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-slate-400">
                  Total Pool: <span className="text-slate-200">{players.length} Players</span> | Sold: <span className="text-emerald-400">{players.filter(p => p.status === 'SOLD').length}</span>
                </div>
              </div>

              {/* Advanced Filters Panel */}
              <div className="bg-[#121212] border border-white/10 p-5 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Search bar */}
                  <div className="md:col-span-4 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={showcaseSearch}
                      onChange={(e) => setShowcaseSearch(e.target.value)}
                      placeholder="Search name or sport..."
                      className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-xs focus:outline-none transition-all placeholder:text-slate-500 text-slate-200 font-medium"
                    />
                  </div>

                  {/* Team Filter Dropdown (Satisfies "In users first tab gice options to filter based on teams and display") */}
                  <div className="md:col-span-3">
                    <select
                      value={showcaseTeamFilter}
                      onChange={(e) => setShowcaseTeamFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-xs focus:outline-none transition-all text-slate-300 font-semibold cursor-pointer"
                    >
                      <option value="ALL">Show All Teams Grid</option>
                      <option value="ALL_PLAYERS">Show Unsold Players List</option>
                      {owners.map(owner => (
                        <option key={owner.id} value={owner.id}>
                          Roster: {owner.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Gender Filter */}
                  <div className="md:col-span-2 flex bg-black/40 border border-white/10 p-1 rounded-xl">
                    <button
                      onClick={() => setShowcaseGender('ALL')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        showcaseGender === 'ALL' ? 'bg-amber-500 text-[#0a0a0a]' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setShowcaseGender('Female')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        showcaseGender === 'Female' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      👩 Girls
                    </button>
                    <button
                      onClick={() => setShowcaseGender('Male')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        showcaseGender === 'Male' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      👨 Boys
                    </button>
                  </div>

                  {/* Status Filter */}
                  <div className="md:col-span-3 flex bg-black/40 border border-white/10 p-1 rounded-xl">
                    <button
                      onClick={() => setShowcaseStatus('ALL')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        showcaseStatus === 'ALL' ? 'bg-amber-500 text-[#0a0a0a]' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setShowcaseStatus('AVAILABLE')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        showcaseStatus === 'AVAILABLE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Ready
                    </button>
                    <button
                      onClick={() => setShowcaseStatus('SOLD')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        showcaseStatus === 'SOLD' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Sold
                    </button>
                  </div>
                </div>
              </div>

              {/* Display Options Logic */}
              {showcaseTeamFilter === 'ALL' ? (
                /* "AFter bidding completed display all the team on screen." / Default Beautiful All Teams Grid */
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                      🏆 TEAM ROSTERS SUMMARY BOARD
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-500">REAL-TIME OVERVIEW</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {owners.map(owner => {
                      const ownerPlayers = players.filter(p => p.ownerId === owner.id && p.status === 'SOLD');
                      const femaleCount = ownerPlayers.filter(p => p.gender === 'Female').length;
                      const spent = ownerPlayers.reduce((sum, p) => sum + (p.winningBid || 0), 0);
                      const budget = 1000000 - spent;

                      const ownerPlayer = players.find(p => p.id === owner.ownerPlayerId);
                      const coOwnerPlayer = players.find(p => p.id === owner.coOwnerPlayerId);
                      
                      return (
                        <div 
                          key={owner.id} 
                          className="bg-[#121212] border border-white/10 rounded-3xl p-6 space-y-5 flex flex-col justify-between shadow-2xl hover:border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                          style={{ borderTop: `6px solid ${owner.color}` }}
                        >
                          {/* Header */}
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-black text-lg text-slate-100 tracking-tight uppercase line-clamp-1 pb-1">{owner.name}</h5>
                              
                              {/* Owners & Co-owners display */}
                              <div className="mt-2.5 space-y-2 border-t border-white/5 pt-2.5 mb-2">
                                <div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                                  <span className="text-sm">👑</span>
                                  <div className="text-left leading-tight truncate">
                                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Team Owner</span>
                                    <span className="text-xs font-black text-slate-200 truncate block">
                                      {ownerPlayer ? ownerPlayer.name : <span className="text-slate-600 italic font-semibold">Not Assigned</span>}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                                  <span className="text-sm">🤝</span>
                                  <div className="text-left leading-tight truncate">
                                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Co-Owner</span>
                                    <span className="text-xs font-black text-slate-300 truncate block">
                                      {coOwnerPlayer ? coOwnerPlayer.name : <span className="text-slate-600 italic font-semibold">Not Assigned</span>}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <div className="bg-white/5 p-2 rounded-xl text-center border border-white/5">
                                <span className="block text-slate-500 text-[8px]">Budget</span>
                                <span className="text-amber-400 text-xs font-black">🪙 {budget.toLocaleString()}</span>
                              </div>
                              <div className="bg-white/5 p-2 rounded-xl text-center border border-white/5">
                                <span className="block text-slate-500 text-[8px]">Girls</span>
                                <span className={`${femaleCount >= 4 ? "text-emerald-400" : "text-pink-400"} text-xs font-black`}>
                                  {femaleCount} / 4
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Players List */}
                          <div className="space-y-1.5 flex-1 py-3 border-t border-b border-white/5 my-2 overflow-y-auto max-h-[220px] scrollbar-thin">
                            {ownerPlayers.length === 0 ? (
                              <p className="text-[11px] text-slate-600 italic text-center py-6">No players won yet</p>
                            ) : (
                              ownerPlayers.map(p => (
                                <div key={p.id} className="flex items-center justify-between text-xs bg-black/30 px-2.5 py-1.5 rounded hover:bg-black/40 transition-colors">
                                  <span className="text-slate-300 font-semibold truncate max-w-[120px]" title={p.name}>
                                    {p.gender === 'Female' ? '👩' : '👨'} {p.name}
                                  </span>
                                  <span className="font-mono font-bold text-amber-500">🪙{p.winningBid?.toLocaleString()}</span>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Footer Info */}
                          <div className="text-[11px] text-slate-500 font-bold flex items-center justify-between">
                            <span>TOTAL PLAYERS:</span>
                            <span className="text-slate-200 bg-white/5 px-2 py-0.5 rounded-full font-mono text-xs">{ownerPlayers.length}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : showcaseTeamFilter === 'ALL_PLAYERS' ? (
                /* Normal pool list filtering */
                (() => {
                  const filtered = players.filter(player => {
                    const matchSearch = player.name.toLowerCase().includes(showcaseSearch.toLowerCase()) || 
                                        player.role.toLowerCase().includes(showcaseSearch.toLowerCase());
                    const matchGender = showcaseGender === 'ALL' || player.gender === showcaseGender;
                    const matchStatus = showcaseStatus === 'ALL' || player.status === showcaseStatus;
                    return matchSearch && matchGender && matchStatus;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl text-xs bg-[#121212]/30">
                        No matching players found in the pool. Try adjusting your search or filters!
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filtered.map(player => (
                        <div key={player.id}>
                          <PlayerCard 
                            player={player} 
                            owners={owners} 
                            isActive={player.id === auctionState.activePlayerId} 
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                /* Selected Single Team Roster View */
                (() => {
                  const targetOwner = owners.find(o => o.id === showcaseTeamFilter);
                  const teamPlayers = players.filter(p => p.ownerId === showcaseTeamFilter && p.status === 'SOLD');
                  
                  if (!targetOwner) return null;

                  const filtered = teamPlayers.filter(player => {
                    const matchSearch = player.name.toLowerCase().includes(showcaseSearch.toLowerCase()) || 
                                        player.role.toLowerCase().includes(showcaseSearch.toLowerCase());
                    const matchGender = showcaseGender === 'ALL' || player.gender === showcaseGender;
                    return matchSearch && matchGender;
                  });

                  return (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#121212] border border-white/10" style={{ borderLeft: `6px solid ${targetOwner.color}` }}>
                        <div>
                          <h4 className="text-lg font-black text-white">{targetOwner.name} Won Roster</h4>
                          <p className="text-xs text-slate-400 mt-1">Showing all acquired corporate athletes and their auction bids</p>
                        </div>
                        <div className="text-xs font-bold text-slate-300">
                          Total Budget Spent: <span className="text-amber-400 font-mono">🪙 {teamPlayers.reduce((sum, p) => sum + (p.winningBid || 0), 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {filtered.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl text-xs bg-[#121212]/30">
                          No players matching current criteria won by this team yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {filtered.map(player => (
                            <div key={player.id}>
                              <PlayerCard 
                                player={player} 
                                owners={owners} 
                                isActive={player.id === auctionState.activePlayerId} 
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

          </div>
        )}

        {role === 'OWNER' && (
          <OwnerDashboard 
            players={players}
            owners={owners}
            bids={bids}
            auctionState={auctionState}
            selectedOwnerId={selectedOwnerId}
            onSelectOwner={handleSelectOwner}
          />
        )}

        {role === 'ADMIN' && (
          !isAdminAuthenticated ? (
            <AdminLogin 
              onSuccess={() => {
                setIsAdminAuthenticated(true);
                sessionStorage.setItem('is_admin_authenticated', 'true');
              }} 
              onCancel={() => setRole('USER_SELECTION')} 
            />
          ) : (
            <AdminPanel 
              players={players}
              owners={owners}
              bids={bids}
              auctionState={auctionState}
              onLogout={() => {
                setIsAdminAuthenticated(false);
                sessionStorage.removeItem('is_admin_authenticated');
                setRole('USER_SELECTION');
              }}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-slate-600 text-xs mt-auto">
        <p>© 2026 FALALIGA AUCTION 4.0. Powered by Google AI Studio & Firebase.</p>
      </footer>
    </div>
  );
}

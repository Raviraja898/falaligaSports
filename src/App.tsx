import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
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

// 3D Flipping Card for Live Bidding
function FlippingCard({ player, owners, isBidding, isReading, onFlipNow }: { player: Player, owners: Owner[], isBidding: boolean, isReading: boolean, onFlipNow?: () => void }) {
  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto h-[500px] relative">
      <motion.div
        className="w-full h-full transform-style-3d relative"
        animate={isReading ? { rotateY: 0 } : (isBidding ? { rotateY: [180, 540] } : { rotateY: 0 })}
        transition={isReading ? { duration: 0.8 } : (isBidding ? { repeat: Infinity, duration: 6, ease: "linear" } : { duration: 0.8 })}
      >
        {/* Front Face of the Card */}
        <div className="absolute inset-0 backface-hidden w-full h-full">
          <PlayerCard player={player} owners={owners} isActive={true} />
        </div>
        
        {/* Back Face of the Card */}
        <div className="absolute inset-0 backface-hidden w-full h-full rotate-y-180 bg-gradient-to-b from-[#181818] to-[#0a0a0a] border-2 border-amber-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] pointer-events-none" />
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner animate-pulse">
            ✨
          </div>
          <h3 className="text-2xl font-black text-amber-400 tracking-wider font-display uppercase">FALALIGA 4.0</h3>
          <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-black">BIDDING ACTIVE</p>
          <div className="mt-8 flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full animate-bounce">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> Place Blind Bid
          </div>
        </div>
      </motion.div>

      {isReading && onFlipNow && (
        <div className="absolute -bottom-14 left-0 right-0 flex justify-center">
          <button
            onClick={onFlipNow}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg cursor-pointer transform hover:scale-105 active:scale-95"
          >
            🔄 Skip & Start Bid
          </button>
        </div>
      )}
    </div>
  );
}

// Sparkles / Celebratory Overlay for Player Acquisition
function WinnerCelebrationOverlay({ player, winningOwner, onClose }: { player: Player, winningOwner: Owner, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0af2] backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Interactive sparkles/bursts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => {
          const size = Math.random() * 8 + 4;
          const left = Math.random() * 100;
          const delay = Math.random() * 4;
          const duration = Math.random() * 3 + 2;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                top: '110%',
                backgroundColor: winningOwner.color || '#f59e0b',
                boxShadow: `0 0 12px ${winningOwner.color || '#f59e0b'}`,
              }}
              animate={{
                top: '-10%',
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, 360],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeOut",
              }}
            />
          );
        })}
      </div>

      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="max-w-xl w-full space-y-8 bg-gradient-to-b from-[#161616] to-[#0c0c0c] border border-white/10 p-8 rounded-3xl shadow-2xl relative"
        style={{ boxShadow: `0 0 50px ${(winningOwner.color || '#f59e0b')}40` }}
      >
        <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: winningOwner.color }} />
        
        <div className="space-y-2">
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block animate-bounce">
            🎉 PLAYER WON 🎉
          </span>
          <h2 className="text-4xl font-black text-white tracking-tight leading-none mt-2">
            ACQUISITION SUCCESS
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 my-6">
          <div 
            className="px-6 py-3.5 rounded-2xl border text-xl font-black uppercase tracking-wider shadow-lg flex items-center gap-3 animate-pulse"
            style={{ 
              backgroundColor: `${winningOwner.color}15`, 
              borderColor: winningOwner.color,
              color: winningOwner.color
            }}
          >
            <Trophy className="w-6 h-6" /> {winningOwner.name}
          </div>
          
          <div className="text-slate-400 text-xs font-black uppercase tracking-widest">
            HAS ACQUIRED
          </div>

          <div className="bg-black/60 p-6 rounded-2xl border border-white/10 w-full flex items-center gap-4 justify-center">
            <div className="text-4xl">{player.photoUrl || '👤'}</div>
            <div className="text-left">
              <h3 className="text-2xl font-black text-white leading-tight">{player.name}</h3>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-1">Winning Bid: 🪙 {player.winningBid?.toLocaleString()} Coins</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-white text-slate-950 font-black rounded-xl text-xs hover:bg-slate-200 transition-all cursor-pointer shadow-md uppercase tracking-widest"
        >
          Resume Live Stream
        </button>
      </motion.div>
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
  const [showCelebration, setShowCelebration] = useState(false);
  const prevSoldIdsRef = React.useRef<string[]>([]);

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
        setDbEmpty(true);
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
        setAuctionState(snap.data() as AuctionState);
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

  // Monitor players collection for new sales in real-time to trigger celebration
  useEffect(() => {
    if (players.length > 0) {
      const soldPlayers = players.filter(p => p.status === 'SOLD' && p.ownerId && p.winningBid);
      
      // Initialize ref on first load so we don't celebrate historical sold players
      if (prevSoldIdsRef.current.length === 0) {
        prevSoldIdsRef.current = soldPlayers.map(p => p.id);
        return;
      }

      const newlySold = soldPlayers.find(p => !prevSoldIdsRef.current.includes(p.id));
      if (newlySold) {
        setLastSoldPlayer(newlySold);
        setLastSoldPlayerId(newlySold.id);
        localStorage.setItem('last_sold_player_id', newlySold.id);
        setShowCelebration(true);
        
        // Trigger beautiful 5-second confetti blast using winning team's color
        const winningOwner = owners.find(o => o.id === newlySold.ownerId);
        const mainColor = winningOwner?.color || '#f59e0b';
        const colors = [mainColor, '#ffffff', '#f59e0b', '#ec4899', '#3b82f6'];
        
        const duration = 5000;
        const animationEnd = Date.now() + duration;
        
        const frame = () => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return;
          
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: colors
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: colors
          });
          
          requestAnimationFrame(frame);
        };
        
        frame();
        
        // Auto dismiss celebration after 5 seconds
        const timer = setTimeout(() => {
          setShowCelebration(false);
        }, 5000);

        // Sync list
        prevSoldIdsRef.current = soldPlayers.map(p => p.id);
        return () => clearTimeout(timer);
      }

      // Keep synced
      prevSoldIdsRef.current = soldPlayers.map(p => p.id);
    }
  }, [players, owners]);

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
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navigation / Status Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/85 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none" role="img" aria-label="arena">🏟️</span>
            <div>
              <h1 className="font-black text-sm tracking-tight text-white uppercase flex items-center gap-2">
                Falaliga 4.0 Auction
                <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500" />
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">
                <span>Roster Status: {soldCount} / {players.length} Sold</span>
                {activePlayer && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="text-amber-500">Bidding: {activePlayer.name}</span>
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
                  ? 'bg-amber-500 text-[#0a0a0a] shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Falabella Live 🔴
            </button>
            <button
              onClick={() => setRole('OWNER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'OWNER' 
                  ? 'bg-amber-500 text-[#0a0a0a] shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Falabella Owners
            </button>
            <button
              onClick={() => setRole('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'ADMIN' 
                  ? 'bg-amber-500 text-[#0a0a0a] shadow-sm' 
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
            {/* Real-time Celebration Overlay */}
            <AnimatePresence>
              {showCelebration && lastSoldPlayer && lastSoldPlayer.ownerId && (
                (() => {
                  const winningOwner = owners.find(o => o.id === lastSoldPlayer.ownerId);
                  return winningOwner ? (
                    <WinnerCelebrationOverlay
                      player={lastSoldPlayer}
                      winningOwner={winningOwner}
                      onClose={() => setShowCelebration(false)}
                    />
                  ) : null;
                })()
              )}
            </AnimatePresence>

            {/* Active Live Bidding Showcase */}
            {activePlayer ? (
              <div className="bg-gradient-to-b from-[#111111] to-[#050505] border-2 border-amber-500/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Flipping Card */}
                  <div className="md:col-span-5 flex justify-center pb-6 md:pb-0">
                    <FlippingCard 
                      player={activePlayer} 
                      owners={owners} 
                      isBidding={auctionState.status === 'BIDDING'} 
                      isReading={isReadingMode}
                      onFlipNow={() => setIsReadingMode(false)}
                    />
                  </div>

                  {/* Right Column: Status & Real-time Info */}
                  <div className="md:col-span-7 space-y-6">
                    {isReadingMode ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> Introducing Competitor
                          </div>
                          <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase">
                            SPOTLIGHT REVEAL
                          </h2>
                          <p className="text-xs text-slate-400">
                            Review the competitor's specialties, ratings, and stats on the left. Bidding activates automatically when the timer expires!
                          </p>
                        </div>

                        {/* Large Visual Progress Countdown */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Time to Read Profile</span>
                            <span className="font-mono text-2xl font-black text-amber-400 animate-pulse">{readingSecondsLeft}s</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                              initial={{ width: '100%' }}
                              animate={{ width: `${(readingSecondsLeft / 15) * 100}%` }}
                              transition={{ duration: 1, ease: 'linear' }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal italic">
                            "The card is kept flat and detailed so viewers on the shared TV can analyze the competitor's stats before secret blind bids are accepted."
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Live Arena Feed
                          </div>
                          <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                            {auctionState.status === 'BIDDING' ? 'BIDDING IN PROGRESS...' : 'BIDS REVEALED!'}
                          </h2>
                          <p className="text-xs text-slate-400">
                            {auctionState.status === 'BIDDING' 
                              ? 'Team owners are placing secret blind bids. Card is spinning continuously!' 
                              : 'Admin has closed bidding. Below are the bids submitted for this competitor.'}
                          </p>
                        </div>

                        {/* Show bids in real time or hidden */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                            <span>Submitted Team Bids</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {bids.filter(b => b.playerId === activePlayer.id).length} / {owners.length} Bids
                            </span>
                          </h3>

                          <div className="space-y-2">
                            {owners.map(owner => {
                              const bid = bids.find(b => b.playerId === activePlayer.id && b.ownerId === owner.id);
                              const isRevealed = auctionState.status === 'REVEALED';
                              
                              return (
                                <div key={owner.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: owner.color }} />
                                    <span className="text-xs font-extrabold text-slate-200">{owner.name}</span>
                                  </div>
                                  <div className="font-mono text-xs font-bold">
                                    {bid ? (
                                      isRevealed ? (
                                        <span className="text-amber-400">🪙 {bid.amount.toLocaleString()}</span>
                                      ) : (
                                        <span className="text-emerald-400 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> BID PLACED
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-slate-600">NO BID</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : resolvedLastSoldPlayer ? (
              /* Spectacular Live Sports broadcaster style "RECENTLY ACQUIRED" spotlight card */
              <div className="bg-gradient-to-b from-[#111111] to-[#050505] border-2 border-emerald-500/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Player Card */}
                  <div className="md:col-span-5 flex justify-center pb-6 md:pb-0">
                    <div className="w-full max-w-sm">
                      <PlayerCard player={resolvedLastSoldPlayer} owners={owners} isActive={false} />
                    </div>
                  </div>

                  {/* Right Column: Winning Owner & Team stats */}
                  <div className="md:col-span-7">
                    {(() => {
                      const winningOwner = owners.find(o => o.id === resolvedLastSoldPlayer.ownerId);
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

                      const ownerPlayers = players.filter(p => p.ownerId === winningOwner.id && p.status === 'SOLD');
                      const squadCount = ownerPlayers.length;
                      const spent = ownerPlayers.reduce((sum, p) => sum + (p.winningBid || 0), 0);
                      const chipsLeft = winningOwner.initialWallet - spent;
                      const maxTeamSize = auctionState.maxTeamSize || 15;
                      const minGirlsCount = auctionState.minGirlsCount || 4;
                      const girlsInTeam = ownerPlayers.filter(p => p.gender === 'Female').length;

                      return (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                              🏆 RECENT ACQUISITION COMPLETED
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase">
                              {winningOwner.name}
                            </h2>
                            <p className="text-xs text-slate-400">
                              Successfully drafted <span className="text-white font-bold">{resolvedLastSoldPlayer.name}</span> for <span className="text-amber-400 font-extrabold">🪙 {(resolvedLastSoldPlayer.winningBid || 0).toLocaleString()}</span> coins!
                            </p>
                          </div>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CHIPS LEFT</p>
                              <p className="text-2xl font-black text-amber-400 font-mono">
                                🪙 {chipsLeft.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SQUAD MEMBERS</p>
                              <p className="text-2xl font-black text-white font-mono">
                                {squadCount} <span className="text-xs text-slate-500">/ {maxTeamSize}</span>
                              </p>
                            </div>
                          </div>

                          {/* Recruitment compliance progress bars */}
                          <div className="space-y-3 bg-black/40 border border-white/5 rounded-2xl p-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SQUAD COMPLIANCE RULES</h3>
                            
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold text-slate-400">
                                <span>Roster Limit</span>
                                <span>{squadCount} / {maxTeamSize} Players</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 transition-all duration-500" 
                                  style={{ width: `${Math.min(100, (squadCount / maxTeamSize) * 100)}%` }} 
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold text-slate-400">
                                <span>Female Competitors</span>
                                <span>{girlsInTeam} / {minGirlsCount} Required</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${girlsInTeam >= minGirlsCount ? 'bg-indigo-500' : 'bg-pink-500'}`} 
                                  style={{ width: `${Math.min(100, (girlsInTeam / minGirlsCount) * 100)}%` }} 
                                />
                              </div>
                            </div>
                          </div>

                          {/* Mini Current Roster */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CURRENT SQUAD</h4>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                              {ownerPlayers.map(p => (
                                <div key={p.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-semibold text-slate-300">
                                  <span className="text-sm">{p.photoUrl || '👤'}</span>
                                  <span>{p.name}</span>
                                </div>
                              ))}
                              {ownerPlayers.length === 0 && (
                                <p className="text-xs text-slate-600 italic">This is their first drafted player!</p>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            Waiting for the next draft round to begin...
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              /* If no active bidding and no previous sale, show a highly polished Welcome / Overview hero */
              <div className="text-center space-y-4 max-w-2xl mx-auto py-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5" /> FALABELLA INTEGRATION ARENA
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
                  Falaliga 4.0 Live Arena
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Welcome to the live public feed for Falaliga 4.0! Watch player cards spin continuously during active bidding, see sparkly blasts when players are won, and track rosters and budgets in real-time below.
                </p>
              </div>
            )}

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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {owners.map(owner => {
                      const ownerPlayers = players.filter(p => p.ownerId === owner.id && p.status === 'SOLD');
                      const femaleCount = ownerPlayers.filter(p => p.gender === 'Female').length;
                      const spent = ownerPlayers.reduce((sum, p) => sum + (p.winningBid || 0), 0);
                      const budget = 1000000 - spent;
                      
                      return (
                        <div 
                          key={owner.id} 
                          className="bg-[#121212] border border-white/10 rounded-2xl p-4 space-y-4 flex flex-col justify-between"
                          style={{ borderTop: `4px solid ${owner.color}` }}
                        >
                          {/* Header */}
                          <div>
                            <h5 className="font-extrabold text-sm text-white tracking-tight line-clamp-1">{owner.name}</h5>
                            <div className="grid grid-cols-2 gap-1.5 mt-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <div className="bg-white/5 p-1 rounded text-center">
                                <span className="block text-slate-500">Budget</span>
                                <span className="text-amber-400">🪙 {budget.toLocaleString()}</span>
                              </div>
                              <div className="bg-white/5 p-1 rounded text-center">
                                <span className="block text-slate-500">Girls</span>
                                <span className={femaleCount >= 4 ? "text-emerald-400" : "text-pink-400"}>
                                  {femaleCount} / 4
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Players List */}
                          <div className="space-y-1.5 flex-1 py-3 border-t border-b border-white/5 my-2 overflow-y-auto max-h-[180px] scrollbar-thin">
                            {ownerPlayers.length === 0 ? (
                              <p className="text-[10px] text-slate-600 italic text-center py-4">No players won yet</p>
                            ) : (
                              ownerPlayers.map(p => (
                                <div key={p.id} className="flex items-center justify-between text-[11px] bg-black/30 px-2 py-1 rounded">
                                  <span className="text-slate-300 font-medium truncate max-w-[90px]" title={p.name}>
                                    {p.gender === 'Female' ? '👩' : '👨'} {p.name}
                                  </span>
                                  <span className="font-mono font-bold text-amber-500/90 text-[10px]">🪙{p.winningBid?.toLocaleString()}</span>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Footer Info */}
                          <div className="text-[10px] text-slate-500 font-bold flex items-center justify-between">
                            <span>TOTAL PLAYERS:</span>
                            <span className="text-slate-300">{ownerPlayers.length}</span>
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
        <p>© 2026 Falabella Falaliga 4.0 Bidding Arena. Powered by Google AI Studio & Firebase.</p>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
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
import { Trophy, Users, ShieldAlert, Star, Sparkles, HelpCircle } from 'lucide-react';

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
  const [auctionState, setAuctionState] = useState<AuctionState>({
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0
  });

  // Local storage/session storage for admin authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('is_admin_authenticated') === 'true';
  });

  // Local storage to persist selected owner ID for owners
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(() => {
    return localStorage.getItem('selected_owner_id');
  });

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
  const activePlayer = players.find(p => p.id === auctionState.activePlayerId);

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
                <span>Roster Draft: {soldCount} / {players.length} Sold</span>
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
              Choose Role
            </button>
            <button
              onClick={() => setRole('OWNER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'OWNER' 
                  ? 'bg-amber-500 text-[#0a0a0a] shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Owner Screen
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
          <div className="max-w-4xl mx-auto py-12 space-y-12">
            
            {/* Visual Hero / Welcome */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" /> FALABELLA INTEGRATION ARENA
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Falaliga 4.0 Player Draft
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Welcome to Falaliga 4.0, the prestigious annual sports and integration games at Falabella! Bringing together our diverse departments, this real-time draft empowers team owners with <strong>🪙 1,000,000 chips (10 lakhs)</strong> to build a competitive roster. Configured to select 15 to 20 players per team, each squad must satisfy the integration mandate of recruiting <strong>at least 4 female players (girls)</strong>.
              </p>
            </div>

            {/* Quick Role Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Owner Role Card */}
              <div className="bg-[#121212] border border-white/10 hover:border-amber-500/40 p-8 rounded-3xl space-y-5 transition-all shadow-md group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-2xl font-bold">
                  💼
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Team Owner Dashboard</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Log in as one of the 5 gaming teams (e.g., Tech Titans, Product Pirates), place blind bids in real-time, view your roster, and track your remaining wallet.
                  </p>
                </div>
                <button
                  onClick={() => setRole('OWNER')}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-slate-900" /> Join as Team Owner
                </button>
              </div>

              {/* Admin Role Card */}
              <div className="bg-[#121212] border border-white/10 hover:border-amber-500/40 p-8 rounded-3xl space-y-5 transition-all shadow-md group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-2xl font-bold">
                  👑
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Admin Control Panel</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Set active players to start bidding, view submitted blind bids, reveal bids when ready, resolve tie-breakers, and manage database resets.
                  </p>
                </div>
                <button
                  onClick={() => setRole('ADMIN')}
                  className="w-full py-3 bg-transparent hover:bg-white/5 text-white font-bold rounded-xl text-xs transition-all border border-white/20 hover:border-white/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Open Host Controls
                </button>
              </div>

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

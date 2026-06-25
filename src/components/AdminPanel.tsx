import React, { useState, useEffect } from 'react';
import { Player, Owner, Bid, AuctionState } from '../types';
import { 
  seedDatabase, 
  setActivePlayer, 
  revealBids, 
  resolveAuction, 
  resolveUnsold, 
  startTieResolution,
  addPlayer,
  addOwner,
  updateAuctionSettings
} from '../dbHelper';
import { PlayerCard, TieBreakerTool } from './CommonUI';
import { 
  Trophy, 
  RefreshCw, 
  Play, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  UserMinus, 
  Users, 
  Layers, 
  Check, 
  Award,
  CircleDot,
  PlusCircle,
  Sparkles,
  LogOut,
  UserPlus,
  ShieldCheck,
  Settings,
  Flame,
  CheckSquare
} from 'lucide-react';

interface AdminPanelProps {
  players: Player[];
  owners: Owner[];
  bids: Bid[];
  auctionState: AuctionState;
  onLogout?: () => void;
}

export default function AdminPanel({ players, owners, bids, auctionState, onLogout }: AdminPanelProps) {
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<'auction' | 'players' | 'rosters' | 'manage'>('auction');

  // Config settings state
  const [configMaxTeamSize, setConfigMaxTeamSize] = useState(auctionState.maxTeamSize || 15);
  const [configMinGirlsCount, setConfigMinGirlsCount] = useState(auctionState.minGirlsCount || 4);
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');

  // Sync config from Firestore
  useEffect(() => {
    if (auctionState.maxTeamSize !== undefined) {
      setConfigMaxTeamSize(auctionState.maxTeamSize);
    }
    if (auctionState.minGirlsCount !== undefined) {
      setConfigMinGirlsCount(auctionState.minGirlsCount);
    }
  }, [auctionState.maxTeamSize, auctionState.minGirlsCount]);

  // Player form state
  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState('');
  const [playerBasePrice, setPlayerBasePrice] = useState(50000);
  const [playerSkillRating, setPlayerSkillRating] = useState(85);
  const [playerEmoji, setPlayerEmoji] = useState('💻');
  const [playerGender, setPlayerGender] = useState<'Male' | 'Female'>('Female');
  const [playerSpeed, setPlayerSpeed] = useState(75);
  const [playerStamina, setPlayerStamina] = useState(75);
  const [playerTeamwork, setPlayerTeamwork] = useState(75);
  const [playerFocus, setPlayerFocus] = useState(75);
  const [playerFunFactor, setPlayerFunFactor] = useState(75);
  const [playerSuccessMsg, setPlayerSuccessMsg] = useState('');

  // Owner form state
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerWallet, setNewOwnerWallet] = useState(1000000);
  const [newOwnerColor, setNewOwnerColor] = useState('#3b82f6');
  const [ownerSuccessMsg, setOwnerSuccessMsg] = useState('');

  // Handle Add Player
  const handleAddPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !playerRole.trim()) return;

    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      name: playerName.trim(),
      role: playerRole.trim(),
      basePrice: Number(playerBasePrice),
      skillRating: Number(playerSkillRating),
      status: 'AVAILABLE',
      photoUrl: playerEmoji,
      gender: playerGender,
      stats: {
        speed: Number(playerSpeed),
        stamina: Number(playerStamina),
        teamwork: Number(playerTeamwork),
        focus: Number(playerFocus),
        funFactor: Number(playerFunFactor)
      }
    };

    try {
      await addPlayer(newPlayer);
      setPlayerSuccessMsg(`Successfully added player ${playerName}!`);
      setPlayerName('');
      setPlayerRole('');
      setPlayerBasePrice(50000);
      setPlayerSkillRating(85);
      setPlayerEmoji('💻');
      setPlayerGender('Female');
      setPlayerSpeed(75);
      setPlayerStamina(75);
      setPlayerTeamwork(75);
      setPlayerFocus(75);
      setPlayerFunFactor(75);
      setTimeout(() => setPlayerSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to add player:', err);
    }
  };

  // Handle Update Settings
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAuctionSettings(Number(configMaxTeamSize), Number(configMinGirlsCount));
      setConfigSuccessMsg('Arena settings updated successfully!');
      setTimeout(() => setConfigSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update arena settings:', err);
    }
  };

  // Handle Add Owner
  const handleAddOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerName.trim()) return;

    // Slugify name
    const slug = newOwnerName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueId = `${slug || 'team'}_${Date.now().toString().slice(-4)}`;

    const newOwner: Owner = {
      id: uniqueId,
      name: newOwnerName.trim(),
      color: newOwnerColor,
      wallet: Number(newOwnerWallet),
      initialWallet: Number(newOwnerWallet)
    };

    try {
      await addOwner(newOwner);
      setOwnerSuccessMsg(`Successfully created team ${newOwnerName}!`);
      setNewOwnerName('');
      setNewOwnerWallet(1000);
      setNewOwnerColor('#3b82f6');
      setTimeout(() => setOwnerSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to add owner:', err);
    }
  };

  // Find active player
  const activePlayer = players.find(p => p.id === auctionState.activePlayerId);

  // Active player bids
  const activeBids = bids.filter(b => b.playerId === auctionState.activePlayerId);

  // Map of who has bid on the active player
  const didBid = (ownerId: string) => activeBids.some(b => b.ownerId === ownerId);

  // Calculate highest bid, winning owner(s), and check for ties
  let highestBidAmount = 0;
  let highestBidders: Bid[] = [];
  let isTie = false;

  if (activeBids.length > 0) {
    highestBidAmount = Math.max(...activeBids.map(b => b.amount));
    highestBidders = activeBids.filter(b => b.amount === highestBidAmount);
    isTie = highestBidders.length > 1;
  }

  // Database Reset handler
  const handleReset = async () => {
    if (window.confirm('Are you absolutely sure you want to RESET the entire game database? This will clear all bids, wallets, and player rosters.')) {
      setResetting(true);
      try {
        await seedDatabase();
      } catch (err) {
        console.error('Error seeding database:', err);
      } finally {
        setResetting(false);
      }
    }
  };

  // Select player to auction
  const handleStartAuction = async (playerId: string) => {
    try {
      await setActivePlayer(playerId);
    } catch (err) {
      console.error('Error starting auction:', err);
    }
  };

  // Reveal Bids
  const handleReveal = async () => {
    try {
      await revealBids();
    } catch (err) {
      console.error('Error revealing bids:', err);
    }
  };

  // Declare player unsold
  const handleUnsold = async () => {
    if (!activePlayer) return;
    try {
      await resolveUnsold(activePlayer.id);
    } catch (err) {
      console.error('Error marking unsold:', err);
    }
  };

  // Award player to winner
  const handleAwardPlayer = async (winnerId: string, winningAmount: number) => {
    if (!activePlayer) return;
    const owner = owners.find(o => o.id === winnerId);
    if (!owner) return;
    
    try {
      await resolveAuction(activePlayer.id, winnerId, winningAmount, owner.wallet);
    } catch (err) {
      console.error('Error resolving auction:', err);
    }
  };

  // Start Sudden Death Re-bid
  const handleStartRebid = async () => {
    if (!activePlayer || highestBidders.length === 0) return;
    const tiedIds = highestBidders.map(b => b.ownerId);
    try {
      await startTieResolution(activePlayer.id, tiedIds, highestBidAmount);
    } catch (err) {
      console.error('Error starting re-bid:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121212] border border-white/10 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              ADMIN CONTROL PANEL
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Host
              </span>
            </h1>
            <p className="text-xs text-slate-400">Control active players, resolve bids, and manage rosters</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-rose-950/40 border border-white/10 hover:border-rose-900 text-slate-300 hover:text-rose-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            Reset Game & Players
          </button>
          
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Lock admin controls and logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Lock Admin
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('auction')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'auction' 
              ? 'border-amber-500 text-amber-500 bg-white/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Auction
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'players' 
              ? 'border-amber-500 text-amber-500 bg-white/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Draft Board ({players.length})
        </button>
        <button
          onClick={() => setActiveTab('rosters')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'rosters' 
              ? 'border-amber-500 text-amber-500 bg-white/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Team Rosters & Budgets
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'manage' 
              ? 'border-amber-500 text-amber-500 bg-white/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Manage Arena
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'auction' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Card status */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <CircleDot className="w-4 h-4 text-amber-500" /> Currently Auctioning
            </h2>
            {activePlayer ? (
              <PlayerCard player={activePlayer} owners={owners} isActive={true} />
            ) : (
              <div className="bg-[#121212]/50 border border-dashed border-white/10 rounded-2xl p-10 text-center text-slate-400">
                <Layers className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold">No player currently under auction</p>
                <p className="text-xs text-slate-500 mt-1">Select a player from the Draft Board tab to start bidding.</p>
                <button
                  onClick={() => setActiveTab('players')}
                  className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Go to Draft Board
                </button>
              </div>
            )}
          </div>

          {/* Real-time Bid Monitor & Controls */}
          <div className="lg:col-span-7 space-y-6">
            {activePlayer && (
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                      Bidding Room
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time tracker of blind bids from team owners
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-amber-500">{activeBids.length} Bids</span>
                  </div>
                </div>

                {/* Submissions List */}
                <div className="space-y-3 mb-6">
                  {owners.map(owner => {
                    const hasBid = didBid(owner.id);
                    const bid = activeBids.find(b => b.ownerId === owner.id);
                    const isTiedAndSelected = auctionState.status === 'TIE_RESOLUTION' && auctionState.tiedOwners?.includes(owner.id);

                    return (
                      <div 
                        key={owner.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          isTiedAndSelected 
                            ? 'bg-amber-950/20 border-amber-500/40' 
                            : 'bg-black/40 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: owner.color }} />
                          <div>
                            <span className="text-xs font-bold text-slate-200">{owner.name}</span>
                            <span className="text-[10px] text-slate-500 block">Wallet: 🪙 {owner.wallet}</span>
                          </div>
                        </div>

                        <div>
                          {auctionState.status === 'BIDDING' && (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                              hasBid ? 'text-amber-500' : 'text-slate-500'
                            }`}>
                              {hasBid ? '✅ Bid Placed' : '⏳ Waiting...'}
                            </span>
                          )}

                          {auctionState.status === 'TIE_RESOLUTION' && (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                              isTiedAndSelected
                                ? hasBid ? 'text-amber-400' : 'text-amber-500/60 animate-pulse'
                                : 'text-slate-500 line-through'
                            }`}>
                              {isTiedAndSelected 
                                ? hasBid ? '⚡ Re-bid Submitted' : '⏳ Tied Re-bidding...' 
                                : 'Excluded from tie-breaker'}
                            </span>
                          )}

                          {(auctionState.status === 'REVEALED' || (auctionState.status === 'TIE_RESOLUTION' && hasBid)) && bid && (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                                🪙 {bid.amount}
                              </span>
                              {highestBidAmount > 0 && bid.amount === highestBidAmount && (
                                <span className="p-1 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                                  Highest
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Operations Panel */}
                <div className="border-t border-white/10 pt-5 space-y-4">
                  {auctionState.status === 'BIDDING' && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleReveal}
                        disabled={activeBids.length === 0}
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-[#0a0a0a] rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-black uppercase"
                      >
                        <Eye className="w-4 h-4 text-[#0a0a0a]" />
                        Reveal Blind Bids ({activeBids.length})
                      </button>
                      <button
                        onClick={handleUnsold}
                        className="py-3 px-4 bg-white/5 hover:bg-rose-950/40 hover:border-rose-900 border border-white/10 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Unsold Pool
                      </button>
                    </div>
                  )}

                  {auctionState.status === 'REVEALED' && (
                    <div className="space-y-4">
                      {activeBids.length === 0 ? (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                          <AlertTriangle className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
                          <h4 className="text-xs font-bold text-rose-300">No Bids Placed!</h4>
                          <p className="text-[11px] text-rose-400/80 mt-0.5">Move this player to the Unsold Pool to auction them later.</p>
                          <button
                            onClick={handleUnsold}
                            className="mt-3 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Mark as Unsold
                          </button>
                        </div>
                      ) : isTie ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-amber-300">Bid Tie Detected!</h4>
                              <p className="text-[11px] text-amber-400/80 mt-0.5">
                                {highestBidders.map(b => b.ownerName).join(' & ')} tied at <strong className="font-mono">🪙 {highestBidAmount} coins</strong>! Choose a strategy to break the tie:
                              </p>
                            </div>
                          </div>

                          {/* Tie breaker selection tools */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Sudden Death */}
                            <button
                              onClick={handleStartRebid}
                              className="p-3 bg-[#161616] hover:bg-[#1f1f1f] border border-white/10 hover:border-amber-500/50 rounded-xl text-left transition-all group cursor-pointer"
                            >
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mb-0.5 group-hover:text-amber-300">
                                Option A
                              </span>
                              <span className="text-xs font-bold text-slate-100 block">Sudden Death Re-bid</span>
                              <span className="text-[10px] text-slate-400 block mt-1">Tied owners enter private 1-minute round starting at 🪙 {highestBidAmount}</span>
                            </button>

                            {/* Coin Toss Selector */}
                            <div className="space-y-3">
                              <TieBreakerTool 
                                tiedOwners={highestBidders.map(b => owners.find(o => o.id === b.ownerId)!).filter(Boolean)} 
                                onWinnerSelected={(winnerId) => handleAwardPlayer(winnerId, highestBidAmount)} 
                              />
                            </div>
                          </div>

                          {/* Option C: Manual Assignment */}
                          <div className="border-t border-white/10 pt-3">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Option B: Manual Award</p>
                            <div className="flex flex-wrap gap-2">
                              {highestBidders.map(bid => (
                                <button
                                  key={bid.ownerId}
                                  onClick={() => handleAwardPlayer(bid.ownerId, highestBidAmount)}
                                  className="px-3 py-1.5 bg-white/5 hover:bg-emerald-950/40 border border-white/10 hover:border-amber-500/50 text-slate-200 hover:text-amber-400 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  Award to {bid.ownerName}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-emerald-300">Clear Bid Winner!</h4>
                              <p className="text-xs text-slate-200 mt-0.5">
                                <strong style={{ color: owners.find(o => o.id === highestBidders[0].ownerId)?.color }}>
                                  {highestBidders[0].ownerName}
                                </strong> wins with a bid of <strong className="font-mono text-amber-400">🪙 {highestBidAmount}</strong>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAwardPlayer(highestBidders[0].ownerId, highestBidAmount)}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] rounded-lg text-xs font-bold transition-all shadow-md whitespace-nowrap cursor-pointer"
                          >
                            Award & Deduct Wallet
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {auctionState.status === 'TIE_RESOLUTION' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-amber-300">Sudden Death Re-bid in Progress!</h4>
                            <p className="text-[11px] text-amber-400/80 mt-0.5">
                              Tied owners are submitting re-bids. Minimum bid amount is <strong>🪙 {auctionState.originalWinningAmount}</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleReveal}
                            disabled={activeBids.length < (auctionState.tiedOwners?.length || 0)}
                            className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-slate-950" />
                            Reveal and Resolve Re-bids ({activeBids.length})
                          </button>
                          <button
                            onClick={() => {
                              // Reset state back to revealed to try another strategy
                              revealBids();
                            }}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Cancel Tie-Breaker
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Draft Board</h2>
              <p className="text-xs text-slate-400">Total available and unsold players ready for auction</p>
            </div>
            
            {/* Legend indicators */}
            <div className="flex gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500/30" /> Available
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-500/30" /> Unsold
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/30" /> Sold
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {players.map(player => {
              const canAuction = player.status === 'AVAILABLE' || player.status === 'UNSOLD';
              return (
                <div key={player.id} className="relative group">
                  <PlayerCard player={player} owners={owners} />
                  
                  {canAuction && !auctionState.activePlayerId && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => handleStartAuction(player.id)}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-slate-950" />
                        Start Auction Bidding
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'rosters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {owners.map(owner => {
              const teamRoster = players.filter(p => p.ownerId === owner.id);
              const totalSpent = teamRoster.reduce((sum, p) => sum + (p.winningBid || 0), 0);
              const girlsCount = teamRoster.filter(p => p.gender === 'Female').length;
              const boysCount = teamRoster.filter(p => p.gender === 'Male').length;
              
              const maxLimit = auctionState.maxTeamSize || 15;
              const minGirls = auctionState.minGirlsCount || 4;
              const hasEnoughGirls = girlsCount >= minGirls;
              const withinSize = teamRoster.length <= maxLimit;

              return (
                <div 
                  key={owner.id} 
                  className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: owner.color }} />
                      <h3 className="font-bold text-slate-100 text-sm truncate">{owner.name}</h3>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 mb-4 bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <div className="flex justify-between">
                        <span>Budget Left:</span>
                        <span className="font-mono text-amber-400 font-bold">🪙 {owner.wallet.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Spent:</span>
                        <span className="font-mono text-slate-400">🪙 {totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Roster Size:</span>
                        <span className={`font-bold ${withinSize ? 'text-slate-200' : 'text-rose-400'}`}>
                          {teamRoster.length} / {maxLimit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Girls Count:</span>
                        <span className={`font-bold ${hasEnoughGirls ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {girlsCount} / {minGirls}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Boys Count:</span>
                        <span className="text-slate-300">{boysCount}</span>
                      </div>
                    </div>

                    {/* Rule indicator badge */}
                    <div className="mb-4">
                      {!hasEnoughGirls ? (
                        <div className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Need {minGirls - girlsCount} more girl(s)
                        </div>
                      ) : teamRoster.length > maxLimit ? (
                        <div className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Over limit (max {maxLimit})
                        </div>
                      ) : teamRoster.length > 0 ? (
                        <div className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Roster Compliant ✅
                        </div>
                      ) : (
                        <div className="px-2.5 py-1.5 bg-slate-500/5 border border-white/5 rounded-lg text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <CircleDot className="w-3.5 h-3.5" /> Empty Squad
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 font-bold">Players Won</h4>
                    {teamRoster.length === 0 ? (
                      <p className="text-[11px] text-slate-600 italic">No players won yet</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {teamRoster.map(player => (
                          <div 
                            key={player.id} 
                            className="flex items-center justify-between p-1.5 bg-black/30 rounded border border-white/5 text-[11px]"
                          >
                            <span className="text-slate-200 truncate pr-2">
                              {player.photoUrl} {player.name.split(' "')[0]} <span className="text-[9px] text-slate-500">({player.gender === 'Female' ? 'F' : 'M'})</span>
                            </span>
                            <span className="font-mono text-emerald-400 font-bold flex-shrink-0">
                              🪙 {player.winningBid?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-8">
          
          {/* Rules Configuration card */}
          <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Falaliga 4.0 Rules & Settings</h2>
                <p className="text-xs text-slate-400">Configure global limits and compliance regulations for the league</p>
              </div>
            </div>

            {configSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {configSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Max Team Size Limit</label>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={configMaxTeamSize}
                  onChange={(e) => setConfigMaxTeamSize(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-sm text-slate-100 font-mono focus:outline-none transition-colors"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Suggested limit: 15 to 20 players</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Min Girls (Female Players) Required</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={configMinGirlsCount}
                  onChange={(e) => setConfigMinGirlsCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-sm text-slate-100 font-mono focus:outline-none transition-colors"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Rule: Every team must have at least N girls</p>
              </div>

              <button
                type="submit"
                className="py-3 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs h-[42px]"
              >
                <CheckSquare className="w-4 h-4 text-slate-950" /> Update League Rules
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Add Competitor Column */}
            <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">Add New Competitor</h2>
                  <p className="text-xs text-slate-400">Introduce a new corporate athlete into the draft pool</p>
                </div>
              </div>

              {playerSuccessMsg && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {playerSuccessMsg}
                </div>
              )}

              <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="e.g. Rachel 'Slide-Deck' Queen"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-sm text-slate-100 focus:outline-none placeholder:text-slate-600 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Role</label>
                  <input
                    type="text"
                    value={playerRole}
                    onChange={(e) => setPlayerRole(e.target.value)}
                    placeholder="e.g. Pitch & Slide Specialist"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-sm text-slate-100 focus:outline-none placeholder:text-slate-600 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Price (Coins)</label>
                  <input
                    type="number"
                    value={playerBasePrice}
                    onChange={(e) => setPlayerBasePrice(Number(e.target.value))}
                    min={1}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-sm text-slate-100 font-mono focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skill Rating (1-100)</label>
                  <input
                    type="number"
                    value={playerSkillRating}
                    onChange={(e) => setPlayerSkillRating(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-sm text-slate-100 font-mono focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Gender Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gender Alignment</label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-black/40 border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPlayerGender('Female')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      playerGender === 'Female' 
                        ? 'bg-amber-500 text-slate-950 font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    👩 Female / Girl
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerGender('Male')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      playerGender === 'Male' 
                        ? 'bg-amber-500 text-slate-950 font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    👨 Male / Boy
                  </button>
                </div>
              </div>

              {/* Emoji Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avatar Emoji ({playerEmoji})</label>
                <div className="grid grid-cols-8 gap-2 p-3 bg-black/30 rounded-2xl border border-white/5">
                  {['📊', '🚀', '🎙️', '📥', '☕', '🌴', '💬', '🎨', '🥷', '🏓', '📚', '💻', '🧠', '👔', '📈', '🧙'].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setPlayerEmoji(emo)}
                      className={`text-xl p-2 rounded-xl transition-all cursor-pointer select-none hover:bg-white/5 active:scale-90 ${
                        playerEmoji === emo ? 'bg-amber-500/20 border border-amber-500/50' : 'border border-transparent'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats sliders */}
              <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Skills Breakdown</h4>
                
                <div className="space-y-2.5">
                  {/* Speed */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 w-20">⚡ Speed</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={playerSpeed}
                      onChange={(e) => setPlayerSpeed(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer h-1.5 rounded bg-white/10"
                    />
                    <span className="font-mono text-amber-400 font-semibold w-8 text-right">{playerSpeed}</span>
                  </div>

                  {/* Stamina */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 w-20">🔋 Stamina</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={playerStamina}
                      onChange={(e) => setPlayerStamina(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer h-1.5 rounded bg-white/10"
                    />
                    <span className="font-mono text-amber-400 font-semibold w-8 text-right">{playerStamina}</span>
                  </div>

                  {/* Teamwork */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 w-20">🤝 Teamwork</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={playerTeamwork}
                      onChange={(e) => setPlayerTeamwork(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer h-1.5 rounded bg-white/10"
                    />
                    <span className="font-mono text-amber-400 font-semibold w-8 text-right">{playerTeamwork}</span>
                  </div>

                  {/* Focus */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 w-20">🎯 Focus</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={playerFocus}
                      onChange={(e) => setPlayerFocus(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer h-1.5 rounded bg-white/10"
                    />
                    <span className="font-mono text-amber-400 font-semibold w-8 text-right">{playerFocus}</span>
                  </div>

                  {/* Fun Factor */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 w-20">🎈 Fun Factor</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={playerFunFactor}
                      onChange={(e) => setPlayerFunFactor(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer h-1.5 rounded bg-white/10"
                    />
                    <span className="font-mono text-amber-400 font-semibold w-8 text-right">{playerFunFactor}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" /> Add Competitor to Draft
              </button>
            </form>
          </div>

          {/* Add Team Owner Column */}
          <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl space-y-6 h-fit">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Add Team Owner</h2>
                <p className="text-xs text-slate-400">Register a new gaming crew with their initial budget</p>
              </div>
            </div>

            {ownerSuccessMsg && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {ownerSuccessMsg}
              </div>
            )}

            <form onSubmit={handleAddOwnerSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Name</label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  placeholder="e.g. Operations Overlords"
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-sm text-slate-100 focus:outline-none placeholder:text-slate-600 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Starting Budget (Coins)</label>
                <input
                  type="number"
                  value={newOwnerWallet}
                  onChange={(e) => setNewOwnerWallet(Number(e.target.value))}
                  min={100}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-sm text-slate-100 font-mono focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Team Branding Color preset selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Accent Color ({newOwnerColor})</label>
                <div className="grid grid-cols-5 gap-3 p-3.5 bg-black/30 rounded-2xl border border-white/5">
                  {[
                    { hex: '#3b82f6', label: 'Blue' },
                    { hex: '#f59e0b', label: 'Amber' },
                    { hex: '#ec4899', label: 'Pink' },
                    { hex: '#10b981', label: 'Green' },
                    { hex: '#8b5cf6', label: 'Purple' },
                    { hex: '#06b6d4', label: 'Cyan' },
                    { hex: '#ef4444', label: 'Red' },
                    { hex: '#f43f5e', label: 'Rose' },
                    { hex: '#6366f1', label: 'Indigo' },
                    { hex: '#14b8a6', label: 'Teal' },
                  ].map((colorObj) => (
                    <button
                      key={colorObj.hex}
                      type="button"
                      onClick={() => setNewOwnerColor(colorObj.hex)}
                      className="w-full aspect-square rounded-xl flex items-center justify-center transition-all relative border border-transparent hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: colorObj.hex }}
                      title={colorObj.label}
                    >
                      {newOwnerColor === colorObj.hex && (
                        <Check className="w-5 h-5 text-black bg-white rounded-full p-0.5 shadow-md border border-black/10" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-2 mt-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Custom Hex:</span>
                  <input
                    type="color"
                    value={newOwnerColor}
                    onChange={(e) => setNewOwnerColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newOwnerColor}
                    onChange={(e) => setNewOwnerColor(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 bg-transparent border-none text-xs font-mono text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-slate-950" /> Register Team Owner
              </button>
            </form>
          </div>

        </div>
      </div>
      )}
    </div>
  );
}

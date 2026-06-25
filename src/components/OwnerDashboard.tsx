import React, { useState } from 'react';
import { Player, Owner, Bid, AuctionState } from '../types';
import { placeBid, deleteBid } from '../dbHelper';
import { PlayerCard, RulesBoard } from './CommonUI';
import { 
  Trophy, 
  Wallet, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Users, 
  ChevronRight, 
  Edit3, 
  Star,
  Lock,
  Eye,
  EyeOff,
  Layers,
  Sparkles
} from 'lucide-react';

interface OwnerDashboardProps {
  players: Player[];
  owners: Owner[];
  bids: Bid[];
  auctionState: AuctionState;
  selectedOwnerId: string | null;
  onSelectOwner: (id: string | null) => void;
}

export default function OwnerDashboard({
  players,
  owners,
  bids,
  auctionState,
  selectedOwnerId,
  onSelectOwner,
}: OwnerDashboardProps) {
  const [dashboardTab, setDashboardTab] = useState<'arena' | 'won' | 'upcoming'>('arena');
  
  // Login flow states
  const [loginOwnerId, setLoginOwnerId] = useState<string | null>(null);
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [bidAmount, setBidAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Find the selected owner details
  const owner = owners.find(o => o.id === selectedOwnerId);

  // Check if owner is session authenticated
  const isOwnerAuthenticated = selectedOwnerId ? localStorage.getItem(`authenticated_owner_${selectedOwnerId}`) === 'true' : false;

  // Active player on auction
  const activePlayer = players.find(p => p.id === auctionState.activePlayerId);

  // Checks if this owner has already submitted a bid for the active player
  const myBid = bids.find(b => b.playerId === auctionState.activePlayerId && b.ownerId === selectedOwnerId);

  // Handle Team Login Selection with Password Protection
  if (!selectedOwnerId || !isOwnerAuthenticated || !owner) {
    const targetOwner = owners.find(o => o.id === (loginOwnerId || selectedOwnerId));
    
    if (targetOwner) {
      // Show password prompt
      const handleVerifyPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        
        const correctPassword = targetOwner.password || '1234';
        if (loginPassword === correctPassword) {
          // Log them in!
          localStorage.setItem(`authenticated_owner_${targetOwner.id}`, 'true');
          onSelectOwner(targetOwner.id);
          setLoginPassword('');
          setLoginOwnerId(null);
        } else {
          setLoginError('Incorrect password! Please try again or ask the Admin for help.');
        }
      };

      return (
        <div className="max-w-md mx-auto space-y-6 py-12">
          <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl shadow-xl space-y-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ backgroundColor: targetOwner.color }} />
            
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10" style={{ color: targetOwner.color }}>
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-100 flex items-center justify-center gap-2">
                Log in to {targetOwner.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Enter your crew's access password to access the bidding dashboard.
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Access Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter team password"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl text-sm text-slate-100 focus:outline-none transition-all pr-10"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer animate-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!targetOwner.password && (
                  <p className="text-[10px] text-amber-400 mt-1 font-semibold">
                    💡 Please ask the Admin for your team access credentials.
                  </p>
                )}
              </div>

              {loginError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
                  {loginError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginOwnerId(null);
                    onSelectOwner(null);
                    setLoginPassword('');
                    setLoginError(null);
                  }}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer text-center"
                >
                  Verify Access
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Otherwise, show the selection list as before
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-[#121212] border border-white/10 p-8 rounded-2xl text-center shadow-xl space-y-6">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            🏆
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">JOIN THE BIDDING ARENA</h1>
            <p className="text-xs text-slate-400 mt-1.5">Select your corporate gaming team below to enter the auction house</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
            {owners.map(o => (
              <button
                key={o.id}
                onClick={() => setLoginOwnerId(o.id)}
                className="flex items-center justify-between p-4 bg-black/40 hover:bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-xl transition-all group text-left active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: o.color }} />
                  <div>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-amber-500 transition-colors">{o.name}</span>
                    <span className="text-[10px] text-slate-500 block">Initial Wallet: 🪙 {(o.initialWallet || o.wallet).toLocaleString()}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        <RulesBoard />
      </div>
    );
  }

  // Active roster of won players
  const myRoster = players.filter(p => p.ownerId === selectedOwnerId);
  const totalSpent = myRoster.reduce((sum, p) => sum + (p.winningBid || 0), 0);

  // Bidding states & constraints
  const isBiddingOpen = auctionState.status === 'BIDDING';
  const isTiebreaker = auctionState.status === 'TIE_RESOLUTION';
  const isTiedAndEligible = isTiebreaker && auctionState.tiedOwners?.includes(owner.id);
  const isExcludedFromTie = isTiebreaker && !isTiedAndEligible;

  // Handle placing a blind bid
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!activePlayer) return;

    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    // Wallet balance guard
    if (amount > owner.wallet) {
      setError(`Your budget is insufficient! You only have 🪙 ${owner.wallet} coins remaining.`);
      return;
    }

    // Base price guard (only for standard bidding)
    if (!isTiebreaker && amount < activePlayer.basePrice) {
      setError(`Your bid must be at least the base price of 🪙 ${activePlayer.basePrice} coins.`);
      return;
    }

    // Tie breaker price guard
    if (isTiebreaker && auctionState.originalWinningAmount && amount < auctionState.originalWinningAmount) {
      setError(`In the tie-breaker, your re-bid must be at least the previous tied bid of 🪙 ${auctionState.originalWinningAmount} coins.`);
      return;
    }

    try {
      await placeBid(activePlayer.id, owner.id, owner.name, amount);
      setSuccess(true);
      // clear local input
      setBidAmount('');
    } catch (err) {
      console.error('Error placing bid:', err);
      setError('Failed to place bid. Please try again.');
    }
  };

  // Withdraw/modify current bid
  const handleModifyBid = async () => {
    if (!activePlayer) return;
    try {
      await deleteBid(activePlayer.id, owner.id);
      if (myBid) {
        setBidAmount(myBid.amount.toString());
      }
      setSuccess(false);
    } catch (err) {
      console.error('Error deleting bid:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar / Login Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121212] border border-white/10 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-[#0a0a0a] border border-white/5">
            🏢
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
              {owner.name} Dashboard
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: owner.color }} />
            </h2>
            <p className="text-xs text-slate-400">Manage bids, view rosters, and track budget</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2.5">
            <Wallet className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block tracking-wider font-semibold">Remaining Wallet</span>
              <span className="text-sm font-mono text-amber-400 font-bold">🪙 {owner.wallet.toLocaleString()} coins</span>
            </div>
          </div>

          <button
            onClick={() => {
              // Clear browser session authentication on logout
              localStorage.removeItem(`authenticated_owner_${selectedOwnerId}`);
              onSelectOwner(null);
            }}
            className="p-2.5 bg-white/5 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-950 rounded-xl text-xs transition-all cursor-pointer"
            title="Leave Team / Switch Team"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 pb-1 gap-4">
        <button
          onClick={() => setDashboardTab('arena')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
            dashboardTab === 'arena'
              ? 'border-amber-500 text-amber-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Bidding Arena
            {activePlayer && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </span>
        </button>

        <button
          onClick={() => setDashboardTab('won')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
            dashboardTab === 'won'
              ? 'border-amber-500 text-amber-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" /> My Won Squad ({myRoster.length})
          </span>
        </button>

        <button
          onClick={() => setDashboardTab('upcoming')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
            dashboardTab === 'upcoming'
              ? 'border-amber-500 text-amber-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> Upcoming Players Board ({players.filter(p => p.status === 'AVAILABLE').length})
          </span>
        </button>
      </div>

      {dashboardTab === 'arena' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Player on Auction & Place Bid Form */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Active Bidding Arena
          </h3>

          {activePlayer ? (
            <div className="space-y-6">
              <PlayerCard player={activePlayer} owners={owners} isActive={true} />

              {/* Bidding Controls Card */}
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-lg">
                {isExcludedFromTie ? (
                  <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl text-center space-y-2">
                    <AlertCircle className="w-5 h-5 text-slate-500 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-300">Tie-Breaker in Progress</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This player is in a "Sudden Death" tiebreaker between the highest bidders. Your team is excluded from this round. Please await the next player!
                    </p>
                  </div>
                ) : myBid ? (
                  /* Bid is Already Placed */
                  <div className="p-5 bg-[#0a0a0a] border border-white/5 rounded-xl text-center space-y-4">
                    <CheckCircle2 className="w-10 h-10 text-amber-500 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Blind Bid Registered Successfully!</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Your bid of <strong className="font-mono text-amber-400">🪙 {myBid.amount} coins</strong> is securely saved. It will remain hidden until revealed by the Admin.
                      </p>
                    </div>
                    {auctionState.status !== 'REVEALED' && (
                      <button
                        onClick={handleModifyBid}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg text-xs font-bold transition-all border border-white/10 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Modify Bid
                      </button>
                    )}
                  </div>
                ) : auctionState.status === 'REVEALED' ? (
                  /* Admin is revealing bids */
                  <div className="p-5 bg-[#0a0a0a] border border-white/5 rounded-xl text-center space-y-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse mx-auto" />
                    <h4 className="text-xs font-bold text-slate-300">Revealing Bids...</h4>
                    <p className="text-xs text-slate-400">
                      The administrator is currently analyzing and revealing the blind bids. Please watch the main display.
                    </p>
                  </div>
                ) : (
                  /* Placing a Bid Form */
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                        {isTiedAndEligible ? '⚡ Submit Tie-Breaker Re-Bid' : 'Place Blind Bid'}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {isTiedAndEligible 
                          ? `Previous Tie: 🪙 ${auctionState.originalWinningAmount}` 
                          : `Base Price: 🪙 ${activePlayer.basePrice}`}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 font-mono">
                          🪙
                        </span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={isTiedAndEligible ? `Min re-bid: ${auctionState.originalWinningAmount}` : `Enter amount (Min ${activePlayer.basePrice})`}
                          className="w-full pl-8 pr-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-amber-500 rounded-xl text-sm font-mono text-amber-400 font-bold focus:outline-none transition-colors"
                          min={isTiedAndEligible ? auctionState.originalWinningAmount : activePlayer.basePrice}
                          max={owner.wallet}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer font-black"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Bid
                      </button>
                    </div>

                    {error && (
                      <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2 bg-rose-950/20 p-2.5 rounded-lg border border-rose-950/40">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#121212]/50 border border-dashed border-white/10 rounded-2xl p-10 text-center text-slate-400">
              <span className="text-4xl">⏳</span>
              <p className="text-sm font-semibold mt-3">Bidding Arena is Idle</p>
              <p className="text-xs text-slate-500 mt-1">Please wait for the administrator to select the next player to start bidding.</p>
            </div>
          )}
        </div>

        {/* Right Column: Owner Roster & Rules */}
        <div className="lg:col-span-5 space-y-6">
          {/* Owner Roster */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-md">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> My Won Players ({myRoster.length})
            </h3>

            {(() => {
              const girlsCount = myRoster.filter(p => p.gender === 'Female').length;
              const boysCount = myRoster.filter(p => p.gender === 'Male').length;
              const maxLimit = auctionState.maxTeamSize || 15;
              const minGirls = auctionState.minGirlsCount || 4;
              const hasEnoughGirls = girlsCount >= minGirls;
              const withinSize = myRoster.length <= maxLimit;

              return (
                <>
                  <div className="space-y-1.5 text-xs text-slate-400 mb-4 bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between">
                      <span>Budget Spent:</span>
                      <span className="font-mono text-slate-200 font-semibold">🪙 {totalSpent.toLocaleString()} / {owner.initialWallet?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Wallet:</span>
                      <span className="font-mono text-amber-400 font-bold">🪙 {owner.wallet.toLocaleString()} chips</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Squad size limit:</span>
                      <span className={`font-bold ${withinSize ? 'text-slate-200' : 'text-rose-400'}`}>
                        {myRoster.length} / {maxLimit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Girls Recruited:</span>
                      <span className={`font-bold ${hasEnoughGirls ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {girlsCount} / {minGirls}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Boys Recruited:</span>
                      <span className="text-slate-300">{boysCount}</span>
                    </div>
                  </div>

                  {/* Real-time compliance alert */}
                  <div className="mb-4">
                    {!hasEnoughGirls ? (
                      <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Need at least {minGirls - girlsCount} more girl(s) 👩
                      </div>
                    ) : myRoster.length > maxLimit ? (
                      <div className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Over roster limit! Max is {maxLimit} players.
                      </div>
                    ) : myRoster.length > 0 ? (
                      <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Roster Compliant ✅ (Meets all Falaliga rules)
                      </div>
                    ) : null}
                  </div>
                </>
              );
            })()}

            {myRoster.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl text-xs">
                <Users className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                No players under your roster yet. Place bids on active players to acquire them!
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {myRoster.map(player => (
                  <div 
                    key={player.id} 
                    className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none">{player.photoUrl}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{player.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{player.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs text-amber-400 font-bold block">
                        🪙 {player.winningBid}
                      </span>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Winning Bid</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <RulesBoard />
        </div>
      </div>
      )}

      {/* Won Tab View */}
      {dashboardTab === 'won' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> My Recruited Squad
              </h3>
              <p className="text-xs text-slate-400">Review all the competitors your crew has successfully acquired in the auction</p>
            </div>

            <div className="flex gap-2">
              <div className="bg-black/30 border border-white/5 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Roster Size</span>
                <span className="text-xs font-bold text-slate-300">
                  {myRoster.length} / {auctionState.maxTeamSize || 15}
                </span>
              </div>
              <div className="bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[9px] text-[#10b981] font-bold uppercase block">Girls Recruited</span>
                <span className="text-xs font-bold text-emerald-400">
                  {myRoster.filter(p => p.gender === 'Female').length} / {auctionState.minGirlsCount || 4}
                </span>
              </div>
              <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[9px] text-[#f59e0b] font-bold uppercase block">Total Spent</span>
                <span className="text-xs font-bold text-amber-400">
                  🪙 {totalSpent.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {myRoster.length === 0 ? (
            <div className="bg-[#121212]/50 border border-dashed border-white/10 rounded-3xl p-16 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Your squad is currently empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once you place winning blind bids on competitors, they will appear here as members of your corporate esports squad.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myRoster.map(player => (
                <div key={player.id} className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <PlayerCard player={player} owners={owners} />
                  <div className="bg-amber-500/10 p-3 border-t border-white/5 flex justify-between items-center text-xs">
                    <span className="text-amber-400 font-bold">Winning Bid Amount:</span>
                    <span className="font-mono text-amber-400 font-black">🪙 {player.winningBid?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Tab View */}
      {dashboardTab === 'upcoming' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" /> Upcoming Players Board
              </h3>
              <p className="text-xs text-slate-400">Preview details and stats for the upcoming players yet to be put up for bidding</p>
            </div>
          </div>

          {(() => {
            const upcomingPlayers = players.filter(p => p.status === 'AVAILABLE' || p.status === 'UNSOLD');
            
            return upcomingPlayers.length === 0 ? (
              <div className="bg-[#121212]/50 border border-dashed border-white/10 rounded-3xl p-16 text-center text-slate-500">
                <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">Players Pool is Exhausted</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  All available competitors have been put up for auction! Look at the 'Won' list to see the finalized squads.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcomingPlayers.map(player => (
                  <div key={player.id} className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between">
                    <PlayerCard player={player} owners={owners} />
                    <div className="bg-[#0a0a0a] p-3 border-t border-white/5 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Base Bid Required:</span>
                      <span className="font-mono text-amber-400 font-bold">🪙 {player.basePrice?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

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
  Star 
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
  const [bidAmount, setBidAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Find the selected owner details
  const owner = owners.find(o => o.id === selectedOwnerId);

  // Active player on auction
  const activePlayer = players.find(p => p.id === auctionState.activePlayerId);

  // Checks if this owner has already submitted a bid for the active player
  const myBid = bids.find(b => b.playerId === auctionState.activePlayerId && b.ownerId === selectedOwnerId);

  // Handle Team Login Selection
  if (!selectedOwnerId || !owner) {
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
                onClick={() => onSelectOwner(o.id)}
                className="flex items-center justify-between p-4 bg-black/40 hover:bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-xl transition-all group text-left active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: o.color }} />
                  <div>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-amber-500 transition-colors">{o.name}</span>
                    <span className="text-[10px] text-slate-500 block">Initial Wallet: 🪙 {o.wallet}</span>
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
              <span className="text-sm font-mono text-amber-400 font-bold">🪙 {owner.wallet} coins</span>
            </div>
          </div>

          <button
            onClick={() => onSelectOwner(null)}
            className="p-2.5 bg-white/5 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-950 rounded-xl text-xs transition-all cursor-pointer"
            title="Leave Team / Switch Team"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Active Bidder & Roster */}
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
    </div>
  );
}

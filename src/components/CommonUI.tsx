import React, { useState } from 'react';
import { Player, Owner } from '../types';
import { Shield, Sparkles, Award, Zap, Heart, Trophy, Info, HelpCircle } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  owners: Owner[];
  isActive?: boolean;
}

export function PlayerCard({ player, owners, isActive = false }: PlayerCardProps) {
  const winningOwner = player.ownerId ? owners.find(o => o.id === player.ownerId) : null;

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 bg-[#161616] text-slate-200 ${
        isActive 
          ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500 scale-[1.01]' 
          : 'border-white/10 hover:border-white/20 shadow-md'
      }`}
    >
      {/* Decorative Gradient Header */}
      <div className={`h-2 w-full bg-gradient-to-r ${
        player.status === 'SOLD' 
          ? 'from-emerald-500 to-teal-500' 
          : player.status === 'BIDDING'
          ? 'from-amber-500 to-orange-500 animate-pulse'
          : player.status === 'UNSOLD'
          ? 'from-rose-500 to-red-600'
          : 'from-slate-700 to-slate-800'
      }`} />

      <div className="p-5">
        {/* Top Badges */}
        <div className="flex justify-between items-start gap-2 mb-4">
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
              {player.role}
            </span>
            {player.gender && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                player.gender === 'Female' 
                  ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {player.gender === 'Female' ? '👩 Female' : '👨 Male'}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              ★ {player.skillRating}
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Skill Rating</span>
          </div>
        </div>

        {/* Visual Avatar Section */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-black/40 to-black/60 border border-white/10 text-4xl shadow-inner select-none">
            {player.photoUrl || '👤'}
            {isActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
              {player.name}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              Base Price: <span className="font-mono text-amber-400 font-bold">🪙 {player.basePrice.toLocaleString()}</span>
            </p>
            {player.falaLeague && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-bold text-yellow-400 uppercase tracking-wide">
                <Trophy className="w-2.5 h-2.5 text-yellow-500" /> Fala League: {player.falaLeague}
              </div>
            )}
          </div>
        </div>

        {/* Player Stats */}
        <div className="space-y-2.5 my-4 bg-black/40 p-3 rounded-xl border border-white/5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Badminton</span>
                <span>{player.stats.badminton || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" 
                  style={{ width: `${player.stats.badminton || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span className="flex items-center gap-1"><Award className="w-3 h-3 text-blue-400" /> Carroms</span>
                <span>{player.stats.carroms || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full" 
                  style={{ width: `${player.stats.carroms || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-400" /> Cricket</span>
                <span>{player.stats.cricket || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full" 
                  style={{ width: `${player.stats.cricket || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> Football</span>
                <span>{player.stats.football || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full" 
                  style={{ width: `${player.stats.football || 0}%` }}
                />
              </div>
            </div>

            <div className="col-span-2 mt-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-pink-400" /> Table Tennis (TT)</span>
                <span>{player.stats.tt || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-pink-300 rounded-full" 
                  style={{ width: `${player.stats.tt || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status Display */}
        <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">
            Status
          </span>
          <div>
            {player.status === 'AVAILABLE' && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Ready to Bid
              </span>
            )}
            {player.status === 'BIDDING' && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                Bidding Active
              </span>
            )}
            {player.status === 'UNSOLD' && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Unsold Pool
              </span>
            )}
            {player.status === 'SOLD' && winningOwner && (
              <div className="flex flex-col items-end">
                <span 
                  className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${winningOwner.color}20`, color: winningOwner.color, border: `1px solid ${winningOwner.color}40` }}
                >
                  Sold to {winningOwner.name}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold mt-1">
                  🪙 {player.winningBid} coins
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Rules & Interactive Strategy Guide
export function RulesBoard() {
  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 text-slate-200 shadow-xl">
      <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Official Bidding Strategy & Rules</h2>
          <p className="text-xs text-slate-400">Read rules for ties, budgets, and unsold players</p>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        {/* Rule 1 */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 text-xs font-bold flex items-center justify-center text-slate-300">
            1
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Blind Bidding Process</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Every player starts at their <strong>Base Price</strong>. Owners place blind bids simultaneously. The admin reveals all bids at once to guarantee absolute fairness.
            </p>
          </div>
        </div>

        {/* Rule 2 */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 text-xs font-bold flex items-center justify-center text-slate-300">
            2
          </div>
          <div>
            <h4 className="font-bold text-slate-100">10 Lakhs Chips & Squad Limits</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              All Owners start with <strong>🪙 1,000,000 chips (10 Lakhs)</strong>. When you win a player, your winning bid is deducted in real-time. Target team size is configurable (typically 15 to 20 members).
            </p>
          </div>
        </div>

        {/* Rule Diversity */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 text-xs font-bold flex items-center justify-center text-slate-300">
            👩
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Gender Balance Rule</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              To ensure full collaboration and team integration, <strong>every squad must recruit at least 4 female players (girls)</strong>. The remaining members are male (boys). The compliance checker tracks this in real-time.
            </p>
          </div>
        </div>

        {/* Rule 3 */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 text-xs font-bold flex items-center justify-center text-slate-300">
            3
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Tie-Breaker Strategy 🤝</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              If two or more owners bid the <strong>same highest amount</strong>, the system handles it with 3 exciting options:
            </p>
            <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs text-slate-400">
              <li><strong>Sudden Death Re-bid</strong>: Only the tied owners can place a secondary bid starting from the tied amount.</li>
              <li><strong>Animated Coin Toss / Wheel Spin</strong>: A real-time fun animation randomly selects the winner.</li>
              <li><strong>Admin Choice</strong>: The administrator arbitrates and assigns.</li>
            </ul>
          </div>
        </div>

        {/* Rule 4 */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 text-xs font-bold flex items-center justify-center text-slate-300">
            4
          </div>
          <div>
            <h4 className="font-bold text-slate-100">What if a Player is Unsold? 🔄</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              If no bids are placed, the player is moved to the <strong>Unsold Pool</strong>. The admin can re-auction them at any time during or after the main round (typically at a 20% discount on base price for speed-bidding!).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fun Tie-Breaker Animator (Coin Toss & Random Wheel)
interface TieBreakerToolProps {
  tiedOwners: Owner[];
  onWinnerSelected: (ownerId: string) => void;
}

export function TieBreakerTool({ tiedOwners, onWinnerSelected }: TieBreakerToolProps) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Owner | null>(null);

  const startSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);

    // Dynamic delay for animation effect
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * tiedOwners.length);
      const chosen = tiedOwners[randomIndex];
      setWinner(chosen);
      setSpinning(false);
    }, 2500);
  };

  return (
    <div className="bg-black/60 border border-amber-500/20 rounded-2xl p-5 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 animate-pulse" />
      
      <div className="mb-4">
        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
          ⚡ TIE-BREAKER GENERATOR
        </span>
        <h3 className="text-base font-bold text-white mt-2">Instant Random Resolver</h3>
        <p className="text-xs text-slate-400 mt-1">Let the arena decide who wins this player</p>
      </div>

      <div className="my-6 flex flex-col items-center justify-center min-h-[140px]">
        {spinning ? (
          <div className="flex flex-col items-center gap-4">
            {/* Spinning Coin / Wheel visual */}
            <div className="relative w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin flex items-center justify-center">
              <span className="text-2xl">🪙</span>
            </div>
            <p className="text-xs text-amber-500 animate-pulse font-mono tracking-wider">FLIPPING COIN...</p>
          </div>
        ) : winner ? (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-yellow-300 font-extrabold">
              👑
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest">WINNER CHOSEN</p>
              <h4 className="text-lg font-bold text-white mt-0.5" style={{ color: winner.color }}>
                {winner.name}
              </h4>
            </div>
            <button
              onClick={() => onWinnerSelected(winner.id)}
              className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
            >
              Confirm and Award Player
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {tiedOwners.map((owner) => (
                <div 
                  key={owner.id} 
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold"
                  style={{ borderColor: `${owner.color}40`, backgroundColor: `${owner.color}10`, color: owner.color }}
                >
                  {owner.name}
                </div>
              ))}
            </div>
            <button
              onClick={startSpin}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg active:scale-95"
            >
              🎲 SPIN / FLIP COIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

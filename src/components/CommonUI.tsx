import React, { useState } from 'react';
import { Player, Owner } from '../types';
import { Shield, Sparkles, Award, Zap, Heart, Trophy, Info, HelpCircle } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  owners: Owner[];
  isActive?: boolean;
  isAuctionScreen?: boolean;
}

export function PlayerCard({ player, owners, isActive = false, isAuctionScreen = false }: PlayerCardProps) {
  const winningOwner = player.ownerId ? owners.find(o => o.id === player.ownerId) : null;
  
  // Custom name-matching image state with automatic fallback progression
  const [imgSrc, setImgSrc] = React.useState<string | null>(() => {
    if (player.photoUrl && (player.photoUrl.startsWith('data:') || player.photoUrl.startsWith('/') || player.photoUrl.startsWith('http'))) {
      return player.photoUrl;
    }
    return `/player-images/${player.name}.jpg`;
  });
  const [imgErrorCount, setImgErrorCount] = React.useState(0);

  const handleImgError = () => {
    if (imgErrorCount === 0) {
      setImgSrc(`/player-images/${player.name}.png`);
      setImgErrorCount(1);
    } else if (imgErrorCount === 1) {
      setImgSrc(`/player-images/${player.name}.jpeg`);
      setImgErrorCount(2);
    } else if (imgErrorCount === 2) {
      // Fallback to original photoUrl if it's a valid link, relative path, or base64 string
      if (player.photoUrl && (player.photoUrl.startsWith('http') || player.photoUrl.startsWith('/') || player.photoUrl.startsWith('data:'))) {
        setImgSrc(player.photoUrl);
      } else {
        setImgSrc(null);
      }
      setImgErrorCount(3);
    } else {
      setImgSrc(null);
    }
  };

  // Shared inner avatar/photo renderer
  const renderAvatarContent = () => (
    <div className="absolute inset-0 bg-gradient-to-b from-[#18181b] to-[#09090b]">
      {/* Subtle ambient back-glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(27,75,224,0.12)_0%,transparent_75%)] pointer-events-none animate-pulse" />
      
      {imgSrc ? (
        <img 
          src={imgSrc} 
          alt={player.name} 
          onError={handleImgError}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,rgba(27,75,224,0.06)_0%,transparent_60%)]">
          {/* Massive stylized background emoji */}
          <span className="text-8xl leading-none inline-block select-none transform transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            {player.photoUrl || '👤'}
          </span>
        </div>
      )}

      {isActive && (
        <span className="absolute top-4 right-4 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fala-magenta opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-fala-magenta"></span>
        </span>
      )}
    </div>
  );

  // Render Horizontal Split Layout for Auction Arena Screen
  if (isAuctionScreen) {
    return (
      <div 
        className={`relative rounded-3xl overflow-hidden border transition-all duration-300 bg-[#161616] text-slate-200 flex flex-col md:flex-row items-stretch ${
          isActive 
            ? 'border-fala-blue shadow-[0_0_30px_rgba(27,75,224,0.3)] ring-1 ring-fala-blue scale-[1.01]' 
            : 'border-white/10 shadow-2xl'
        }`}
      >
        {/* Left Side: Stretched Full-Height Image */}
        <div className="relative w-full md:w-5/12 min-h-[260px] md:min-h-full overflow-hidden group border-b md:border-b-0 md:border-r border-white/5">
          {renderAvatarContent()}
        </div>

        {/* Right Side: Identity, Ratings, and Sports Strengths brought to the right */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          
          {/* Header row: Gender and Rating */}
          <div className="flex justify-between items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
              player.gender === 'Female' 
                ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' 
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {player.gender === 'Female' ? '👩 Female' : '👨 Male'}
            </span>
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-white/5">
              <span className="text-base font-black bg-gradient-to-r from-fala-magenta to-fala-blue bg-clip-text text-transparent font-display">
                ★ {player.skillRating}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Rating</span>
            </div>
          </div>

          {/* Identity details (Base Price has been removed as requested) */}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1.5">
              <h3 className="text-3xl font-black text-white tracking-tight leading-none uppercase font-display">
                {player.name}
              </h3>
              {player.role && (
                <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                  {player.role}
                </p>
              )}
              {player.falaLeague && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-fala-blue/10 border border-fala-blue/20 text-[10px] font-bold text-fala-blue uppercase tracking-wide">
                  <Trophy className="w-3.5 h-3.5 text-fala-blue" /> {player.falaLeague}
                </div>
              )}
            </div>
          </div>

          {player.comments && (
            <div className="bg-gradient-to-r from-fala-blue/10 to-transparent border-l-2 border-fala-blue px-3.5 py-2.5 rounded-r-xl">
              <span className="text-[9px] font-black uppercase tracking-wider text-fala-blue block mb-0.5">Player Insights</span>
              <p className="text-xs text-slate-300 italic">"{player.comments}"</p>
            </div>
          )}

          {/* Sports Strengths Grid - Brought entirely to the right side */}
          <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Game Strengths & Ratings</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-medium mb-1">
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-fala-blue" /> Badminton</span>
                  <span className="text-white font-bold">{player.stats.badminton || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-fala-blue to-fala-green rounded-full" 
                    style={{ width: `${player.stats.badminton || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 font-medium mb-1">
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-blue-400" /> Carroms</span>
                  <span className="text-white font-bold">{player.stats.carroms || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full" 
                    style={{ width: `${player.stats.carroms || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 font-medium mb-1">
                  <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> Cricket</span>
                  <span className="text-white font-bold">{player.stats.cricket || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full" 
                    style={{ width: `${player.stats.cricket || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 font-medium mb-1">
                  <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Football</span>
                  <span className="text-white font-bold">{player.stats.football || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full" 
                    style={{ width: `${player.stats.football || 0}%` }}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium mb-1">
                  <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-pink-400" /> Table Tennis (TT)</span>
                  <span className="text-white font-bold">{player.stats.tt || 0}%</span>
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

          {/* Sold and Status indicator with beautiful glowing highlight */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-black">Auction Status</span>
            <div>
              {player.status === 'AVAILABLE' && (
                <span className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-fala-blue/15 text-fala-blue border border-fala-blue/35 animate-pulse">
                  Ready to Bid
                </span>
              )}
              {player.status === 'BIDDING' && (
                <span className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-fala-magenta/15 text-fala-magenta border border-fala-magenta/35 animate-pulse">
                  Bidding Active
                </span>
              )}
              {player.status === 'UNSOLD' && (
                <span className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/35">
                  Unsold Pool
                </span>
              )}
              {player.status === 'SOLD' && winningOwner && (
                <div className="flex flex-col items-end gap-1">
                  <span 
                    className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border border-amber-400/50 shadow-lg shadow-amber-500/20 animate-bounce"
                    style={{ backgroundColor: winningOwner.color, color: '#ffffff', borderColor: winningOwner.color }}
                  >
                    🏆 SOLD TO {winningOwner.name}
                  </span>
                  <span className="text-base font-mono text-amber-400 font-extrabold flex items-center gap-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    FOR 🪙 {player.winningBid?.toLocaleString()} COINS
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Standard Vertical Card Layout
  return (
    <div 
      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 bg-[#161616] text-slate-200 ${
        isActive 
          ? 'border-fala-blue shadow-[0_0_20px_rgba(27,75,224,0.25)] ring-1 ring-fala-blue scale-[1.01]' 
          : 'border-white/10 hover:border-white/20 shadow-md'
      }`}
    >
      {/* Decorative Gradient Header */}
      <div className={`h-2 w-full bg-gradient-to-r ${
        player.status === 'SOLD' 
          ? 'from-emerald-500 to-teal-500' 
          : player.status === 'BIDDING'
          ? 'from-fala-blue to-fala-magenta animate-pulse'
          : player.status === 'UNSOLD'
          ? 'from-rose-500 to-red-600'
          : 'from-slate-700 to-slate-800'
      }`} />

      <div className="p-5">
        {/* Top Badges */}
        <div className="flex justify-between items-center gap-2 mb-4">
          <div className="flex flex-wrap gap-1.5">
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
          <div className="flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-full border border-white/5">
            <span className="text-sm font-black bg-gradient-to-r from-fala-magenta to-fala-blue bg-clip-text text-transparent font-display">
              ★ {player.skillRating}
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Rating</span>
          </div>
        </div>

        {/* Visual Avatar Section (BIG Prominent Player Photo) */}
        <div className="relative w-full h-48 bg-gradient-to-b from-[#18181b] to-[#09090b] border border-white/10 rounded-xl overflow-hidden mb-4 group shadow-inner">
          {renderAvatarContent()}
        </div>

        {/* Player Identity Details (Base Price has been removed as requested) */}
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white tracking-tight leading-tight uppercase font-display">
              {player.name}
            </h3>
            {player.role && (
              <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                {player.role}
              </p>
            )}
            {player.falaLeague && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-fala-blue/10 border border-fala-blue/20 text-[9px] font-bold text-fala-blue uppercase tracking-wide">
                <Trophy className="w-2.5 h-2.5 text-fala-blue" /> {player.falaLeague}
              </div>
            )}
          </div>
        </div>

        {player.comments && (
          <div className="bg-gradient-to-r from-fala-blue/10 to-transparent border-l-2 border-fala-blue px-3 py-2 rounded-r-lg mb-3">
            <span className="text-[8px] font-black uppercase tracking-wider text-fala-blue block mb-0.5">About Player</span>
            <p className="text-[11px] text-slate-300 italic leading-snug">"{player.comments}"</p>
          </div>
        )}

        {/* Player Stats */}
        <div className="space-y-2.5 my-4 bg-black/40 p-3 rounded-xl border border-white/5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-fala-blue" /> Badminton</span>
                <span>{player.stats.badminton || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-fala-blue to-fala-green rounded-full" 
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
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-fala-magenta/10 text-fala-magenta border border-fala-magenta/20 animate-pulse">
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
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 text-slate-200 shadow-xl font-sans">
      <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
        <div className="p-2 rounded-xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20">
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
            <h4 className="font-bold text-slate-100">Live Offline Bidding</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Bidding is conducted offline in the live arena. Once the bidding is done, the administrator updates and records the final sold price of that player.
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
              If no bids are placed, the player is moved to the <strong>Unsold Pool</strong>. The admin can re-auction them at any time during or after the main round at any point for offline bidding!
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
    <div className="bg-black/60 border border-fala-blue/20 rounded-2xl p-5 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fala-blue via-fala-magenta to-fala-green animate-pulse" />
      
      <div className="mb-4">
        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-fala-blue/10 text-fala-blue border border-fala-blue/20">
          ⚡ TIE-BREAKER GENERATOR
        </span>
        <h3 className="text-base font-bold text-white mt-2">Instant Random Resolver</h3>
        <p className="text-xs text-slate-400 mt-1">Let the arena decide who wins this player</p>
      </div>

      <div className="my-6 flex flex-col items-center justify-center min-h-[140px]">
        {spinning ? (
          <div className="flex flex-col items-center gap-4">
            {/* Spinning Coin / Wheel visual */}
            <div className="relative w-16 h-16 rounded-full border-4 border-fala-blue border-t-transparent animate-spin flex items-center justify-center">
              <span className="text-2xl">🪙</span>
            </div>
            <p className="text-xs text-fala-blue animate-pulse font-mono tracking-wider">FLIPPING COIN...</p>
          </div>
        ) : winner ? (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br from-fala-blue to-fala-magenta text-white shadow-[0_0_20px_rgba(27,75,224,0.4)] border border-fala-blue/50 font-extrabold">
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
              className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
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
              className="px-5 py-2.5 bg-gradient-to-r from-fala-blue to-fala-magenta hover:from-fala-blue/90 hover:to-fala-magenta/90 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              🎲 SPIN / FLIP COIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

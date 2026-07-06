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

  // Local image matching states to check for player-images folder
  const [imgSrc, setImgSrc] = React.useState<string>(`/player-images/${player.name.trim()}.jpg`);
  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(`/player-images/${player.name.trim()}.jpg`);
    setImgFailed(false);
  }, [player.name]);

  const handleImgError = () => {
    if (imgSrc.endsWith('.jpg')) {
      setImgSrc(`/player-images/${player.name.trim()}.png`);
    } else if (imgSrc.endsWith('.png')) {
      setImgSrc(`/player-images/${player.name.trim()}.jpeg`);
    } else {
      setImgFailed(true);
    }
  };

  // Determine what image src to display
  const hasExternalPhoto = player.photoUrl && (player.photoUrl.startsWith('http') || player.photoUrl.startsWith('/'));
  const finalImageSrc = !imgFailed ? imgSrc : (hasExternalPhoto ? player.photoUrl : null);

  // Stats definition
  const statsList = [
    { name: 'Badminton', value: player.stats?.badminton ?? 75, color: 'from-fala-blue to-fala-magenta' },
    { name: 'Carroms', value: player.stats?.carroms ?? 75, color: 'from-blue-500 to-blue-300' },
    { name: 'Cricket', value: player.stats?.cricket ?? 75, color: 'from-purple-500 to-purple-300' },
    { name: 'Football', value: player.stats?.football ?? 75, color: 'from-emerald-500 to-emerald-300' },
    { name: 'Table Tennis (TT)', value: player.stats?.tt ?? 75, color: 'from-pink-500 to-pink-300' },
  ];

  if (isActive) {
    // Majestic Expanded Widescreen Landscape Player Card for the main live screen
    return (
      <div 
        className="relative rounded-3xl overflow-hidden border-2 border-fala-magenta/40 bg-gradient-to-b from-[#141416] to-[#0c0c0e] text-slate-200 shadow-[0_0_35px_rgba(225,0,90,0.15)] w-full flex flex-col md:flex-row h-auto md:min-h-[460px]"
        id={`active-player-${player.id}`}
      >
        {/* Left Side: Stretched Full-screen Image */}
        <div className="md:w-1/2 relative min-h-[300px] md:min-h-full bg-gradient-to-b from-[#18181b] to-[#09090b] border-r border-white/5 overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,0,90,0.1)_0%,transparent_75%)] pointer-events-none animate-pulse" />
          
          {finalImageSrc ? (
            <img 
              src={finalImageSrc} 
              alt={player.name} 
              onError={handleImgError}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,rgba(225,0,90,0.05)_0%,transparent_60%)]">
              <span className="text-8xl leading-none inline-block select-none transform transition-transform duration-500 hover:scale-110 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                {player.photoUrl || '👤'}
              </span>
            </div>
          )}

          {/* Gradient identity scrim to keep text beautiful */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 pointer-events-none" />

          {/* Status badge in top-left */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/75 backdrop-blur-md border border-fala-magenta/30 text-fala-magenta text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-fala-magenta animate-ping" />
              LIVE DRAFT ACTIVE
            </span>
          </div>

          {/* Rating badge in top-right */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10 shadow-lg">
            <span className="text-sm font-black bg-gradient-to-r from-fala-magenta to-fala-blue bg-clip-text text-transparent font-display">
              ★ {player.skillRating}
            </span>
            <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Rating</span>
          </div>

          {/* Player Identity Scrim Details */}
          <div className="absolute bottom-6 left-6 right-6 z-10 space-y-2">
            <div>
              {player.gender && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                  player.gender === 'Female' 
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' 
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {player.gender === 'Female' ? '👩 Female Competitor' : '👨 Male Competitor'}
                </span>
              )}
            </div>
            
            <h3 className="text-3xl font-black text-white tracking-tight uppercase font-display drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {player.name}
            </h3>

            {player.falaLeague && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-fala-blue/20 border border-fala-blue/30 text-[9px] font-black text-slate-300 uppercase tracking-wide">
                🏆 PREVIOUS: {player.falaLeague}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Identity and Games Strength stats */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {player.status === 'SOLD' && winningOwner && (
              <div className="flex items-center justify-end border-b border-white/5 pb-4">
                <div className="text-right p-4 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse w-full">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black block">SOLD FOR</span>
                  <span className="font-mono text-emerald-300 font-black text-3xl block mt-1">
                    🪙 {player.winningBid?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-white font-extrabold block mt-2 bg-emerald-600/30 px-3 py-1 rounded-full border border-emerald-500/40 inline-block">
                    🤝 {winningOwner.name}
                  </span>
                </div>
              </div>
            )}

            {/* Games Strength */}
            <div className="space-y-4">
              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-widest border-l-2 border-fala-magenta pl-2 font-display">
                Competitor Games Strength
              </h4>

              <div className="space-y-3.5">
                {statsList.map((stat) => (
                  <div key={stat.name} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300 font-bold">
                      <span>{stat.name}</span>
                      <span className="font-mono font-black text-slate-200">{stat.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`} 
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Status Display */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
              Draft Status
            </span>
            <div>
              {player.status === 'AVAILABLE' && (
                <span className="px-3 py-1 rounded-lg text-xs font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wider">
                  Ready to Draft
                </span>
              )}
              {player.status === 'BIDDING' && (
                <span className="px-3 py-1 rounded-lg text-xs font-black uppercase bg-fala-magenta/15 text-fala-magenta border border-fala-magenta/20 tracking-wider animate-pulse">
                  Draft Open
                </span>
              )}
              {player.status === 'UNSOLD' && (
                <span className="px-3 py-1 rounded-lg text-xs font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 tracking-wider">
                  Unsold Pool
                </span>
              )}
              {player.status === 'SOLD' && winningOwner && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: winningOwner.color }} />
                  <span className="text-xs font-black uppercase tracking-wider text-white" style={{ color: winningOwner.color }}>
                    Won by {winningOwner.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal/Standard Player Card rendering for grids
  return (
    <div 
      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 bg-[#161616] text-slate-200 h-full flex flex-col ${
        isActive 
          ? 'border-fala-blue shadow-[0_0_20px_rgba(27,75,224,0.25)] ring-1 ring-fala-blue scale-[1.01]' 
          : 'border-white/10 hover:border-white/20 shadow-md'
      }`}
      id={`standard-player-${player.id}`}
    >
      {/* Decorative Gradient Header */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${
        player.status === 'SOLD' 
          ? 'from-emerald-500 to-teal-500' 
          : player.status === 'BIDDING'
          ? 'from-fala-blue to-fala-magenta animate-pulse'
          : player.status === 'UNSOLD'
          ? 'from-rose-500 to-red-600'
          : 'from-slate-700 to-slate-800'
      }`} />

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Badges */}
          <div className="flex justify-between items-center gap-2 mb-3">
            <div className="flex flex-wrap gap-1.5">
              {player.gender && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  player.gender === 'Female' 
                    ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {player.gender === 'Female' ? '👩 Female' : '👨 Male'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
              <span className="text-xs font-black bg-gradient-to-r from-fala-magenta to-fala-blue bg-clip-text text-transparent font-display">
                ★ {player.skillRating}
              </span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Rating</span>
            </div>
          </div>

          {/* Visual Avatar Section (BIG Prominent Player Photo) */}
          <div className="relative w-full h-40 bg-gradient-to-b from-[#18181b] to-[#09090b] border border-white/10 rounded-xl overflow-hidden mb-3 group shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(27,75,224,0.12)_0%,transparent_75%)] pointer-events-none animate-pulse" />
            
            {finalImageSrc ? (
              <img 
                src={finalImageSrc} 
                alt={player.name} 
                onError={handleImgError}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,rgba(27,75,224,0.06)_0%,transparent_60%)]">
                <span className="text-6xl leading-none inline-block select-none transform transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                  {player.photoUrl || '👤'}
                </span>
              </div>
            )}

            {isActive && (
              <span className="absolute top-2.5 right-2.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fala-magenta opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-fala-magenta"></span>
              </span>
            )}
          </div>

          {/* Player Identity Details */}
          <div className="flex justify-between items-start gap-3 mb-2.5">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-white tracking-tight leading-tight uppercase font-display">
                {player.name}
              </h3>
              {player.falaLeague && (
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-fala-blue/10 border border-fala-blue/20 text-[8px] font-bold text-fala-blue uppercase tracking-wide">
                  <Trophy className="w-2 h-2 text-fala-blue" /> {player.falaLeague}
                </div>
              )}
            </div>
          </div>

          {/* Player Stats */}
          <div className="space-y-2 my-2.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {statsList.map((stat) => (
                <div key={stat.name} className={stat.name.startsWith('Table') ? "col-span-2 mt-0.5" : ""}>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-0.5">
                    <span>{stat.name}</span>
                    <span>{stat.value}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full`} 
                      style={{ width: `${stat.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Status Display */}
        <div className="mt-2 pt-2.5 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Status
          </span>
          <div>
            {player.status === 'AVAILABLE' && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Ready to Bid
              </span>
            )}
            {player.status === 'BIDDING' && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-fala-magenta/10 text-fala-magenta border border-fala-magenta/20 animate-pulse">
                Bidding Active
              </span>
            )}
            {player.status === 'UNSOLD' && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Unsold Pool
              </span>
            )}
            {player.status === 'SOLD' && winningOwner && (
              <div className="flex flex-col items-end">
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${winningOwner.color}20`, color: winningOwner.color, border: `1px solid ${winningOwner.color}40` }}
                >
                  Sold to {winningOwner.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                  🪙 {player.winningBid?.toLocaleString()} coins
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
            <h4 className="font-bold text-slate-100">Blind Bidding Process</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Owners place blind bids simultaneously. The admin reveals all bids at once to guarantee absolute fairness.
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

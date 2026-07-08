import React, { useState } from 'react';
import { Player, Owner, Bid, AuctionState } from '../types';
import { PlayerCard } from './CommonUI';
import { 
  Trophy, 
  Search, 
  Layers, 
  Users, 
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  // Public Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'Female' | 'Male'>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');

  // Helper calculation for chips left
  const getChipsLeft = (owner: Owner) => {
    const teamPlayers = players.filter(p => p.ownerId === owner.id && p.status === 'SOLD');
    const spent = teamPlayers.reduce((sum, p) => sum + (p.winningBid || 0), 0);
    return owner.initialWallet - spent;
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setGenderFilter('ALL');
    setTeamFilter('ALL');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dashboard Top Banner */}
      <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-fala-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-fala-magenta/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-fala-blue/10 border border-fala-blue/20 text-fala-blue text-[10px] font-black uppercase tracking-widest rounded-full">
              🏆 FALALIGA OWNER'S BOARD
            </div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase font-display">
              TEAMS & SQUADS PORTAL
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Publicly monitor all franchise rosters, financial records, rule compliance counts, and biometric player metrics in real-time. Click player cards to flip.
            </p>
          </div>
          
          <div className="flex gap-3 text-center self-start md:self-center">
            <div className="bg-black/40 border border-white/5 px-4 py-2.5 rounded-2xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">TOTAL TEAMS</span>
              <span className="text-lg font-black text-slate-200 font-mono">{owners.length}</span>
            </div>
            <div className="bg-black/40 border border-white/5 px-4 py-2.5 rounded-2xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">PLAYERS SOLD</span>
              <span className="text-lg font-black text-fala-green font-mono">
                {players.filter(p => p.status === 'SOLD').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filtering Console */}
      <div className="bg-[#121212] border border-white/10 p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete name or sport..."
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-xs focus:outline-none transition-all placeholder:text-slate-500 text-slate-200 font-medium"
            />
          </div>

          {/* Team Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-xs focus:outline-none transition-all text-slate-300 font-semibold cursor-pointer"
            >
              <option value="ALL">Show All Teams</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  Roster: {owner.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter Toggle */}
          <div className="md:col-span-3 flex bg-black/40 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setGenderFilter('ALL')}
              className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                genderFilter === 'ALL' ? 'bg-fala-blue text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setGenderFilter('Female')}
              className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                genderFilter === 'Female' ? 'bg-fala-blue text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👩 Girls
            </button>
            <button
              onClick={() => setGenderFilter('Male')}
              className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                genderFilter === 'Male' ? 'bg-fala-blue text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👨 Boys
            </button>
          </div>

          {/* Reset Filters */}
          <div className="md:col-span-1 text-right">
            <button
              onClick={handleResetFilters}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer flex items-center justify-center w-full md:w-auto"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Squads Layout */}
      {teamFilter === 'ALL' ? (
        /* Grid of All Teams */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-sm font-black uppercase tracking-widest text-fala-blue flex items-center gap-2">
              🏆 ALL TEAMS BOARD OVERVIEW
            </h4>
            <span className="text-[10px] font-semibold text-slate-500">REAL-TIME TRACKING</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {owners.map(owner => {
              const ownerPlayers = players.filter(p => p.ownerId === owner.id && p.status === 'SOLD');
              const girlsCount = ownerPlayers.filter(p => p.gender === 'Female').length;
              const maxLimit = auctionState.maxTeamSize || 15;
              const minGirls = auctionState.minGirlsCount || 4;
              
              const chipsLeft = getChipsLeft(owner);
              const hasEnoughGirls = girlsCount >= minGirls;
              const withinSize = ownerPlayers.length <= maxLimit;

              // Filter the individual players inside the list as well if searched
              const filteredPlayers = ownerPlayers.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesGender = genderFilter === 'ALL' || p.gender === genderFilter;
                return matchesSearch && matchesGender;
              });

              return (
                <div 
                  key={owner.id} 
                  className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xl hover:border-white/20 transition-all duration-300"
                  style={{ borderTop: `5px solid ${owner.color}` }}
                >
                  {/* Header Area */}
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-extrabold text-base text-white tracking-tight uppercase line-clamp-1">{owner.name}</h5>
                      
                      {/* REQUIREMENT: "Chips left should be displayed very small under team title name." */}
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
                        Chips left: <span className="text-fala-green font-mono">🪙 {chipsLeft.toLocaleString()}</span>
                      </p>

                      {(() => {
                        const ownerPlayer = players.find(p => p.id === owner.ownerPlayerId);
                        const coOwnerPlayer = players.find(p => p.id === owner.coOwnerPlayerId);
                        if (!ownerPlayer && !coOwnerPlayer) return null;
                        return (
                          <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-400 border-t border-white/5 pt-1.5 uppercase">
                            {ownerPlayer && (
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-amber-400 text-xs">👑</span>
                                <span className="text-slate-500 font-semibold text-[9px] tracking-wider">Owner:</span>
                                <span className="text-slate-200 font-bold truncate">{ownerPlayer.name}</span>
                              </div>
                            )}
                            {coOwnerPlayer && (
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-blue-400 text-xs">🤝</span>
                                <span className="text-slate-500 font-semibold text-[9px] tracking-wider">Co-Owner:</span>
                                <span className="text-slate-200 font-bold truncate">{coOwnerPlayer.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <div className="bg-white/5 p-1.5 rounded text-center">
                        <span className="block text-[8px] text-slate-500">Squad Size</span>
                        <span className={`${withinSize ? "text-slate-300" : "text-rose-400"} text-xs font-black`}>
                          {ownerPlayers.length} / {maxLimit}
                        </span>
                      </div>
                      <div className="bg-white/5 p-1.5 rounded text-center">
                        <span className="block text-[8px] text-slate-500">Girls</span>
                        <span className={`${hasEnoughGirls ? "text-emerald-400" : "text-fala-magenta"} text-xs font-black`}>
                          {girlsCount} / {minGirls}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Players list without any "Current squad" label */}
                  <div className="space-y-1.5 flex-1 py-3 border-t border-b border-white/5 my-2 overflow-y-auto max-h-[220px] scrollbar-thin">
                    {filteredPlayers.length === 0 ? (
                      <p className="text-[11px] text-slate-600 italic text-center py-6">
                        {ownerPlayers.length === 0 ? 'No players won yet' : 'No matches found'}
                      </p>
                    ) : (
                      filteredPlayers.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-xs bg-black/30 px-2.5 py-1.5 rounded hover:bg-black/40 transition-colors">
                          <span className="text-slate-300 font-semibold truncate max-w-[120px]" title={p.name}>
                            {p.gender === 'Female' ? '👩' : '👨'} {p.name.split(' "')[0]}
                          </span>
                          <span className="font-mono font-bold text-fala-green">🪙{p.winningBid?.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer status bar */}
                  <div className="text-[10px] font-bold flex items-center justify-between">
                    <span className="text-slate-500">COMPLIANCE:</span>
                    {!hasEnoughGirls ? (
                      <span className="text-fala-magenta animate-pulse text-[9px]">NEED {minGirls - girlsCount} GIRL(S) ⚠️</span>
                    ) : ownerPlayers.length > maxLimit ? (
                      <span className="text-rose-400 text-[9px]">OVER LIMIT ⚠️</span>
                    ) : ownerPlayers.length > 0 ? (
                      <span className="text-emerald-400 text-[9px]">COMPLIANT ✅</span>
                    ) : (
                      <span className="text-slate-600">EMPTY</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Selected Single Team Roster View with FULL Flippable player cards */
        (() => {
          const targetOwner = owners.find(o => o.id === teamFilter);
          if (!targetOwner) return null;

          const teamPlayers = players.filter(p => p.ownerId === targetOwner.id && p.status === 'SOLD');
          const chipsLeft = getChipsLeft(targetOwner);
          const girlsCount = teamPlayers.filter(p => p.gender === 'Female').length;
          const minGirls = auctionState.minGirlsCount || 4;

          // Filter players inside this squad
          const filtered = teamPlayers.filter(player => {
            const matchSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchGender = genderFilter === 'ALL' || player.gender === genderFilter;
            return matchSearch && matchGender;
          });

          return (
            <div className="space-y-6">
              
              {/* Squad Header summary */}
              <div 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121212] border border-white/10" 
                style={{ borderLeft: `6px solid ${targetOwner.color}` }}
              >
                <div>
                  <h4 className="text-lg font-black text-white">{targetOwner.name} Squad</h4>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    Chips left: <span className="text-fala-green font-mono">🪙 {chipsLeft.toLocaleString()}</span>
                  </p>
                  {(() => {
                    const ownerPlayer = players.find(p => p.id === targetOwner.ownerPlayerId);
                    const coOwnerPlayer = players.find(p => p.id === targetOwner.coOwnerPlayerId);
                    if (!ownerPlayer && !coOwnerPlayer) return null;
                    return (
                      <div className="mt-2 text-[10px] font-bold space-y-0.5 uppercase text-slate-400">
                        {ownerPlayer && (
                          <p className="truncate">
                            👑 Owner: <span className="text-slate-200 font-extrabold">{ownerPlayer.name}</span>
                          </p>
                        )}
                        {coOwnerPlayer && (
                          <p className="truncate">
                            🤝 Co-Owner: <span className="text-slate-200 font-extrabold">{coOwnerPlayer.name}</span>
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex gap-2">
                  <div className="bg-black/30 border border-white/5 px-3 py-1.5 rounded-xl text-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Roster Size</span>
                    <span className="text-xs font-bold text-slate-300">
                      {teamPlayers.length} / {auctionState.maxTeamSize || 15}
                    </span>
                  </div>
                  <div className="bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-xl text-center">
                    <span className="text-[9px] text-[#10b981] font-bold uppercase block">Girls Recruited</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {girlsCount} / {minGirls}
                    </span>
                  </div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-16 text-center text-slate-500 border border-dashed border-white/10 rounded-3xl bg-[#121212]/30">
                  <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-400">No players matched your selection</p>
                  <p className="text-xs text-slate-500 mt-1">Adjust search or gender filters to view won squad members.</p>
                </div>
              ) : (
                /* Gorgeous grid of static player cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map(player => (
                    <div key={player.id}>
                      <PlayerCard 
                        player={player} 
                        owners={owners} 
                        isActive={false}
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
  );
}

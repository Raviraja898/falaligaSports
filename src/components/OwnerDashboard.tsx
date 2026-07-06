import React, { useState } from 'react';
import { Player, Owner, Bid, AuctionState } from '../types';
import { PlayerCard, RulesBoard } from './CommonUI';
import { 
  Trophy, 
  Wallet, 
  Users, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle 
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
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [sportFilter, setSportFilter] = useState<string>('ALL');

  // Filter won/sold players
  const soldPlayers = players.filter(p => p.status === 'SOLD' && p.ownerId);

  // Filter logic for players
  const filteredPlayers = soldPlayers.filter(player => {
    const matchSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTeam = teamFilter === 'ALL' || player.ownerId === teamFilter;
    const matchGender = genderFilter === 'ALL' || player.gender === genderFilter;
    
    let matchSport = true;
    if (sportFilter !== 'ALL') {
      const stats = player.stats as Record<string, number> | undefined;
      if (stats) {
        const val = stats[sportFilter.toLowerCase()];
        matchSport = val !== undefined && val >= 75; // high proficiency
      } else {
        matchSport = false;
      }
    }

    return matchSearch && matchTeam && matchGender && matchSport;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fala-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100 tracking-tight">
                FALABELLA TEAM SQUADS HUB
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Explore teams, track budgets, and inspect completed rosters</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider">
              Offline Bidding Roster Status
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-[#121212] border border-white/10 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 font-display">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Teams and Rosters
          </h3>
          <span className="text-[10px] text-slate-500 font-bold font-mono">
            Drafted Count: {soldPlayers.length} / {players.length} Players
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drafted player's name..."
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-xs focus:outline-none transition-all placeholder:text-slate-500 text-slate-200"
            />
          </div>

          {/* Team Filter */}
          <div className="lg:col-span-3">
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-xs focus:outline-none text-slate-300 font-bold cursor-pointer"
            >
              <option value="ALL">All Falabella Teams</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  Team: {owner.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="lg:col-span-2">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-xs focus:outline-none text-slate-300 font-bold cursor-pointer"
            >
              <option value="ALL">All Genders</option>
              <option value="Female">Girls / Females 👩</option>
              <option value="Male">Boys / Males 👨</option>
            </select>
          </div>

          {/* Sport Filter */}
          <div className="lg:col-span-3">
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-xs focus:outline-none text-slate-300 font-bold cursor-pointer"
            >
              <option value="ALL">All Sport Proficiencies</option>
              <option value="Badminton">Proficient Badminton (≥75%)</option>
              <option value="Carroms">Proficient Carroms (≥75%)</option>
              <option value="Cricket">Proficient Cricket (≥75%)</option>
              <option value="Football">Proficient Football (≥75%)</option>
              <option value="Tt">Proficient TT (≥75%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Boards Section */}
      {teamFilter === 'ALL' && searchQuery === '' && genderFilter === 'ALL' && sportFilter === 'ALL' ? (
        /* Team summaries grid - Shows all teams side-by-side with budgets, rosters and rules */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {owners.map(owner => {
            const teamRoster = players.filter(p => p.ownerId === owner.id && p.status === 'SOLD');
            const totalSpent = teamRoster.reduce((sum, p) => sum + (p.winningBid || 0), 0);
            const remainingWallet = owner.wallet; // already synced from Firebase
            const girlsCount = teamRoster.filter(p => p.gender === 'Female').length;
            const boysCount = teamRoster.filter(p => p.gender === 'Male').length;
            
            const maxLimit = auctionState.maxTeamSize || 15;
            const minGirls = auctionState.minGirlsCount || 4;
            const hasEnoughGirls = girlsCount >= minGirls;
            const withinSize = teamRoster.length <= maxLimit;

            return (
              <div 
                key={owner.id}
                className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-4"
                style={{ borderTop: `4px solid ${owner.color}` }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: owner.color }} />
                    <h3 className="font-extrabold text-sm text-white tracking-tight truncate">{owner.name}</h3>
                  </div>

                  {/* Chips left displayed very small under team name */}
                  <span className="text-[10px] text-amber-400 font-mono font-bold block mb-3">
                    🪙 {remainingWallet.toLocaleString()} chips left
                  </span>

                  {/* Roster stats mini dashboard */}
                  <div className="space-y-1.5 text-[11px] text-slate-400 bg-black/40 p-2.5 rounded-xl border border-white/5 font-medium">
                    <div className="flex justify-between">
                      <span>Roster Size:</span>
                      <span className={`font-bold ${withinSize ? 'text-slate-300' : 'text-rose-400'}`}>
                        {teamRoster.length} / {maxLimit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Girls Recruited:</span>
                      <span className={`font-bold ${hasEnoughGirls ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {girlsCount} / {minGirls}
                      </span>
                    </div>
                  </div>

                  {/* Compliance Indicator */}
                  <div className="mt-3">
                    {!hasEnoughGirls ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                        ⚠️ NEED {minGirls - girlsCount} GIRL(S)
                      </span>
                    ) : teamRoster.length > maxLimit ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                        ⚠️ ROSTER OVERLIMIT
                      </span>
                    ) : teamRoster.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                        ✅ COMPLIANT ROSTER
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        EMPTY SQUAD
                      </span>
                    )}
                  </div>
                </div>

                {/* Won Competitors list */}
                <div className="border-t border-white/5 pt-3 flex-1 flex flex-col justify-end">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Drafted Athletes</h4>
                  {teamRoster.length === 0 ? (
                    <p className="text-[10px] text-slate-600 italic">No competitors drafted yet</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin pr-0.5">
                      {teamRoster.map(player => (
                        <div 
                          key={player.id}
                          className="flex items-center justify-between p-1.5 bg-black/20 rounded border border-white/5 text-[10px] font-medium"
                        >
                          <span className="text-slate-300 truncate pr-1">
                            {player.photoUrl} {player.name.split(' "')[0]}
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
      ) : (
        /* Filtered/Selected Roster view */
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-display">
              Matching Drafted Competitors ({filteredPlayers.length})
            </h4>
            <button 
              onClick={() => {
                setSearchQuery('');
                setTeamFilter('ALL');
                setGenderFilter('ALL');
                setSportFilter('ALL');
              }}
              className="text-[10px] font-black uppercase tracking-wider text-fala-blue hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

          {filteredPlayers.length === 0 ? (
            <div className="bg-black/20 border border-dashed border-white/10 p-12 text-center rounded-2xl text-xs text-slate-500">
              No competitors won match the specified search and filter options. Try clearing filters!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlayers.map(player => (
                <div key={player.id}>
                  <PlayerCard player={player} owners={owners} isActive={false} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rules Overview Footer */}
      <RulesBoard />
    </div>
  );
}

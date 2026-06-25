export interface Player {
  id: string;
  name: string;
  role: string; // e.g., "Fullstack Specialist", "Product Guru", "QA Ninja", "Marketing Whiz"
  skillRating: number; // 1-100
  basePrice: number; // e.g. 50 coins
  status: 'AVAILABLE' | 'BIDDING' | 'SOLD' | 'UNSOLD';
  ownerId?: string; // id of the winning owner
  winningBid?: number;
  photoUrl?: string; // funny emoji or placeholder
  stats: {
    badminton?: number;
    carroms?: number;
    cricket?: number;
    football?: number;
    tt?: number;
  };
  gender: 'Male' | 'Female';
  falaLeague?: string; // e.g. "First Place", "Second Place", "Third Place", or undefined
}

export interface Owner {
  id: string; // e.g. "tech-titans", "product-pirates", etc.
  name: string;
  color: string; // hex or tailwind class for team styling
  wallet: number; // remaining budget (starts at e.g. 1000)
  initialWallet: number;
  password?: string;
}

export interface Bid {
  id: string;
  playerId: string;
  ownerId: string;
  ownerName: string;
  amount: number;
  timestamp: number;
}

export interface AuctionState {
  activePlayerId: string | null;
  status: 'IDLE' | 'BIDDING' | 'REVEALED' | 'TIE_RESOLUTION' | 'FINISHED';
  timer?: number; // optional countdown timer if we want automated bids
  tiedOwners?: string[]; // ownerIds that are tied in bidding
  originalWinningAmount?: number; // the amount that was tied
  maxTeamSize?: number; // configurable team size limit (e.g. 15-20)
  minGirlsCount?: number; // configurable minimum girls required per team (e.g. 4)
  autoRandomMode?: boolean; // automatically draft next random player
}

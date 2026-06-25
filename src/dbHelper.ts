import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, Owner, Bid, AuctionState } from './types';
import { INITIAL_PLAYERS, INITIAL_OWNERS } from './initialData';

// Helper to seed or reset the database
export async function seedDatabase() {
  const batch = writeBatch(db);

  // 1. Reset /auction/status
  const statusRef = doc(db, 'auction', 'status');
  batch.set(statusRef, {
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0,
    maxTeamSize: 15,
    minGirlsCount: 4
  });

  // 2. Clear old owners & write initial owners
  const ownersSnap = await getDocs(collection(db, 'owners'));
  ownersSnap.forEach((d) => {
    batch.delete(doc(db, 'owners', d.id));
  });
  INITIAL_OWNERS.forEach((owner) => {
    const ownerRef = doc(db, 'owners', owner.id);
    batch.set(ownerRef, owner);
  });

  // 3. Clear old players & write initial players
  const playersSnap = await getDocs(collection(db, 'players'));
  playersSnap.forEach((d) => {
    batch.delete(doc(db, 'players', d.id));
  });
  INITIAL_PLAYERS.forEach((player) => {
    const playerRef = doc(db, 'players', player.id);
    batch.set(playerRef, player);
  });

  // 4. Clear old bids
  const bidsSnap = await getDocs(collection(db, 'bids'));
  bidsSnap.forEach((d) => {
    batch.delete(doc(db, 'bids', d.id));
  });

  await batch.commit();
}

// Set active player to start bidding
export async function setActivePlayer(playerId: string) {
  const batch = writeBatch(db);

  // Set active player in status doc
  const statusRef = doc(db, 'auction', 'status');
  batch.update(statusRef, {
    activePlayerId: playerId,
    status: 'BIDDING',
    tiedOwners: [],
    originalWinningAmount: 0
  });

  // Set player's status to BIDDING
  const playerRef = doc(db, 'players', playerId);
  batch.update(playerRef, { status: 'BIDDING' });

  // Clear bids for the new active player from any previous attempt
  const bidsSnap = await getDocs(query(collection(db, 'bids'), where('playerId', '==', playerId)));
  bidsSnap.forEach((d) => {
    batch.delete(doc(db, 'bids', d.id));
  });

  await batch.commit();
}

// Place/update bid for an owner
export async function placeBid(playerId: string, ownerId: string, ownerName: string, amount: number) {
  // Use a unique document id: playerId_ownerId
  const bidId = `${playerId}_${ownerId}`;
  const bidRef = doc(db, 'bids', bidId);
  await setDoc(bidRef, {
    id: bidId,
    playerId,
    ownerId,
    ownerName,
    amount,
    timestamp: Date.now()
  });
}

// Reveal bids
export async function revealBids() {
  const statusRef = doc(db, 'auction', 'status');
  await updateDoc(statusRef, { status: 'REVEALED' });
}

// Resolve auction - Sold
export async function resolveAuction(
  playerId: string, 
  winningOwnerId: string, 
  winningAmount: number,
  currentWallet: number
) {
  const batch = writeBatch(db);

  // 1. Update player status
  const playerRef = doc(db, 'players', playerId);
  batch.update(playerRef, {
    status: 'SOLD',
    ownerId: winningOwnerId,
    winningBid: winningAmount
  });

  // 2. Deduct amount from owner's wallet
  const ownerRef = doc(db, 'owners', winningOwnerId);
  batch.update(ownerRef, {
    wallet: Math.max(0, currentWallet - winningAmount)
  });

  // 3. Reset auction status to IDLE
  const statusRef = doc(db, 'auction', 'status');
  batch.update(statusRef, {
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0
  });

  await batch.commit();
}

// Resolve auction - Unsold
export async function resolveUnsold(playerId: string) {
  const batch = writeBatch(db);

  // 1. Update player status
  const playerRef = doc(db, 'players', playerId);
  batch.update(playerRef, {
    status: 'UNSOLD'
  });

  // 2. Reset auction status to IDLE
  const statusRef = doc(db, 'auction', 'status');
  batch.update(statusRef, {
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0
  });

  await batch.commit();
}

// Set tie resolution state
export async function startTieResolution(playerId: string, tiedOwnerIds: string[], originalAmount: number) {
  const statusRef = doc(db, 'auction', 'status');
  await updateDoc(statusRef, {
    activePlayerId: playerId,
    status: 'TIE_RESOLUTION',
    tiedOwners: tiedOwnerIds,
    originalWinningAmount: originalAmount
  });
}

// Update auction configurations
export async function updateAuctionSettings(maxTeamSize: number, minGirlsCount: number) {
  const statusRef = doc(db, 'auction', 'status');
  await updateDoc(statusRef, {
    maxTeamSize,
    minGirlsCount
  });
}

// Add a new player
export async function addPlayer(player: Player) {
  const playerRef = doc(db, 'players', player.id);
  await setDoc(playerRef, player);
}

// Add a new team owner
export async function addOwner(owner: Owner) {
  const ownerRef = doc(db, 'owners', owner.id);
  await setDoc(ownerRef, owner);
}

// Helper to delete a specific bid (e.g. if an owner wants to withdraw, though they usually can just edit it)
export async function deleteBid(playerId: string, ownerId: string) {
  const bidId = `${playerId}_${ownerId}`;
  await deleteDoc(doc(db, 'bids', bidId));
}

// Delete a player and handle budget refunds if sold
export async function deletePlayer(playerId: string) {
  const batch = writeBatch(db);
  const playerRef = doc(db, 'players', playerId);
  const playerSnap = await getDoc(playerRef);
  
  if (playerSnap.exists()) {
    const playerData = playerSnap.data() as Player;
    if (playerData.status === 'SOLD' && playerData.ownerId && playerData.winningBid) {
      const ownerRef = doc(db, 'owners', playerData.ownerId);
      const ownerSnap = await getDoc(ownerRef);
      if (ownerSnap.exists()) {
        const ownerData = ownerSnap.data() as Owner;
        batch.update(ownerRef, {
          wallet: (ownerData.wallet || 0) + playerData.winningBid
        });
      }
    }
    batch.delete(playerRef);
  }
  
  // Clear bids for this player
  const bidsSnap = await getDocs(query(collection(db, 'bids'), where('playerId', '==', playerId)));
  bidsSnap.forEach((d) => {
    batch.delete(doc(db, 'bids', d.id));
  });
  
  // Reset active player if it was this player
  const statusRef = doc(db, 'auction', 'status');
  const statusSnap = await getDoc(statusRef);
  if (statusSnap.exists()) {
    const statusData = statusSnap.data() as AuctionState;
    if (statusData.activePlayerId === playerId) {
      batch.update(statusRef, {
        activePlayerId: null,
        status: 'IDLE',
        tiedOwners: [],
        originalWinningAmount: 0
      });
    }
  }
  
  await batch.commit();
}

// Delete an owner and reset their won players
export async function deleteOwner(ownerId: string) {
  const batch = writeBatch(db);
  const ownerRef = doc(db, 'owners', ownerId);
  batch.delete(ownerRef);
  
  // Reset players won by this owner
  const playersSnap = await getDocs(query(collection(db, 'players'), where('ownerId', '==', ownerId)));
  playersSnap.forEach((d) => {
    batch.update(doc(db, 'players', d.id), {
      status: 'AVAILABLE',
      ownerId: null,
      winningBid: null
    });
  });
  
  // Clear bids placed by this owner
  const bidsSnap = await getDocs(query(collection(db, 'bids'), where('ownerId', '==', ownerId)));
  bidsSnap.forEach((d) => {
    batch.delete(doc(db, 'bids', d.id));
  });
  
  await batch.commit();
}

// Restart player's bid to AVAILABLE and refund wallet if sold
export async function restartPlayerBid(playerId: string) {
  const batch = writeBatch(db);
  const playerRef = doc(db, 'players', playerId);
  const playerSnap = await getDoc(playerRef);
  
  if (playerSnap.exists()) {
    const playerData = playerSnap.data() as Player;
    if (playerData.status === 'SOLD' && playerData.ownerId && playerData.winningBid) {
      const ownerRef = doc(db, 'owners', playerData.ownerId);
      const ownerSnap = await getDoc(ownerRef);
      if (ownerSnap.exists()) {
        const ownerData = ownerSnap.data() as Owner;
        batch.update(ownerRef, {
          wallet: (ownerData.wallet || 0) + playerData.winningBid
        });
      }
    }
    
    batch.update(playerRef, {
      status: 'AVAILABLE',
      ownerId: null,
      winningBid: null
    });
  }
  
  // Clear bids for this player
  const bidsSnap = await getDocs(query(collection(db, 'bids'), where('playerId', '==', playerId)));
  bidsSnap.forEach((d) => {
    batch.delete(doc(db, 'bids', d.id));
  });
  
  // Reset active player if it was this player
  const statusRef = doc(db, 'auction', 'status');
  const statusSnap = await getDoc(statusRef);
  if (statusSnap.exists()) {
    const statusData = statusSnap.data() as AuctionState;
    if (statusData.activePlayerId === playerId) {
      batch.update(statusRef, {
        activePlayerId: null,
        status: 'IDLE',
        tiedOwners: [],
        originalWinningAmount: 0
      });
    }
  }
  
  await batch.commit();
}

// Set owner password
export async function updateOwnerPassword(ownerId: string, password: string) {
  const ownerRef = doc(db, 'owners', ownerId);
  await updateDoc(ownerRef, { password });
}

// Reschedule tied player to a random new position in the pool
export async function rescheduleTiedPlayer(playerId: string) {
  const batch = writeBatch(db);
  const playerRef = doc(db, 'players', playerId);
  const playerSnap = await getDoc(playerRef);
  
  if (playerSnap.exists()) {
    const playerData = playerSnap.data() as Player;
    
    // Create new player ref with a new ID to randomize position
    const newId = `player_${Date.now()}`;
    const newPlayerRef = doc(db, 'players', newId);
    
    batch.set(newPlayerRef, {
      ...playerData,
      id: newId,
      status: 'AVAILABLE',
      ownerId: null,
      winningBid: null
    });
    
    // Delete the old player
    batch.delete(playerRef);
  }

  // Clear bids for this player
  const bidsSnap = await getDocs(query(collection(db, 'bids'), where('playerId', '==', playerId)));
  bidsSnap.forEach((d) => {
    batch.delete(doc(db, 'bids', d.id));
  });

  // Reset auction status to IDLE
  const statusRef = doc(db, 'auction', 'status');
  batch.update(statusRef, {
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0
  });

  await batch.commit();
}

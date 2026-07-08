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
    minGirlsCount: 4,
    defaultMinBid: 5000,
    autoRandomMode: false,
    lastSoldPlayerId: null
  });

  // 2. Clear old owners & write initial owners
  const ownersSnap = await getDocs(collection(db, 'owners'));
  ownersSnap.forEach((d) => {
    batch.delete(doc(db, 'owners', d.id));
  });
  INITIAL_OWNERS.forEach((owner) => {
    const ownerRef = doc(db, 'owners', owner.id);
    const sanitizedOwner = JSON.parse(JSON.stringify(owner));
    batch.set(ownerRef, sanitizedOwner);
  });

  // 3. Clear old players & write initial players
  const playersSnap = await getDocs(collection(db, 'players'));
  playersSnap.forEach((d) => {
    batch.delete(doc(db, 'players', d.id));
  });
  INITIAL_PLAYERS.forEach((player) => {
    const playerRef = doc(db, 'players', player.id);
    const sanitizedPlayer = JSON.parse(JSON.stringify(player));
    batch.set(playerRef, sanitizedPlayer);
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
    originalWinningAmount: 0,
    lastSoldPlayerId: playerId
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
export async function updateAuctionSettings(maxTeamSize: number, minGirlsCount: number, defaultMinBid: number) {
  const statusRef = doc(db, 'auction', 'status');
  await updateDoc(statusRef, {
    maxTeamSize,
    minGirlsCount,
    defaultMinBid
  });
}

// Add a new player
export async function addPlayer(player: Player) {
  const sanitized = JSON.parse(JSON.stringify(player));
  const playerRef = doc(db, 'players', player.id);
  await setDoc(playerRef, sanitized);
}

// Add a new team owner
export async function addOwner(owner: Owner) {
  const sanitized = JSON.parse(JSON.stringify(owner));
  const ownerRef = doc(db, 'owners', owner.id);
  await setDoc(ownerRef, sanitized);
}

// Helper to delete a specific bid (e.g. if an owner wants to withdraw, though they usually can just edit it)
export async function deleteBid(playerId: string, ownerId: string) {
  const bidId = `${playerId}_${ownerId}`;
  await deleteDoc(doc(db, 'bids', bidId));
}

// Delete a player and handle budget refunds if sold
export async function deletePlayer(playerId: string) {
  const playerRef = doc(db, 'players', playerId);
  const playerSnap = await getDoc(playerRef);
  
  if (playerSnap.exists()) {
    const playerData = playerSnap.data() as Player;
    if (playerData.status === 'SOLD' && playerData.ownerId && playerData.winningBid) {
      const ownerRef = doc(db, 'owners', playerData.ownerId);
      const ownerSnap = await getDoc(ownerRef);
      if (ownerSnap.exists()) {
        const ownerData = ownerSnap.data() as Owner;
        await updateDoc(ownerRef, {
          wallet: (ownerData.wallet || 0) + playerData.winningBid
        });
      }
    }
    await deleteDoc(playerRef);
  }
  
  // Clear bids for this player
  const bidsSnap = await getDocs(query(collection(db, 'bids'), where('playerId', '==', playerId)));
  for (const d of bidsSnap.docs) {
    await deleteDoc(doc(db, 'bids', d.id));
  }
  
  // Reset active player if it was this player
  const statusRef = doc(db, 'auction', 'status');
  const statusSnap = await getDoc(statusRef);
  if (statusSnap.exists()) {
    const statusData = statusSnap.data() as AuctionState;
    if (statusData.activePlayerId === playerId) {
      await updateDoc(statusRef, {
        activePlayerId: null,
        status: 'IDLE',
        tiedOwners: [],
        originalWinningAmount: 0
      });
    }
  }
}

// Delete all players from the tournament and reset owners' wallets
export async function deleteAllPlayers() {
  // 1. Delete all players
  const playersSnap = await getDocs(collection(db, 'players'));
  for (const d of playersSnap.docs) {
    await deleteDoc(doc(db, 'players', d.id));
  }

  // 2. Delete all bids
  const bidsSnap = await getDocs(collection(db, 'bids'));
  for (const d of bidsSnap.docs) {
    await deleteDoc(doc(db, 'bids', d.id));
  }

  // 3. Reset owners' wallets to initialWallet
  const ownersSnap = await getDocs(collection(db, 'owners'));
  for (const d of ownersSnap.docs) {
    const ownerData = d.data() as Owner;
    await updateDoc(doc(db, 'owners', d.id), {
      wallet: ownerData.initialWallet || 1000
    });
  }

  // 4. Reset active auction status
  const statusRef = doc(db, 'auction', 'status');
  await updateDoc(statusRef, {
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0
  });
}

// Update / Edit an existing player details with self-correcting wallet balance sync
export async function updatePlayer(player: Player) {
  const playerRef = doc(db, 'players', player.id);
  const playerSnap = await getDoc(playerRef);
  
  if (!playerSnap.exists()) {
    const sanitized = JSON.parse(JSON.stringify(player));
    await setDoc(playerRef, sanitized, { merge: true });
    return;
  }
  
  const oldPlayer = playerSnap.data() as Player;
  const batch = writeBatch(db);
  
  // 1. Refund old owner if previously SOLD
  if (oldPlayer.status === 'SOLD' && oldPlayer.ownerId && oldPlayer.winningBid) {
    const oldOwnerRef = doc(db, 'owners', oldPlayer.ownerId);
    const oldOwnerSnap = await getDoc(oldOwnerRef);
    if (oldOwnerSnap.exists()) {
      const oldOwner = oldOwnerSnap.data() as Owner;
      batch.update(oldOwnerRef, {
        wallet: (oldOwner.wallet || 0) + oldPlayer.winningBid
      });
    }
  }
  
  // 2. Deduct new owner if currently SOLD
  if (player.status === 'SOLD' && player.ownerId && player.winningBid) {
    const newOwnerRef = doc(db, 'owners', player.ownerId);
    const newOwnerSnap = await getDoc(newOwnerRef);
    if (newOwnerSnap.exists()) {
      const newOwner = newOwnerSnap.data() as Owner;
      let finalWallet = (newOwner.wallet || 0) - player.winningBid;
      if (oldPlayer.status === 'SOLD' && oldPlayer.ownerId === player.ownerId) {
        // Same owner, so just adjust
        finalWallet = (newOwner.wallet || 0) + (oldPlayer.winningBid || 0) - player.winningBid;
      }
      batch.update(newOwnerRef, {
        wallet: Math.max(0, finalWallet)
      });
    }
  }
  
  // 3. Update player
  const sanitized = JSON.parse(JSON.stringify(player));
  batch.set(playerRef, sanitized, { merge: true });
  await batch.commit();
}

// Delete an owner and reset their won players
export async function deleteOwner(ownerId: string) {
  const ownerRef = doc(db, 'owners', ownerId);
  await deleteDoc(ownerRef);
  
  // Reset players won by this owner
  const playersSnap = await getDocs(query(collection(db, 'players'), where('ownerId', '==', ownerId)));
  for (const d of playersSnap.docs) {
    await updateDoc(doc(db, 'players', d.id), {
      status: 'AVAILABLE',
      ownerId: null,
      winningBid: null
    });
  }
  
  // Clear bids placed by this owner
  const bidsSnap = await getDocs(query(collection(db, 'bids'), where('ownerId', '==', ownerId)));
  for (const d of bidsSnap.docs) {
    await deleteDoc(doc(db, 'bids', d.id));
  }

  // Clean up active auction tiedOwners references
  const statusRef = doc(db, 'auction', 'status');
  const statusSnap = await getDoc(statusRef);
  if (statusSnap.exists()) {
    const statusData = statusSnap.data() as AuctionState;
    if (statusData.tiedOwners?.includes(ownerId)) {
      const updatedTies = (statusData.tiedOwners || []).filter(id => id !== ownerId);
      if (updatedTies.length < 2) {
        await updateDoc(statusRef, {
          activePlayerId: null,
          status: 'IDLE',
          tiedOwners: [],
          originalWinningAmount: 0
        });
      } else {
        await updateDoc(statusRef, {
          tiedOwners: updatedTies
        });
      }
    }
  }
}

// Delete all owners/teams from the tournament database
export async function deleteAllOwners() {
  // 1. Delete all owners
  const ownersSnap = await getDocs(collection(db, 'owners'));
  for (const d of ownersSnap.docs) {
    await deleteDoc(doc(db, 'owners', d.id));
  }

  // 2. Reset all players to AVAILABLE, ownerId = null, winningBid = null
  const playersSnap = await getDocs(collection(db, 'players'));
  for (const d of playersSnap.docs) {
    await updateDoc(doc(db, 'players', d.id), {
      status: 'AVAILABLE',
      ownerId: null,
      winningBid: null
    });
  }

  // 3. Delete all bids
  const bidsSnap = await getDocs(collection(db, 'bids'));
  for (const d of bidsSnap.docs) {
    await deleteDoc(doc(db, 'bids', d.id));
  }

  // 4. Reset active auction status
  const statusRef = doc(db, 'auction', 'status');
  await updateDoc(statusRef, {
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0
  });
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
    
    const sanitizedData = JSON.parse(JSON.stringify({
      ...playerData,
      id: newId,
      status: 'AVAILABLE',
      ownerId: null,
      winningBid: null
    }));
    batch.set(newPlayerRef, sanitizedData);
    
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

// Toggle auto random mode
export async function setAutoRandomMode(enabled: boolean) {
  const statusRef = doc(db, 'auction', 'status');
  await updateDoc(statusRef, { autoRandomMode: enabled });
}

// Export complete backup of the auction database
export async function exportAuctionBackup() {
  const playersSnap = await getDocs(collection(db, 'players'));
  const ownersSnap = await getDocs(collection(db, 'owners'));
  const bidsSnap = await getDocs(collection(db, 'bids'));
  const statusSnap = await getDoc(doc(db, 'auction', 'status'));

  const players: any[] = [];
  playersSnap.forEach((d) => players.push(d.data()));

  const owners: any[] = [];
  ownersSnap.forEach((d) => owners.push(d.data()));

  const bids: any[] = [];
  bidsSnap.forEach((d) => bids.push(d.data()));

  const auctionStatus = statusSnap.exists() ? statusSnap.data() : null;

  return {
    players,
    owners,
    bids,
    auctionStatus,
    timestamp: Date.now(),
    version: '1.0'
  };
}

// Import complete backup and restore database
export async function importAuctionBackup(backupData: any) {
  if (!backupData || !Array.isArray(backupData.players) || !Array.isArray(backupData.owners)) {
    throw new Error('Invalid backup file structure.');
  }

  // Clear existing collections in chunks
  const playersSnap = await getDocs(collection(db, 'players'));
  const ownersSnap = await getDocs(collection(db, 'owners'));
  const bidsSnap = await getDocs(collection(db, 'bids'));

  // Commit deletion of everything in chunk batches
  const deleteWrites: any[] = [];
  playersSnap.forEach((d) => deleteWrites.push(doc(db, 'players', d.id)));
  ownersSnap.forEach((d) => deleteWrites.push(doc(db, 'owners', d.id)));
  bidsSnap.forEach((d) => deleteWrites.push(doc(db, 'bids', d.id)));

  const deleteChunkSize = 400;
  for (let i = 0; i < deleteWrites.length; i += deleteChunkSize) {
    const chunk = deleteWrites.slice(i, i + deleteChunkSize);
    const deleteBatch = writeBatch(db);
    chunk.forEach((ref) => deleteBatch.delete(ref));
    await deleteBatch.commit();
  }

  // Gather new data to write
  const allWrites: { ref: any, data: any }[] = [];

  // Auction status
  if (backupData.auctionStatus) {
    allWrites.push({
      ref: doc(db, 'auction', 'status'),
      data: backupData.auctionStatus
    });
  }

  backupData.players.forEach((p: any) => {
    allWrites.push({
      ref: doc(db, 'players', p.id),
      data: p
    });
  });

  backupData.owners.forEach((o: any) => {
    allWrites.push({
      ref: doc(db, 'owners', o.id),
      data: o
    });
  });

  if (Array.isArray(backupData.bids)) {
    backupData.bids.forEach((b: any) => {
      allWrites.push({
        ref: doc(db, 'bids', b.id),
        data: b
      });
    });
  }

  // Execute writes in batches of 400
  const writeChunkSize = 400;
  for (let i = 0; i < allWrites.length; i += writeChunkSize) {
    const chunk = allWrites.slice(i, i + writeChunkSize);
    const writeBatchInstance = writeBatch(db);
    chunk.forEach((item) => {
      writeBatchInstance.set(item.ref, item.data);
    });
    await writeBatchInstance.commit();
  }
}

// Update team staff (owner and co-owner player IDs)
export async function updateOwnerTeamStaff(ownerId: string, ownerPlayerId: string | null, coOwnerPlayerId: string | null) {
  const ownerRef = doc(db, 'owners', ownerId);
  await updateDoc(ownerRef, {
    ownerPlayerId: ownerPlayerId || null,
    coOwnerPlayerId: coOwnerPlayerId || null
  });
}

// Add an image to the database gallery
export async function addGalleryImage(name: string, dataUrl: string) {
  const imageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const imageRef = doc(db, 'gallery', imageId);
  await setDoc(imageRef, {
    id: imageId,
    name,
    dataUrl,
    timestamp: Date.now()
  });
}

// Delete an image from the database gallery
export async function deleteGalleryImage(imageId: string) {
  const imageRef = doc(db, 'gallery', imageId);
  await deleteDoc(imageRef);
}


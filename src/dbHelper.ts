import { Player, Owner, Bid, AuctionState } from './types';
import {
  LOCAL_AUCTION_STATE,
  LOCAL_DATA_VERSION,
  LOCAL_OWNERS,
  LOCAL_PLAYERS,
  getStoredAuctionState,
  getStoredBids,
  getStoredOwners,
  getStoredPlayers,
  setStoredAuctionState,
  setStoredBids,
  setStoredDataVersion,
  setStoredOwners,
  setStoredPlayers,
} from './localData';

const GALLERY_STORAGE_KEY = 'falaliga_gallery_images';

function notifyLocalDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('falaliga-local-data-updated'));
  }
}

function readLocalData() {
  const players = (getStoredPlayers() ?? LOCAL_PLAYERS).map((player) => ({ ...player }));
  const owners = (getStoredOwners() ?? LOCAL_OWNERS).map((owner) => ({ ...owner }));
  const bids = (getStoredBids() ?? []).map((bid) => ({ ...bid } as Bid));
  const auctionState = {
    ...LOCAL_AUCTION_STATE,
    ...(getStoredAuctionState() ?? {}),
  } as AuctionState;

  return { players, owners, bids, auctionState };
}

function persistLocalData(players: Player[], owners: Owner[], bids: Bid[], auctionState: AuctionState) {
  setStoredDataVersion(LOCAL_DATA_VERSION);
  setStoredPlayers(players);
  setStoredOwners(owners);
  setStoredBids(bids);
  setStoredAuctionState(auctionState);
  notifyLocalDataChanged();
}

function readGalleryImages(): any[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(GALLERY_STORAGE_KEY) || '[]');
  } catch (err) {
    console.error('Failed to read gallery data from localStorage:', err);
    return [];
  }
}

function persistGalleryImages(images: any[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(images));
    notifyLocalDataChanged();
  }
}

export async function seedDatabase() {
  const initialPlayers = LOCAL_PLAYERS.map((player) => ({ ...player }));
  const initialOwners = LOCAL_OWNERS.map((owner) => ({ ...owner }));
  const initialAuctionState: AuctionState = {
    ...LOCAL_AUCTION_STATE,
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0,
    lastSoldPlayerId: null,
  };

  persistLocalData(initialPlayers, initialOwners, [], initialAuctionState);
}

export async function setActivePlayer(playerId: string | null) {
  const { players, owners, bids, auctionState } = readLocalData();

  if (!playerId) {
    persistLocalData(players, owners, bids, {
      ...auctionState,
      activePlayerId: null,
      status: 'IDLE',
      tiedOwners: [],
      originalWinningAmount: 0,
    });
    return;
  }

  const nextPlayers = players.map((player) => ({
    ...player,
    status: player.id === playerId ? (player.status === 'SOLD' ? player.status : 'BIDDING') : (player.status === 'BIDDING' ? 'AVAILABLE' : player.status),
  }));

  persistLocalData(nextPlayers, owners, bids, {
    ...auctionState,
    activePlayerId: playerId,
    status: 'BIDDING',
    tiedOwners: [],
    originalWinningAmount: 0,
    lastSoldPlayerId: null,
  });
}

export async function revealBids() {
  const { players, owners, bids, auctionState } = readLocalData();
  persistLocalData(players, owners, bids, {
    ...auctionState,
    status: 'REVEALED',
  });
}

export async function resolveAuction(playerId: string, winningOwnerId: string, winningBid: number) {
  const { players, owners, bids, auctionState } = readLocalData();

  const nextPlayers = players.map((player) =>
    player.id === playerId
      ? { ...player, status: 'SOLD', ownerId: winningOwnerId, winningBid }
      : player
  );

  const nextOwners = owners.map((owner) =>
    owner.id === winningOwnerId
      ? { ...owner, wallet: Math.max(0, (owner.wallet || 0) - winningBid) }
      : owner
  );

  persistLocalData(nextPlayers, nextOwners, bids, {
    ...auctionState,
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0,
    lastSoldPlayerId: playerId,
  });
}

export async function resolveUnsold(playerId: string) {
  const { players, owners, bids, auctionState } = readLocalData();

  const nextPlayers = players.map((player) =>
    player.id === playerId
      ? { ...player, status: 'UNSOLD', ownerId: undefined, winningBid: undefined }
      : player
  );

  persistLocalData(nextPlayers, owners, bids, {
    ...auctionState,
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0,
  });
}

export async function startTieResolution(playerId: string, tiedOwners: string[], originalWinningAmount: number) {
  const { players, owners, bids, auctionState } = readLocalData();

  persistLocalData(players, owners, bids, {
    ...auctionState,
    activePlayerId: playerId,
    status: 'TIE_RESOLUTION',
    tiedOwners,
    originalWinningAmount,
  });
}

export async function addPlayer(player: Player) {
  const { players, owners, bids, auctionState } = readLocalData();
  persistLocalData([...players, player], owners, bids, auctionState);
}

export async function addOwner(owner: Owner) {
  const { players, owners, bids, auctionState } = readLocalData();
  persistLocalData(players, [...owners, owner], bids, auctionState);
}

export async function updateAuctionSettings(settings: Partial<AuctionState>) {
  const { players, owners, bids, auctionState } = readLocalData();
  persistLocalData(players, owners, bids, {
    ...auctionState,
    ...settings,
  });
}

export async function deletePlayer(playerId: string) {
  const { players, owners, bids, auctionState } = readLocalData();
  const nextPlayers = players.filter((player) => player.id !== playerId);
  const nextBids = bids.filter((bid) => bid.playerId !== playerId);

  persistLocalData(nextPlayers, owners, nextBids, {
    ...auctionState,
    activePlayerId: auctionState.activePlayerId === playerId ? null : auctionState.activePlayerId,
  });
}

export async function deleteOwner(ownerId: string) {
  const { players, owners, bids, auctionState } = readLocalData();
  const nextOwners = owners.filter((owner) => owner.id !== ownerId);

  persistLocalData(players, nextOwners, bids, auctionState);
}

export async function restartPlayerBid(playerId: string) {
  const { players, owners, bids, auctionState } = readLocalData();

  const nextPlayers = players.map((player) =>
    player.id === playerId
      ? { ...player, status: 'AVAILABLE', ownerId: undefined, winningBid: undefined }
      : player
  );

  persistLocalData(nextPlayers, owners, bids.filter((bid) => bid.playerId !== playerId), {
    ...auctionState,
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0,
  });
}

export async function updateOwnerPassword(ownerId: string, password: string) {
  const { players, owners, bids, auctionState } = readLocalData();
  const nextOwners = owners.map((owner) =>
    owner.id === ownerId ? { ...owner, password } : owner
  );

  persistLocalData(players, nextOwners, bids, auctionState);
}

export async function rescheduleTiedPlayer(playerId: string) {
  const { players, owners, bids, auctionState } = readLocalData();

  const nextPlayers = players.map((player) =>
    player.id === playerId
      ? { ...player, status: 'AVAILABLE', ownerId: undefined, winningBid: undefined }
      : player
  );

  persistLocalData(nextPlayers, owners, bids.filter((bid) => bid.playerId !== playerId), {
    ...auctionState,
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0,
  });
}

export async function setAutoRandomMode(enabled: boolean) {
  const { players, owners, bids, auctionState } = readLocalData();
  persistLocalData(players, owners, bids, {
    ...auctionState,
    autoRandomMode: enabled,
  });
}

export async function exportAuctionBackup() {
  const { players, owners, bids, auctionState } = readLocalData();

  return {
    players,
    owners,
    bids,
    auctionStatus: auctionState,
    timestamp: Date.now(),
    version: '1.0',
  };
}

export async function importAuctionBackup(backupData: any) {
  if (!backupData || !Array.isArray(backupData.players) || !Array.isArray(backupData.owners)) {
    throw new Error('Invalid backup file structure.');
  }

  const players = (backupData.players || []).map((player: any) => ({ ...player }));
  const owners = (backupData.owners || []).map((owner: any) => ({ ...owner }));
  const bids = Array.isArray(backupData.bids) ? backupData.bids.map((bid: any) => ({ ...bid })) : [];
  const auctionState = backupData.auctionStatus || { ...LOCAL_AUCTION_STATE };

  persistLocalData(players, owners, bids, auctionState);
}

export async function updateOwnerTeamStaff(ownerId: string, ownerPlayerId: string | null, coOwnerPlayerId: string | null) {
  const { players, owners, bids, auctionState } = readLocalData();
  const nextOwners = owners.map((owner) =>
    owner.id === ownerId
      ? { ...owner, ownerPlayerId: ownerPlayerId || null, coOwnerPlayerId: coOwnerPlayerId || null }
      : owner
  );

  persistLocalData(players, nextOwners, bids, auctionState);
}

export async function addGalleryImage(name: string, dataUrl: string) {
  const imageId = `image_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const images = [
    ...readGalleryImages(),
    { id: imageId, name, dataUrl, timestamp: Date.now() },
  ];
  persistGalleryImages(images);
}

export async function deleteGalleryImage(imageId: string) {
  const images = readGalleryImages().filter((image) => image.id !== imageId);
  persistGalleryImages(images);
}

export async function deleteAllPlayers() {
  const { owners, bids, auctionState } = readLocalData();
  persistLocalData([], owners, bids, {
    ...auctionState,
    activePlayerId: null,
    status: 'IDLE',
    tiedOwners: [],
    originalWinningAmount: 0,
  });
}

export async function updatePlayer(player: Player) {
  const { players, owners, bids, auctionState } = readLocalData();
  const nextPlayers = players.some((item) => item.id === player.id)
    ? players.map((item) => (item.id === player.id ? { ...item, ...player } : item))
    : [...players, player];

  persistLocalData(nextPlayers, owners, bids, auctionState);
}

export async function deleteAllOwners() {
  const { players, bids, auctionState } = readLocalData();
  persistLocalData(players, [], bids, auctionState);
}

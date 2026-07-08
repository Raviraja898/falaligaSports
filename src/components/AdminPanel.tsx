import React, { useState, useEffect } from 'react';
import { Player, Owner, Bid, AuctionState } from '../types';
import { 
  seedDatabase, 
  setActivePlayer, 
  revealBids, 
  resolveAuction, 
  resolveUnsold, 
  startTieResolution,
  addPlayer,
  addOwner,
  updateAuctionSettings,
  deletePlayer,
  deleteOwner,
  restartPlayerBid,
  updateOwnerPassword,
  rescheduleTiedPlayer,
  setAutoRandomMode,
  exportAuctionBackup,
  importAuctionBackup,
  deleteAllPlayers,
  updatePlayer,
  deleteAllOwners,
  updateOwnerTeamStaff,
  addGalleryImage,
  deleteGalleryImage
} from '../dbHelper';
import { PlayerCard, TieBreakerTool } from './CommonUI';
import { 
  Trophy, 
  RefreshCw, 
  Play, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  UserMinus, 
  Users, 
  Layers, 
  Check, 
  Award,
  CircleDot,
  PlusCircle,
  Sparkles,
  LogOut,
  UserPlus,
  ShieldCheck,
  Settings,
  Flame,
  CheckSquare,
  Trash2, 
  RotateCcw, 
  Key, 
  EyeOff, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Database,
  Edit,
  X
} from 'lucide-react';

interface AdminPanelProps {
  players: Player[];
  owners: Owner[];
  bids: Bid[];
  auctionState: AuctionState;
  onLogout?: () => void;
}

// CSV line splitter that handles quotes correctly
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Custom parser to parse CSV file content
function parseCSV(text: string): any[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine.trim());
      currentLine = '';
    } else if (char === '\r') {
      // ignore
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine.trim());
  }

  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
  const parsedRows: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const values = splitCSVLine(line).map(v => v.trim().replace(/^["']|["']$/g, ''));
    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] || '';
    });
    parsedRows.push(rowObj);
  }
  return parsedRows;
}

// Maps parsed row to Player interface
function mapCSVToPlayer(row: any, defaultMinBid: number): Player {
  const name = row.name || row['player name'] || row['fullname'] || row['full name'] || '';
  const role = 'Athlete';
  
  const skillRatingRaw = row.skillrating || row['skill rating'] || row['skill'] || row['rating'] || '80';
  const skillRating = Number(skillRatingRaw);

  const basePriceRaw = row.baseprice || row['base price'] || row['min bid'] || row['base bid'] || String(defaultMinBid);
  const basePrice = Number(basePriceRaw);

  const photoUrl = row.photourl || row['photo'] || row['image'] || row['avatar'] || row['emoji'] || '📊';
  
  const genderRaw = (row.gender || row['sex'] || 'Female').trim().toLowerCase();
  const gender: 'Male' | 'Female' = (genderRaw === 'male' || genderRaw === 'm' || genderRaw === 'boy' || genderRaw === 'man') ? 'Male' : 'Female';
  
  const falaLeague = row.falaleague || row['fala league'] || row['previous win'] || '';
  const comments = row.comments || row.comment || row['about'] || row['description'] || '';

  // Specific sports stats
  const badminton = Number(row.badminton || row['badminton rating'] || 75);
  const carroms = Number(row.carroms || row['carroms rating'] || 75);
  const cricket = Number(row.cricket || row['cricket rating'] || 75);
  const football = Number(row.football || row['football rating'] || 75);
  const tt = Number(row.tt || row['tt rating'] || row['table tennis'] || 75);

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const id = `${slug || 'player'}-${Math.random().toString(36).substr(2, 5)}`;

  return {
    id,
    name: name.trim(),
    role: role.trim(),
    skillRating: isNaN(skillRating) ? 80 : skillRating,
    basePrice: isNaN(basePrice) ? defaultMinBid : basePrice,
    status: 'AVAILABLE',
    photoUrl: photoUrl.trim() || '📊',
    gender,
    falaLeague: falaLeague ? falaLeague.trim() : undefined,
    comments: comments ? comments.trim() : undefined,
    stats: {
      badminton: isNaN(badminton) ? 75 : badminton,
      carroms: isNaN(carroms) ? 75 : carroms,
      cricket: isNaN(cricket) ? 75 : cricket,
      football: isNaN(football) ? 75 : football,
      tt: isNaN(tt) ? 75 : tt
    }
  };
}

export default function AdminPanel({ players, owners, bids, auctionState, onLogout }: AdminPanelProps) {
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<'auction' | 'players' | 'rosters' | 'manage' | 'gallery'>('auction');
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [bulkUploadStatus, setBulkUploadStatus] = useState<{ current: number; total: number; msg: string } | null>(null);

  // Auto-Match & Link Gallery Photos to Player Profiles
  const handleAutoLinkPhotos = async () => {
    if (galleryImages.length === 0) {
      alert("Please upload some images to the gallery first!");
      return;
    }
    if (players.length === 0) {
      alert("No players registered in the database to link!");
      return;
    }

    const confirmLink = confirm(
      `Auto-Link will find photos in the gallery whose names match player names (e.g. image name "John Doe" matching player "John Doe"). If found, it will automatically link them in the database. Proceed?`
    );
    if (!confirmLink) return;

    let linkedCount = 0;
    setResetting(true);

    try {
      for (const player of players) {
        const pNameClean = player.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (!pNameClean) continue;
        
        // Find exact or substring match in galleryImages
        const matchedImg = galleryImages.find(img => {
          const imgNameClean = img.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
          return imgNameClean === pNameClean || 
                 imgNameClean.includes(pNameClean) || 
                 pNameClean.includes(imgNameClean);
        });

        if (matchedImg) {
          await updatePlayer({
            ...player,
            photoUrl: matchedImg.dataUrl
          });
          linkedCount++;
        }
      }
      alert(`Auto-Linking complete! 🎉 Successfully matched and updated ${linkedCount} player profiles in real-time!`);
    } catch (err) {
      console.error("Error auto-linking images:", err);
      alert("Failed to auto-link photos to player profiles.");
    } finally {
      setResetting(false);
    }
  };

  // Subscribe to the local gallery snapshot.
  useEffect(() => {
    const syncGalleryImages = () => {
      if (typeof window === 'undefined') {
        setGalleryImages([]);
        return;
      }

      try {
        const raw = window.localStorage.getItem('falaliga_gallery_images') || '[]';
        const list = JSON.parse(raw) as any[];
        setGalleryImages(list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      } catch (err) {
        console.error('Failed to load local gallery images:', err);
        setGalleryImages([]);
      }
    };

    syncGalleryImages();
    window.addEventListener('falaliga-local-data-updated', syncGalleryImages);
    return () => {
      window.removeEventListener('falaliga-local-data-updated', syncGalleryImages);
    };
  }, []);

  // Password management states
  const [passwordsState, setPasswordsState] = useState<Record<string, string>>({});
  const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({});

  // CSV Import states
  const [parsedPlayersList, setParsedPlayersList] = useState<Player[]>([]);
  const [csvSuccessMsg, setCsvSuccessMsg] = useState('');
  const [csvErrorMsg, setCsvErrorMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Handle CSV file selection
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setCsvErrorMsg('Could not read the file content.');
        return;
      }

      try {
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setCsvErrorMsg('No rows found in the CSV. Please ensure the CSV contains a header row and data.');
          return;
        }

        const defaultMinBid = auctionState.defaultMinBid || 5000;
        const mapped = rows.map(row => mapCSVToPlayer(row, defaultMinBid)).filter(p => p.name);

        if (mapped.length === 0) {
          setCsvErrorMsg('No valid players could be mapped. Please ensure column headers match Name, Role, Gender, BasePrice etc.');
          setParsedPlayersList([]);
        } else {
          setParsedPlayersList(mapped);
          setCsvErrorMsg('');
          setCsvSuccessMsg(`Parsed ${mapped.length} players successfully from CSV! See the preview below.`);
          setTimeout(() => setCsvSuccessMsg(''), 6000);
        }
      } catch (err) {
        console.error('CSV Parsing failed:', err);
        setCsvErrorMsg('Failed to parse CSV file. Ensure it is a valid comma-separated text file.');
      }
    };
    reader.readAsText(file);
  };

  // Import parsed players list to database
  const handleImportPlayersSubmit = async () => {
    if (parsedPlayersList.length === 0) return;
    setIsImporting(true);
    setCsvSuccessMsg('');
    setCsvErrorMsg('');

    let successCount = 0;
    try {
      for (const player of parsedPlayersList) {
        await addPlayer(player);
        successCount++;
      }
      setCsvSuccessMsg(`Successfully imported ${successCount} players to the tournament database! 🎉`);
      setParsedPlayersList([]);
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setTimeout(() => setCsvSuccessMsg(''), 6000);
    } catch (err) {
      console.error('Failed to import players:', err);
      setCsvErrorMsg(`Import interrupted. Successfully added ${successCount} players. Error: ${err}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Download Sample CSV Helper
  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Name,Role,Gender,BasePrice,SkillRating,PhotoUrl,FalaLeague,Badminton,Carroms,Cricket,Football,TT,Comments\n"
      + "Rachel Green,Frontend Specialist,Female,5000,88,👩,First Place,90,75,60,50,85,Great team player and strong badminton smash!\n"
      + "Tony Stark,Tech Architect,Male,7500,98,🧙,,70,80,95,65,90,Experienced mentor with solid cricket drive.\n"
      + "John Doe,Product Manager,Male,,80,📊,,85,85,85,85,85,Consistent all-rounder and great strategist.";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "falabella_players_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Team Roster CSV Helper
  const downloadTeamRoster = (owner: Owner, teamRoster: Player[]) => {
    if (teamRoster.length === 0) {
      alert(`The roster for "${owner.name}" is currently empty.`);
      return;
    }
    const headers = ['Player Name', 'Gender', 'Role', 'Skill Rating', 'Base Price (Coins)', 'Winning Bid (Coins)', 'Fala League Status', 'Comments'];
    const rows = teamRoster.map(p => [
      p.name,
      p.gender,
      p.role,
      p.skillRating,
      p.basePrice,
      p.winningBid || 0,
      p.falaLeague || 'None',
      p.comments || ''
    ]);
    
    const csvRows = [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${owner.name.replace(/\s+/g, '_')}_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Config settings state
  const [configMaxTeamSize, setConfigMaxTeamSize] = useState(auctionState.maxTeamSize || 15);
  const [configMinGirlsCount, setConfigMinGirlsCount] = useState(auctionState.minGirlsCount || 4);
  const [configDefaultMinBid, setConfigDefaultMinBid] = useState(auctionState.defaultMinBid || 5000);
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');

  // Sync config from Firestore
  useEffect(() => {
    if (auctionState.maxTeamSize !== undefined) {
      setConfigMaxTeamSize(auctionState.maxTeamSize);
    }
    if (auctionState.minGirlsCount !== undefined) {
      setConfigMinGirlsCount(auctionState.minGirlsCount);
    }
    if (auctionState.defaultMinBid !== undefined) {
      setConfigDefaultMinBid(auctionState.defaultMinBid);
    }
  }, [auctionState.maxTeamSize, auctionState.minGirlsCount, auctionState.defaultMinBid]);

  // Player form state
  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState('');
  const [playerBasePrice, setPlayerBasePrice] = useState(auctionState.defaultMinBid || 5000);
  const [playerSkillRating, setPlayerSkillRating] = useState(85);
  const [playerEmoji, setPlayerEmoji] = useState('💻');
  const [playerGender, setPlayerGender] = useState<'Male' | 'Female'>('Female');
  const [playerSpeed, setPlayerSpeed] = useState(75); // Keep legacy mappings for any external fallbacks if needed, but we will use them or rename them
  const [playerBadminton, setPlayerBadminton] = useState(75);
  const [playerCarroms, setPlayerCarroms] = useState(75);
  const [playerCricket, setPlayerCricket] = useState(75);
  const [playerFootball, setPlayerFootball] = useState(75);
  const [playerTT, setPlayerTT] = useState(75);
  const [playerFalaLeague, setPlayerFalaLeague] = useState('');
  const [playerComments, setPlayerComments] = useState('');
  const [playerSuccessMsg, setPlayerSuccessMsg] = useState('');

  // Player editing states
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editSkillRating, setEditSkillRating] = useState(80);
  const [editBasePrice, setEditBasePrice] = useState(5000);
  const [editGender, setEditGender] = useState<'Male' | 'Female'>('Female');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editFalaLeague, setEditFalaLeague] = useState('');
  const [editComments, setEditComments] = useState('');
  const [editStatBadminton, setEditStatBadminton] = useState(75);
  const [editStatCarroms, setEditStatCarroms] = useState(75);
  const [editStatCricket, setEditStatCricket] = useState(75);
  const [editStatFootball, setEditStatFootball] = useState(75);
  const [editStatTT, setEditStatTT] = useState(75);
  const [editOwnerId, setEditOwnerId] = useState<string>('');
  const [editWinningBid, setEditWinningBid] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'AVAILABLE' | 'BIDDING' | 'SOLD' | 'UNSOLD'>('AVAILABLE');

  // Offline bidding states
  const [offlineWinnerId, setOfflineWinnerId] = useState<string>('');
  const [offlineWinningAmount, setOfflineWinningAmount] = useState<string>('');

  // Owner form state
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerWallet, setNewOwnerWallet] = useState(1000000);
  const [newOwnerColor, setNewOwnerColor] = useState('#3b82f6');
  const [ownerSuccessMsg, setOwnerSuccessMsg] = useState('');

  // Handle Add Player
  const handleAddPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !playerRole.trim()) return;

    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      name: playerName.trim(),
      role: playerRole.trim(),
      basePrice: Number(playerBasePrice),
      skillRating: Number(playerSkillRating),
      status: 'AVAILABLE',
      photoUrl: playerEmoji,
      gender: playerGender,
      falaLeague: playerFalaLeague.trim() || undefined,
      comments: playerComments.trim() || undefined,
      stats: {
        badminton: Number(playerBadminton),
        carroms: Number(playerCarroms),
        cricket: Number(playerCricket),
        football: Number(playerFootball),
        tt: Number(playerTT)
      }
    };

    try {
      await addPlayer(newPlayer);
      setPlayerSuccessMsg(`Successfully added player ${playerName}!`);
      setPlayerName('');
      setPlayerRole('');
      setPlayerBasePrice(auctionState.defaultMinBid || 5000);
      setPlayerSkillRating(85);
      setPlayerEmoji('💻');
      setPlayerGender('Female');
      setPlayerBadminton(75);
      setPlayerCarroms(75);
      setPlayerCricket(75);
      setPlayerFootball(75);
      setPlayerTT(75);
      setPlayerFalaLeague('');
      setPlayerComments('');
      setTimeout(() => setPlayerSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to add player:', err);
    }
  };

  // Handle Update Settings
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAuctionSettings(
        Number(configMaxTeamSize), 
        Number(configMinGirlsCount), 
        Number(configDefaultMinBid)
      );
      setConfigSuccessMsg('Arena settings updated successfully!');
      setTimeout(() => setConfigSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update arena settings:', err);
    }
  };

  // Handle Add Owner
  const handleAddOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerName.trim()) return;

    // Slugify name
    const slug = newOwnerName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueId = `${slug || 'team'}_${Date.now().toString().slice(-4)}`;

    const newOwner: Owner = {
      id: uniqueId,
      name: newOwnerName.trim(),
      color: newOwnerColor,
      wallet: Number(newOwnerWallet),
      initialWallet: Number(newOwnerWallet)
    };

    try {
      await addOwner(newOwner);
      setOwnerSuccessMsg(`Successfully created team ${newOwnerName}!`);
      setNewOwnerName('');
      setNewOwnerWallet(1000);
      setNewOwnerColor('#3b82f6');
      setTimeout(() => setOwnerSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to add owner:', err);
    }
  };

  // Handle Delete Player
  const handleDeletePlayerClick = async (playerId: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete "${name}"? If they were sold, their winning bid will be refunded to their owner's wallet.`)) {
      try {
        await deletePlayer(playerId);
        alert(`Successfully deleted player "${name}"!`);
      } catch (err) {
        console.error('Failed to delete player:', err);
        alert(`Failed to delete player "${name}": ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  // Handle Edit Player Click
  const handleEditPlayerClick = (player: Player) => {
    setEditingPlayer(player);
    setEditName(player.name);
    setEditRole(player.role);
    setEditSkillRating(player.skillRating || 80);
    setEditBasePrice(player.basePrice || 5000);
    setEditGender(player.gender);
    setEditPhotoUrl(player.photoUrl || '');
    setEditFalaLeague(player.falaLeague || '');
    setEditComments(player.comments || '');
    setEditStatBadminton(player.stats?.badminton ?? 75);
    setEditStatCarroms(player.stats?.carroms ?? 75);
    setEditStatCricket(player.stats?.cricket ?? 75);
    setEditStatFootball(player.stats?.football ?? 75);
    setEditStatTT(player.stats?.tt ?? 75);
    setEditOwnerId(player.ownerId || '');
    setEditWinningBid(player.winningBid || 0);
    setEditStatus(player.status || 'AVAILABLE');
  };

  // Handle Save Player Edit
  const handleSavePlayerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    if (editStatus === 'SOLD' && !editOwnerId) {
      alert('Please select a Winning Team if status is set to SOLD.');
      return;
    }

    const updatedPlayer: Player = {
      ...editingPlayer,
      name: editName.trim(),
      role: editRole.trim(),
      skillRating: Number(editSkillRating),
      basePrice: Number(editBasePrice),
      gender: editGender,
      photoUrl: editPhotoUrl.trim() || '📊',
      falaLeague: editFalaLeague.trim() || undefined,
      comments: editComments.trim() || undefined,
      status: editStatus,
      ownerId: editStatus === 'SOLD' ? editOwnerId : undefined,
      winningBid: editStatus === 'SOLD' ? Number(editWinningBid) : undefined,
      stats: {
        badminton: Number(editStatBadminton),
        carroms: Number(editStatCarroms),
        cricket: Number(editStatCricket),
        football: Number(editStatFootball),
        tt: Number(editStatTT)
      }
    };

    try {
      await updatePlayer(updatedPlayer);
      alert(`Player "${editName}" details updated successfully!`);
      setEditingPlayer(null);
    } catch (err) {
      console.error('Failed to update player:', err);
      alert('Error saving player changes: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Handle Delete All Players
  const handleDeleteAllPlayersClick = async () => {
    if (confirm('CRITICAL WARNING: Are you absolutely sure you want to DELETE ALL PLAYERS from the tournament database?\n\nThis will permanently delete all registered players and bids, and fully refund/reset all owners\' wallets. This action is irreversible!')) {
      try {
        await deleteAllPlayers();
        alert('All players and related bids have been successfully deleted, and all team wallets have been reset.');
      } catch (err) {
        console.error('Failed to delete all players:', err);
        alert('Error deleting all players: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  // Handle Delete All Teams / Owners
  const handleDeleteAllOwnersClick = async () => {
    if (confirm('CRITICAL WARNING: Are you absolutely sure you want to DELETE ALL TEAMS from the tournament database?\n\nThis will permanently delete all registered teams/owners, reset all players to AVAILABLE, and delete all bids. This action is irreversible!')) {
      try {
        await deleteAllOwners();
        alert('All teams, owners, and active bids have been successfully deleted. All players have been reset to AVAILABLE.');
      } catch (err) {
        console.error('Failed to delete all teams/owners:', err);
        alert('Error deleting all teams/owners: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  // Handle Restart Bid
  const handleRestartPlayerBidClick = async (playerId: string, name: string) => {
    if (confirm(`Do you want to restart the bidding process for "${name}"? Status will be reset to AVAILABLE and any spent coins will be refunded.`)) {
      try {
        await restartPlayerBid(playerId);
      } catch (err) {
        console.error('Failed to restart bid:', err);
      }
    }
  };

  // Handle Delete Owner
  const handleDeleteOwnerClick = async (ownerId: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete Team Owner "${name}"?\n\nWARNING: All players won by this team will be returned to the AVAILABLE pool!`)) {
      try {
        await deleteOwner(ownerId);
        alert(`Successfully deleted Team Owner "${name}"! All their won players have been returned to the AVAILABLE pool.`);
      } catch (err) {
        console.error('Failed to delete owner:', err);
        alert(`Failed to delete team owner "${name}": ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  // Handle Backup Export
  const handleExportBackupClick = async () => {
    try {
      const backup = await exportAuctionBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `falabella_auction_backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export backup:', err);
      alert('Error creating backup: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Handle Backup Import
  const handleImportBackupChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('WARNING: Restoring from backup will completely OVERWRITE all current players, teams, wallets, and active bid status. Are you sure you want to proceed?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const backupData = JSON.parse(text);
        await importAuctionBackup(backupData);
        alert('Tournament database successfully restored from JSON backup! Page will reload to reflect the restored state.');
        window.location.reload();
      } catch (err) {
        console.error('Failed to import backup:', err);
        alert('Error restoring backup. Please ensure you uploaded a valid JSON backup file.\nDetails: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Update Owner Password
  const handleUpdateOwnerPasswordClick = async (ownerId: string, teamName: string) => {
    const pass = passwordsState[ownerId]?.trim() || '';
    if (!pass) {
      alert('Please enter a valid password.');
      return;
    }
    try {
      await updateOwnerPassword(ownerId, pass);
      alert(`Successfully updated password for team "${teamName}"!`);
    } catch (err) {
      console.error('Failed to update password:', err);
      alert('Error updating password.');
    }
  };

  // Toggle auto random mode
  const handleToggleAutoRandom = async (enabled: boolean) => {
    try {
      await setAutoRandomMode(enabled);
    } catch (err) {
      console.error('Failed to toggle auto random mode:', err);
    }
  };

  // Start auto random draft from scratch
  const handleStartAutoRandomDraft = async () => {
    const remainingPlayers = players.filter(p => 
      (p.status === 'AVAILABLE' || p.status === 'UNSOLD') && 
      !staffPlayerIds.has(p.id)
    );
    if (remainingPlayers.length === 0) {
      alert('All players are drafted or completed!');
      return;
    }
    
    try {
      await setAutoRandomMode(true);
      if (!auctionState.activePlayerId) {
        const randomIndex = Math.floor(Math.random() * remainingPlayers.length);
        const randomPlayer = remainingPlayers[randomIndex];
        await setActivePlayer(randomPlayer.id);
      }
    } catch (err) {
      console.error('Failed to start auto random draft:', err);
    }
  };

  // Auto random mode driver effect
  useEffect(() => {
    if (auctionState.autoRandomMode && auctionState.status === 'IDLE' && !auctionState.activePlayerId) {
      const remainingPlayers = players.filter(p => 
        (p.status === 'AVAILABLE' || p.status === 'UNSOLD') && 
        !staffPlayerIds.has(p.id)
      );
      
      if (remainingPlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingPlayers.length);
        const randomPlayer = remainingPlayers[randomIndex];
        
        const timer = setTimeout(async () => {
          try {
            await setActivePlayer(randomPlayer.id);
          } catch (err) {
            console.error('Error auto-starting next random player:', err);
          }
        }, 5000);
        
        return () => clearTimeout(timer);
      } else {
        const disableAuto = async () => {
          try {
            await setAutoRandomMode(false);
          } catch (err) {
            console.error('Error disabling auto random mode:', err);
          }
        };
        disableAuto();
      }
    }
  }, [auctionState.autoRandomMode, auctionState.status, auctionState.activePlayerId, players]);

  // Staff Player IDs (Team Owners and Co-Owners) that should be excluded from bidding
  const staffPlayerIds = new Set(
    owners
      .map(o => [o.ownerPlayerId, o.coOwnerPlayerId])
      .flat()
      .filter(Boolean) as string[]
  );

  // Find active player
  const activePlayer = players.find(p => p.id === auctionState.activePlayerId);

  // Synchronize offline bidding state when active player changes
  useEffect(() => {
    if (activePlayer) {
      setOfflineWinnerId('');
      setOfflineWinningAmount('0');
    }
  }, [activePlayer?.id]);

  // Active player bids
  const activeBids = bids.filter(b => b.playerId === auctionState.activePlayerId);

  // Map of who has bid on the active player
  const didBid = (ownerId: string) => activeBids.some(b => b.ownerId === ownerId);

  // Calculate highest bid, winning owner(s), and check for ties
  let highestBidAmount = 0;
  let highestBidders: Bid[] = [];
  let isTie = false;

  if (activeBids.length > 0) {
    highestBidAmount = Math.max(...activeBids.map(b => b.amount));
    highestBidders = activeBids.filter(b => b.amount === highestBidAmount);
    isTie = highestBidders.length > 1;
  }

  // Database Reset handler
  const handleReset = async () => {
    const password = prompt('Please enter the admin password to confirm database reset:');
    if (password !== 'Ravi@445799') {
      alert('Incorrect password! Reset cancelled.');
      return;
    }
    if (window.confirm('Are you absolutely sure you want to RESET the entire game database? This will clear all bids, wallets, and player rosters.')) {
      setResetting(true);
      try {
        await seedDatabase();
      } catch (err) {
        console.error('Error seeding database:', err);
      } finally {
        setResetting(false);
      }
    }
  };

  // Select player to auction
  const handleStartAuction = async (playerId: string) => {
    try {
      await setActivePlayer(playerId);
    } catch (err) {
      console.error('Error starting auction:', err);
    }
  };

  // Reveal Bids
  const handleReveal = async () => {
    try {
      await revealBids();
    } catch (err) {
      console.error('Error revealing bids:', err);
    }
  };

  // Declare player unsold
  const handleUnsold = async () => {
    if (!activePlayer) return;
    try {
      await resolveUnsold(activePlayer.id);
    } catch (err) {
      console.error('Error marking unsold:', err);
    }
  };

  // Award player to winner
  const handleAwardPlayer = async (winnerId: string, winningAmount: number) => {
    if (!activePlayer) return;
    const owner = owners.find(o => o.id === winnerId);
    if (!owner) return;
    
    try {
      await resolveAuction(activePlayer.id, winnerId, winningAmount, owner.wallet);
    } catch (err) {
      console.error('Error resolving auction:', err);
    }
  };

  // Start Sudden Death Re-bid
  const handleStartRebid = async () => {
    if (!activePlayer || highestBidders.length === 0) return;
    const tiedIds = highestBidders.map(b => b.ownerId);
    try {
      await startTieResolution(activePlayer.id, tiedIds, highestBidAmount);
    } catch (err) {
      console.error('Error starting re-bid:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121212] border border-white/10 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              ADMIN CONTROL PANEL
              <span className="text-[10px] bg-fala-magenta/20 text-fala-magenta border border-fala-magenta/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Host
              </span>
            </h1>
            <p className="text-xs text-slate-400">Control active players, resolve bids, and manage rosters</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportBackupClick}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-fala-blue hover:bg-fala-blue/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
            title="Take instantaneous backup of the auction progress (can be done during active bidding or after the auction)"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            Quick Backup
          </button>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-rose-950/40 border border-white/10 hover:border-rose-900 text-slate-300 hover:text-rose-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            Reset Game & Players
          </button>
          
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Lock admin controls and logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Lock Admin
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('auction')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'auction' 
              ? 'border-fala-blue text-fala-blue bg-white/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Auction
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'players' 
              ? 'border-fala-blue text-fala-blue bg-white/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Players Board ({players.length})
        </button>
        <button
          onClick={() => setActiveTab('rosters')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'rosters' 
              ? 'border-fala-blue text-fala-blue bg-white/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Team Rosters & Budgets
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'manage' 
              ? 'border-fala-blue text-fala-blue bg-white/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Manage Players
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'gallery' 
              ? 'border-fala-blue text-fala-blue bg-white/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Image Gallery ({galleryImages.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'auction' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Card status */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-display">
              <CircleDot className="w-4 h-4 text-fala-blue" /> Currently Auctioning
            </h2>
            {activePlayer ? (
              <div className="space-y-4">
                <PlayerCard player={activePlayer} owners={owners} isActive={true} isAuctionScreen={true} />
                {auctionState.autoRandomMode && (
                  <div className="bg-fala-blue/10 border border-fala-blue/20 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-fala-blue">
                      <span className="w-2 h-2 rounded-full bg-fala-blue animate-pulse" />
                      Auto-Random Draft Active
                    </div>
                    <button
                      onClick={() => handleToggleAutoRandom(false)}
                      className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer"
                    >
                      🛑 Disable Auto-Pilot
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {auctionState.autoRandomMode ? (
                  <div className="bg-[#121212]/50 border-2 border-dashed border-fala-blue/30 rounded-2xl p-10 text-center text-slate-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-fala-blue/[0.01] pointer-events-none" />
                    <Sparkles className="w-8 h-8 text-fala-blue mx-auto mb-3 animate-spin" style={{ animationDuration: '3s' }} />
                    <p className="text-sm font-black text-fala-blue uppercase tracking-widest font-display">Selecting Next Player...</p>
                    <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                      Choosing a random competitor from the remaining {players.filter(p => p.status === 'AVAILABLE' || p.status === 'UNSOLD').length} available players in the pool.
                    </p>
                    <button
                      onClick={() => handleToggleAutoRandom(false)}
                      className="mt-5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      🛑 Stop Auto-Random Mode
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#121212]/50 border border-dashed border-white/10 rounded-2xl p-8 text-center text-slate-400 space-y-5">
                    <div className="space-y-2">
                      <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold">No active player currently under auction</p>
                      <p className="text-xs text-slate-500">You can manually select a player from the board, or let the AI pilot the draft randomly!</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <button
                        onClick={handleStartAutoRandomDraft}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-fala-blue to-fala-magenta hover:from-fala-blue/90 hover:to-fala-magenta/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-fala-blue/10 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        🎲 Start Random Bidding Auto-Run
                      </button>
                      <button
                        onClick={() => setActiveTab('players')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current text-slate-400" /> View Board
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Offline Bidding Controls */}
          <div className="lg:col-span-6 space-y-6">
            {activePlayer ? (
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-lg space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5 font-display">
                    <Award className="w-5 h-5 text-fala-blue" /> Offline Bidding Desk
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Directly award the player to the winning team and record the offline bid amount.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Select Winner Team */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Select Winning Team</label>
                    <select
                      value={offlineWinnerId}
                      onChange={(e) => setOfflineWinnerId(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-xs focus:outline-none transition-colors text-slate-100 font-bold font-sans"
                    >
                      <option value="">-- Choose Team / Owner --</option>
                      {owners.map(owner => {
                        const teamRoster = players.filter(p => p.ownerId === owner.id);
                        return (
                          <option key={owner.id} value={owner.id}>
                            {owner.name} (🪙 {owner.wallet.toLocaleString()} left)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Winning Bid Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Winning Bid Value (Coins)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">🪙</span>
                      <input
                        type="number"
                        value={offlineWinningAmount}
                        onChange={(e) => setOfflineWinningAmount(e.target.value)}
                        placeholder="Enter final bid amount"
                        className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-xs font-mono text-slate-100 focus:outline-none transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Start bidding at any offline price, and update the final sold price once completed.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={async () => {
                        if (!offlineWinnerId) {
                          alert("Please select a winning team first!");
                          return;
                        }
                        const winningAmount = Number(offlineWinningAmount);
                        if (isNaN(winningAmount) || winningAmount < 0) {
                          alert("Please enter a valid winning bid amount!");
                          return;
                        }
                        const winningOwner = owners.find(o => o.id === offlineWinnerId);
                        if (!winningOwner) return;

                        if (winningOwner.wallet < winningAmount) {
                          if (!confirm(`Warning: Selected bid of 🪙 ${winningAmount.toLocaleString()} exceeds ${winningOwner.name}'s remaining wallet (🪙 ${winningOwner.wallet.toLocaleString()}).\n\nDo you still want to approve this assignment?`)) {
                            return;
                          }
                        }

                        try {
                          await resolveAuction(activePlayer.id, offlineWinnerId, winningAmount, winningOwner.wallet);
                        } catch (err) {
                          console.error("Failed to approve bidding offline:", err);
                          alert("Error approving bidding: " + (err instanceof Error ? err.message : String(err)));
                        }
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-fala-blue to-emerald-600 hover:from-fala-blue/90 hover:to-emerald-600/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve Bid & Award
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          await resolveUnsold(activePlayer.id);
                        } catch (err) {
                          console.error("Failed to skip player:", err);
                        }
                      }}
                      className="py-3 px-4 bg-white/5 hover:bg-rose-950/30 border border-white/10 hover:border-rose-900 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 font-sans"
                      title="Skip player if there are no bids"
                    >
                      <UserMinus className="w-4 h-4" /> Skip / Unsold
                    </button>
                  </div>
                </div>

                {/* Real-time Status Table of Teams for Quick Verification */}
                <div className="border-t border-white/10 pt-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold font-sans">Teams Overview & Caps</h4>
                    <span className="text-[9px] text-slate-500 italic font-sans">Verify budgets & counts</span>
                  </div>

                  <div className="border border-white/5 rounded-xl overflow-hidden text-[11px] bg-black/20 font-sans">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-black/40 text-slate-400 border-b border-white/5 font-bold uppercase tracking-wider text-[9px]">
                          <th className="p-2">Team</th>
                          <th className="p-2 text-right">Budget Left</th>
                          <th className="p-2 text-center">Roster Size</th>
                          <th className="p-2 text-center">Girls Required</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {owners.map(owner => {
                          const teamRoster = players.filter(p => p.ownerId === owner.id);
                          const girlsCount = teamRoster.filter(p => p.gender === 'Female').length;
                          const maxLimit = auctionState.maxTeamSize || 15;
                          const minGirls = auctionState.minGirlsCount || 4;

                          const isSelected = owner.id === offlineWinnerId;

                          return (
                            <tr key={owner.id} className={`transition-colors ${isSelected ? 'bg-fala-blue/10 text-white font-bold' : 'hover:bg-white/5'}`}>
                              <td className="p-2 flex items-center gap-1.5 truncate max-w-[120px]">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: owner.color }} />
                                <span className="truncate">{owner.name}</span>
                              </td>
                              <td className={`p-2 text-right font-mono font-bold ${owner.wallet < (Number(offlineWinningAmount) || 0) && isSelected ? 'text-rose-400' : 'text-amber-400'}`}>
                                🪙 {owner.wallet.toLocaleString()}
                              </td>
                              <td className="p-2 text-center font-mono">
                                {teamRoster.length} / {maxLimit}
                              </td>
                              <td className={`p-2 text-center font-mono font-bold ${girlsCount >= minGirls ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {girlsCount} / {minGirls}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[400px] border border-dashed border-white/5 bg-black/10 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-600 font-sans">
                <Layers className="w-10 h-10 mb-2 opacity-25" />
                <p className="text-xs font-semibold">Bidding Console Inactive</p>
                <p className="text-[11px] mt-1 max-w-sm">
                  The bidding desk will activate once you select a competitor from the board or auto-pilot to start the offline auction.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Players Board</h2>
              <p className="text-xs text-slate-400">Total available and unsold players ready for auction</p>
            </div>
            
            {/* Legend & Operations */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={handleDeleteAllPlayersClick}
                className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-extrabold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer text-[10px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete All Players
              </button>

              <div className="flex gap-3 text-xs font-medium border-l border-white/10 pl-4">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500/30" /> Available
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-500/30" /> Unsold
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-fala-blue/20 border border-fala-blue/30" /> Sold
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {players.map(player => {
              const isStaff = staffPlayerIds.has(player.id);
              const associatedOwner = isStaff 
                ? owners.find(o => o.ownerPlayerId === player.id || o.coOwnerPlayerId === player.id)
                : null;
              const staffRole = associatedOwner 
                ? (associatedOwner.ownerPlayerId === player.id ? 'Owner' : 'Co-Owner') 
                : null;
              const canAuction = (player.status === 'AVAILABLE' || player.status === 'UNSOLD') && !isStaff;
              return (
                <div key={player.id} className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group">
                  <div className="relative flex-1">
                    <PlayerCard player={player} owners={owners} />
                    
                    {isStaff && associatedOwner && (
                      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: associatedOwner.color }}>
                          👑 {staffRole} ({associatedOwner.name})
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          Excluded from Auction Pool
                        </span>
                      </div>
                    )}

                    {canAuction && !auctionState.activePlayerId && (
                      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => handleStartAuction(player.id)}
                          className="px-5 py-2.5 bg-fala-blue hover:bg-fala-blue/90 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-white" />
                          Start Auction Bidding
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Admin Control Tray */}
                  <div className="bg-black/40 p-3 border-t border-white/5 flex gap-2 items-center justify-between">
                    <div className="flex gap-2">
                      {/* Restart Bid Button */}
                      {(player.status === 'SOLD' || player.status === 'UNSOLD') && (
                        <button
                          onClick={() => handleRestartPlayerBidClick(player.id, player.name)}
                          className="px-2 py-1 bg-fala-blue/15 hover:bg-fala-blue hover:text-white border border-fala-blue/30 text-fala-blue rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Restart Bidding for Player"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restart
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditPlayerClick(player)}
                        className="px-2 py-1 bg-blue-500/15 hover:bg-blue-500 hover:text-slate-950 border border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Edit Player details"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>

                      {/* Start Bidding Button if available */}
                      {canAuction && !auctionState.activePlayerId && (
                        <button
                          onClick={() => handleStartAuction(player.id)}
                          className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer md:hidden"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Start
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeletePlayerClick(player.id, player.name)}
                      className="px-2 py-1 bg-rose-500/15 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-400 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ml-auto"
                      title="Delete Player From Pool"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit Player Modal Overlay */}
          {editingPlayer && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 my-8">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-all cursor-pointer border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Edit Player Details</h2>
                    <p className="text-xs text-slate-400">Modify properties of "{editingPlayer.name}" in the real-time database.</p>
                  </div>
                </div>

                <form onSubmit={handleSavePlayerEdit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">Player Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl text-xs focus:outline-none transition-all text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">Skill Rating (1-100)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={editSkillRating}
                        onChange={(e) => setEditSkillRating(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl text-xs focus:outline-none transition-all text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">Gender</label>
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value as 'Male' | 'Female')}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl text-xs focus:outline-none transition-all text-slate-200 font-bold"
                      >
                        <option value="Female">Female 👩</option>
                        <option value="Male">Male 👨</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="font-bold text-slate-300">Photo / Emoji ({editPhotoUrl.startsWith('data:') ? 'Custom Photo' : editPhotoUrl})</label>
                      <input
                        type="text"
                        value={editPhotoUrl}
                        onChange={(e) => setEditPhotoUrl(e.target.value)}
                        placeholder="Emoji e.g. 📊 or URL"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl text-xs focus:outline-none transition-all text-slate-100"
                      />
                    </div>
                  </div>

                  {galleryImages.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 block">Select Uploaded Photo</label>
                      <div className="flex gap-2 p-2 bg-black/30 rounded-xl border border-white/5 overflow-x-auto max-h-[85px]">
                        {galleryImages.map((img) => {
                          const isSelected = editPhotoUrl === img.dataUrl;
                          return (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => setEditPhotoUrl(img.dataUrl)}
                              className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                                isSelected ? 'border-fala-blue scale-105 shadow-md' : 'border-transparent opacity-65 hover:opacity-100'
                              }`}
                              title={img.name}
                            >
                              <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">Fala League Status</label>
                      <input
                        type="text"
                        value={editFalaLeague}
                        onChange={(e) => setEditFalaLeague(e.target.value)}
                        placeholder="e.g. Winner, MVP"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl text-xs focus:outline-none transition-all text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">Player Comments / About</label>
                    <textarea
                      value={editComments}
                      onChange={(e) => setEditComments(e.target.value)}
                      placeholder="Add fun details, playstyle, or achievements about this athlete..."
                      rows={2}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl text-xs focus:outline-none transition-all text-slate-100 resize-none"
                    />
                  </div>

                  {/* Direct Assignment & Corrective Controls */}
                  <div className="border-t border-white/5 pt-3 grid grid-cols-1 md:grid-cols-3 gap-3 bg-black/20 p-3 rounded-2xl border border-white/5">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300">Auction Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setEditStatus(val);
                          if (val !== 'SOLD') {
                            setEditOwnerId('');
                            setEditWinningBid(0);
                          }
                        }}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 focus:border-blue-500 rounded-xl text-xs focus:outline-none transition-all text-slate-200 font-bold"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="UNSOLD">UNSOLD</option>
                        <option value="SOLD">SOLD</option>
                      </select>
                    </div>

                    {editStatus === 'SOLD' && (
                      <>
                        <div className="space-y-1.5 col-span-1">
                          <label className="font-bold text-slate-300">Winning Team</label>
                          <select
                            value={editOwnerId}
                            onChange={(e) => setEditOwnerId(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 focus:border-blue-500 rounded-xl text-xs focus:outline-none transition-all text-slate-200 font-bold"
                          >
                            <option value="">-- Select Team --</option>
                            {owners.map(owner => (
                              <option key={owner.id} value={owner.id}>{owner.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5 col-span-1">
                          <label className="font-bold text-slate-300">Winning Bid (Coins)</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={editWinningBid}
                            onChange={(e) => setEditWinningBid(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 focus:border-blue-500 rounded-xl text-xs focus:outline-none transition-all text-slate-100 font-mono"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sports Specific Ratings */}
                  <div className="border-t border-white/5 pt-3">
                    <h3 className="text-xs font-bold text-slate-400 mb-2.5 uppercase tracking-wider">Edit Sports Stats (1-100)</h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="space-y-1 text-center">
                        <label className="text-[10px] text-slate-400 font-bold block truncate">Badminton</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editStatBadminton}
                          onChange={(e) => setEditStatBadminton(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-center text-slate-100"
                        />
                      </div>
                      <div className="space-y-1 text-center">
                        <label className="text-[10px] text-slate-400 font-bold block truncate">Carroms</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editStatCarroms}
                          onChange={(e) => setEditStatCarroms(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-center text-slate-100"
                        />
                      </div>
                      <div className="space-y-1 text-center">
                        <label className="text-[10px] text-slate-400 font-bold block truncate">Cricket</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editStatCricket}
                          onChange={(e) => setEditStatCricket(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-center text-slate-100"
                        />
                      </div>
                      <div className="space-y-1 text-center">
                        <label className="text-[10px] text-slate-400 font-bold block truncate">Football</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editStatFootball}
                          onChange={(e) => setEditStatFootball(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-center text-slate-100"
                        />
                      </div>
                      <div className="space-y-1 text-center">
                        <label className="text-[10px] text-slate-400 font-bold block truncate">TT</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editStatTT}
                          onChange={(e) => setEditStatTT(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-center text-slate-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingPlayer(null)}
                      className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl font-bold cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 rounded-xl font-black uppercase tracking-wider transition-all cursor-pointer shadow-md text-center"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rosters' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Teams & Rosters</h2>
              <p className="text-xs text-slate-400">Track and manage team rosters, wallets, and download CSV sheets.</p>
            </div>
            
            <button
              type="button"
              onClick={handleDeleteAllOwnersClick}
              className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-extrabold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer text-[10px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete All Teams
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {owners.map(owner => {
              const teamRoster = players.filter(p => p.ownerId === owner.id);
              const totalSpent = teamRoster.reduce((sum, p) => sum + (p.winningBid || 0), 0);
              const girlsCount = teamRoster.filter(p => p.gender === 'Female').length;
              const boysCount = teamRoster.filter(p => p.gender === 'Male').length;
              
              const maxLimit = auctionState.maxTeamSize || 15;
              const minGirls = auctionState.minGirlsCount || 4;
              const hasEnoughGirls = girlsCount >= minGirls;
              const withinSize = teamRoster.length <= maxLimit;

              return (
                <div 
                  key={owner.id} 
                  className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: owner.color }} />
                        <h3 className="font-bold text-slate-100 text-sm truncate">{owner.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => downloadTeamRoster(owner, teamRoster)}
                          className="p-1 text-slate-500 hover:text-fala-blue hover:bg-fala-blue/10 rounded-lg transition-all cursor-pointer"
                          title="Download Team Roster CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOwnerClick(owner.id, owner.name)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                          title="Delete Team Owner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 mb-4 bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <div className="flex justify-between">
                        <span>Budget Left:</span>
                        <span className="font-mono text-amber-400 font-bold">🪙 {owner.wallet.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Spent:</span>
                        <span className="font-mono text-slate-400">🪙 {totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Roster Size:</span>
                        <span className={`font-bold ${withinSize ? 'text-slate-200' : 'text-rose-400'}`}>
                          {teamRoster.length} / {maxLimit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Girls Count:</span>
                        <span className={`font-bold ${hasEnoughGirls ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {girlsCount} / {minGirls}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Boys Count:</span>
                        <span className="text-slate-300">{boysCount}</span>
                      </div>
                    </div>

                    {/* Rule indicator badge */}
                    <div className="mb-4">
                      {!hasEnoughGirls ? (
                        <div className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Need {minGirls - girlsCount} more girl(s)
                        </div>
                      ) : teamRoster.length > maxLimit ? (
                        <div className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Over limit (max {maxLimit})
                        </div>
                      ) : teamRoster.length > 0 ? (
                        <div className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Roster Compliant ✅
                        </div>
                      ) : (
                        <div className="px-2.5 py-1.5 bg-slate-500/5 border border-white/5 rounded-lg text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <CircleDot className="w-3.5 h-3.5" /> Empty Squad
                        </div>
                      )}
                    </div>

                    {/* Team Staff Dropdown Selection */}
                    <div className="space-y-2 bg-black/20 p-2.5 rounded-xl border border-white/5 mb-4 text-[11px]">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Select Owner Name</label>
                        <select
                          value={owner.ownerPlayerId || ''}
                          onChange={async (e) => {
                            const val = e.target.value || null;
                            try {
                              await updateOwnerTeamStaff(owner.id, val, owner.coOwnerPlayerId || null);
                            } catch (err) {
                              console.error('Failed to update team owner:', err);
                            }
                          }}
                          className="w-full px-2 py-1 bg-[#0a0a0a] border border-white/10 rounded-lg text-slate-200 focus:outline-none cursor-pointer font-semibold"
                        >
                          <option value="">-- No Owner Assigned --</option>
                          {players.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.gender})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Select Co-Owner Name</label>
                        <select
                          value={owner.coOwnerPlayerId || ''}
                          onChange={async (e) => {
                            const val = e.target.value || null;
                            try {
                              await updateOwnerTeamStaff(owner.id, owner.ownerPlayerId || null, val);
                            } catch (err) {
                              console.error('Failed to update team co-owner:', err);
                            }
                          }}
                          className="w-full px-2 py-1 bg-[#0a0a0a] border border-white/10 rounded-lg text-slate-200 focus:outline-none cursor-pointer font-semibold"
                        >
                          <option value="">-- No Co-Owner Assigned --</option>
                          {players.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.gender})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 font-bold">Players Won</h4>
                    {teamRoster.length === 0 ? (
                      <p className="text-[11px] text-slate-600 italic">No players won yet</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {teamRoster.map(player => (
                          <div 
                            key={player.id} 
                            className="flex items-center justify-between p-1.5 bg-black/30 rounded border border-white/5 text-[11px]"
                          >
                            <span className="text-slate-200 truncate pr-2">
                              {player.photoUrl} {player.name.split(' "')[0]} <span className="text-[9px] text-slate-500">({player.gender === 'Female' ? 'F' : 'M'})</span>
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
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-8">
          
          {/* Rules Configuration card */}
          <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-fala-blue/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Falaliga 4.0 Rules & Settings</h2>
                <p className="text-xs text-slate-400">Configure global limits and compliance regulations for the league</p>
              </div>
            </div>

            {configSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {configSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Max Team Size Limit</label>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={configMaxTeamSize}
                  onChange={(e) => setConfigMaxTeamSize(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-sm text-slate-100 font-mono focus:outline-none transition-colors"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Suggested limit: 15 to 20 players</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Min Girls (Female Players) Required</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={configMinGirlsCount}
                  onChange={(e) => setConfigMinGirlsCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-sm text-slate-100 font-mono focus:outline-none transition-colors"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Rule: Every team must have at least N girls</p>
              </div>

              <button
                type="submit"
                className="py-3 bg-fala-blue hover:bg-fala-blue/90 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs h-[42px] w-full"
              >
                <CheckSquare className="w-4 h-4 text-white" /> Update League Rules
              </button>
            </form>
          </div>

          {/* League Data Backup & Recovery Section */}
          <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-fala-blue/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-fala-blue" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">League Backup & Restore</h2>
                <p className="text-xs text-slate-400">Export or import a complete snapshot of players, owners, bids, and active auction states in the middle of or after the auction.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Export Current State</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Save a complete offline backup of the tournament. You can safely trigger this in the middle of an active auction, or after all players are sold, as a safety restore point.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackupClick}
                  className="w-full sm:w-auto px-4 py-2.5 bg-fala-blue hover:bg-fala-blue/90 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs mt-3 self-start"
                >
                  <Download className="w-4 h-4" />
                  Download JSON Backup
                </button>
              </div>

              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Restore from File</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  Upload a previously saved <code className="text-fala-magenta">.json</code> backup file to completely restore your tournament to that exact snapshot.
                </p>
                
                <div className="relative border border-dashed border-white/10 hover:border-fala-blue/40 rounded-xl p-4 transition-all bg-black/20 flex flex-col items-center justify-center text-center">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackupChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <p className="text-xs font-bold text-slate-300">Click to upload JSON backup</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Will replace all current draft & team states</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Add Competitor Column */}
            <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
                <div className="w-9 h-9 rounded-xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">Add New Competitor</h2>
                  <p className="text-xs text-slate-400">Introduce a new corporate athlete into the players pool</p>
                </div>
              </div>

              {playerSuccessMsg && (
                <div className="p-3 bg-fala-blue/10 border border-fala-blue/20 text-fala-blue rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-fala-blue" />
                  {playerSuccessMsg}
                </div>
              )}

              <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="e.g. Rachel 'Slide-Deck' Queen"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-sm text-slate-100 focus:outline-none placeholder:text-slate-600 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skill Rating (1-100)</label>
                  <input
                    type="number"
                    value={playerSkillRating}
                    onChange={(e) => setPlayerSkillRating(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-sm text-slate-100 font-mono focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Gender Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gender Alignment</label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-black/40 border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPlayerGender('Female')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      playerGender === 'Female' 
                        ? 'bg-fala-blue text-white font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    👩 Female / Girl
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerGender('Male')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      playerGender === 'Male' 
                        ? 'bg-fala-blue text-white font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    👨 Male / Boy
                  </button>
                </div>
              </div>

              {/* Emoji Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avatar Emoji ({playerEmoji.startsWith('data:') ? 'Custom Photo' : playerEmoji})</label>
                <div className="grid grid-cols-8 gap-2 p-3 bg-black/30 rounded-2xl border border-white/5">
                  {['📊', '🚀', '🎙️', '📥', '☕', '🌴', '💬', '🎨', '🥷', '🏓', '📚', '💻', '🧠', '👔', '📈', '🧙'].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setPlayerEmoji(emo)}
                      className={`text-xl p-2 rounded-xl transition-all cursor-pointer select-none hover:bg-white/5 active:scale-90 ${
                        playerEmoji === emo ? 'bg-fala-blue/20 border border-fala-blue/50' : 'border border-transparent'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gallery Image Selector */}
              {galleryImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Or Select Uploaded Photo</label>
                  <div className="flex gap-2 p-3 bg-black/30 rounded-2xl border border-white/5 overflow-x-auto max-h-[110px]">
                    {galleryImages.map((img) => {
                      const isSelected = playerEmoji === img.dataUrl;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setPlayerEmoji(img.dataUrl)}
                          className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            isSelected ? 'border-fala-blue scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          title={img.name}
                        >
                          <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fala League Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Previous Fala League Status (Optional)</label>
                <select
                  value={playerFalaLeague}
                  onChange={(e) => setPlayerFalaLeague(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-xs focus:outline-none transition-all text-slate-200"
                >
                  <option value="">None / Not a previous winner</option>
                  <option value="First Place">First Place 🏆</option>
                  <option value="Second Place">Second Place 🥈</option>
                  <option value="Third Place">Third Place 🥉</option>
                </select>
              </div>

              {/* Player Comments Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Player Comments / Description</label>
                <textarea
                  value={playerComments}
                  onChange={(e) => setPlayerComments(e.target.value)}
                  placeholder="e.g. Speed merchant, strong badminton smasher, or key support player..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-xs focus:outline-none placeholder:text-slate-600 transition-colors text-slate-100 resize-none"
                />
              </div>

              {/* Stats sliders */}
              <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Skills Breakdown</h4>
                
                <div className="space-y-2.5">
                  {/* Badminton */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 w-24">🏸 Badminton</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={playerBadminton}
                      onChange={(e) => setPlayerBadminton(Number(e.target.value))}
                      className="flex-1 accent-fala-blue cursor-pointer h-1.5 rounded bg-white/10"
                    />
                    <span className="font-mono text-fala-blue font-semibold w-8 text-right">{playerBadminton}</span>
                  </div>

                  {/* Carroms */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 w-24">🥏 Carroms</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={playerCarroms}
                      onChange={(e) => setPlayerCarroms(Number(e.target.value))}
                      className="flex-1 accent-fala-blue cursor-pointer h-1.5 rounded bg-white/10"
                    />
                    <span className="font-mono text-fala-blue font-semibold w-8 text-right">{playerCarroms}</span>
                  </div>

                  {/* Cricket */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 w-24">🏏 Cricket</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={playerCricket}
                      onChange={(e) => setPlayerCricket(Number(e.target.value))}
                      className="flex-1 accent-fala-blue cursor-pointer h-1.5 rounded bg-white/10"
                    />
                    <span className="font-mono text-fala-blue font-semibold w-8 text-right">{playerCricket}</span>
                  </div>

                  {/* Football */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 w-24">⚽ Football</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={playerFootball}
                      onChange={(e) => setPlayerFootball(Number(e.target.value))}
                      className="flex-1 accent-fala-blue cursor-pointer h-1.5 rounded bg-white/10"
                    />
                    <span className="font-mono text-fala-blue font-semibold w-8 text-right">{playerFootball}</span>
                  </div>

                  {/* TT */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 w-24">🏓 Table Tennis (TT)</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={playerTT}
                      onChange={(e) => setPlayerTT(Number(e.target.value))}
                      className="flex-1 accent-fala-blue cursor-pointer h-1.5 rounded bg-white/10"
                    />
                    <span className="font-mono text-fala-blue font-semibold w-8 text-right">{playerTT}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-fala-blue hover:bg-fala-blue/90 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-white" /> Add New Player
              </button>
            </form>
          </div>

          {/* Add Team Owner Column */}
          <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl space-y-6 h-fit">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Add Team Owner</h2>
                <p className="text-xs text-slate-400">Register a new gaming crew with their initial budget</p>
              </div>
            </div>

            {ownerSuccessMsg && (
              <div className="p-3 bg-fala-blue/10 border border-fala-blue/20 text-fala-blue rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fala-blue" />
                {ownerSuccessMsg}
              </div>
            )}

            <form onSubmit={handleAddOwnerSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Name</label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  placeholder="e.g. Operations Overlords"
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-sm text-slate-100 focus:outline-none placeholder:text-slate-600 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Starting Budget (Coins)</label>
                <input
                  type="number"
                  value={newOwnerWallet}
                  onChange={(e) => setNewOwnerWallet(Number(e.target.value))}
                  min={100}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-fala-blue rounded-xl text-sm text-slate-100 font-mono focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Team Branding Color preset selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Accent Color ({newOwnerColor})</label>
                <div className="grid grid-cols-5 gap-3 p-3.5 bg-black/30 rounded-2xl border border-white/5">
                  {[
                    { hex: '#3b82f6', label: 'Blue' },
                    { hex: '#f59e0b', label: 'Amber' },
                    { hex: '#ec4899', label: 'Pink' },
                    { hex: '#10b981', label: 'Green' },
                    { hex: '#8b5cf6', label: 'Purple' },
                    { hex: '#06b6d4', label: 'Cyan' },
                    { hex: '#ef4444', label: 'Red' },
                    { hex: '#f43f5e', label: 'Rose' },
                    { hex: '#6366f1', label: 'Indigo' },
                    { hex: '#14b8a6', label: 'Teal' },
                  ].map((colorObj) => (
                    <button
                      key={colorObj.hex}
                      type="button"
                      onClick={() => setNewOwnerColor(colorObj.hex)}
                      className="w-full aspect-square rounded-xl flex items-center justify-center transition-all relative border border-transparent hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: colorObj.hex }}
                      title={colorObj.label}
                    >
                      {newOwnerColor === colorObj.hex && (
                        <Check className="w-5 h-5 text-black bg-white rounded-full p-0.5 shadow-md border border-black/10" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-2 mt-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Custom Hex:</span>
                  <input
                    type="color"
                    value={newOwnerColor}
                    onChange={(e) => setNewOwnerColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newOwnerColor}
                    onChange={(e) => setNewOwnerColor(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 bg-transparent border-none text-xs font-mono text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-fala-blue hover:bg-fala-blue/90 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-white" /> Register Team Owner
              </button>
            </form>
          </div>

        </div>

        {/* Team Owner Passwords Section */}
        <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-fala-blue" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Team Owner Passwords & Accounts</h2>
              <p className="text-xs text-slate-400">Set custom access passwords for team owners to log in securely to their dashboards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {owners.map(owner => {
              const hasPassword = !!owner.password;
              const isVisible = !!passwordVisibility[owner.id];
              
              return (
                <div key={owner.id} className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: owner.color }} />
                    <div>
                      <span className="text-sm font-bold text-slate-200 block">{owner.name}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Status: {hasPassword ? (
                          <span className="text-emerald-400 font-bold">● Password Active</span>
                        ) : (
                          <span className="text-fala-magenta font-bold">● Default Active ('1234')</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-1 md:max-w-[280px]">
                    <div className="relative flex-1">
                      <input
                        type={isVisible ? "text" : "password"}
                        value={passwordsState[owner.id] !== undefined ? passwordsState[owner.id] : (owner.password || '')}
                        onChange={(e) => setPasswordsState({ ...passwordsState, [owner.id]: e.target.value })}
                        placeholder="Set custom password"
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 focus:border-fala-blue rounded-xl text-xs text-slate-100 focus:outline-none transition-all pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisibility({ ...passwordVisibility, [owner.id]: !isVisible })}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpdateOwnerPasswordClick(owner.id, owner.name)}
                      className="px-3 py-2 bg-fala-blue hover:bg-fala-blue/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow flex items-center gap-1.5"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CSV Players Bulk Upload Section */}
        <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-fala-blue" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Bulk Upload Player Profiles</h2>
                <p className="text-xs text-slate-400">Upload players with photos, ratings, gender and sports stats from a CSV file</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/5 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Instructions & Headers</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your CSV file should have a header row. We automatically map these columns (case-insensitive):
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Name', 'Role', 'Gender', 'BasePrice', 'SkillRating', 'PhotoUrl', 'FalaLeague', 'Badminton', 'Carroms', 'Cricket', 'Football', 'TT'].map(h => (
                    <span key={h} className="px-2 py-0.5 bg-black text-[10px] font-mono rounded text-fala-magenta border border-white/5">
                      {h}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 space-y-1.5 pt-2">
                  <p>● <strong className="text-slate-400">Gender</strong> supports <code className="text-fala-magenta/80">Female</code>, <code className="text-fala-magenta/80">Male</code>, etc.</p>
                  <p>● <strong className="text-slate-400">BasePrice</strong> defaults to configured Min Bid ({auctionState.defaultMinBid || 5000}) if left blank.</p>
                  <p>● <strong className="text-slate-400">PhotoUrl</strong> can be an emoji (e.g., 🧙, 👩) or any web photo link!</p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="relative border-2 border-dashed border-white/10 hover:border-fala-blue/40 rounded-3xl p-6 transition-all bg-black/20 flex flex-col items-center justify-center text-center group">
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv"
                  onChange={handleCSVFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-12 h-12 rounded-2xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-200">Drag & Drop CSV here</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse from device</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {csvSuccessMsg && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {csvSuccessMsg}
                </div>
              )}

              {csvErrorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  {csvErrorMsg}
                </div>
              )}

              {parsedPlayersList.length > 0 ? (
                <div className="bg-black/20 border border-white/5 rounded-3xl p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Parsed Draft Preview ({parsedPlayersList.length} athletes ready)
                    </span>
                    <button
                      type="button"
                      onClick={handleImportPlayersSubmit}
                      disabled={isImporting}
                      className="px-4 py-2.5 bg-fala-blue hover:bg-fala-blue/90 disabled:bg-fala-blue/40 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-4 h-4" />
                          Confirm & Import Players
                        </>
                      )}
                    </button>
                  </div>

                  <div className="border border-white/5 rounded-2xl overflow-hidden max-h-[250px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-black/50 text-slate-400 border-b border-white/5 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-2.5">Photo / Avatar</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Gender</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5 text-right">Skill</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {parsedPlayersList.map((p, idx) => (
                          <tr key={idx} className="hover:bg-white/5 text-slate-300">
                            <td className="p-2.5">
                              {p.photoUrl?.startsWith('http') ? (
                                <img
                                  src={p.photoUrl}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-7 h-7 rounded-full object-cover bg-slate-800 border border-white/10"
                                />
                              ) : (
                                <span className="text-lg inline-block w-7 h-7 text-center">{p.photoUrl || '📊'}</span>
                              )}
                            </td>
                            <td className="p-2.5 font-bold text-slate-100">{p.name}</td>
                            <td className="p-2.5">
                              {p.gender === 'Female' ? '👩 Female' : '👨 Male'}
                            </td>
                            <td className="p-2.5 text-slate-400">{p.role}</td>
                            <td className="p-2.5 text-right font-mono text-emerald-400 font-semibold">{p.skillRating}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-[250px] border border-dashed border-white/5 bg-black/10 rounded-3xl flex flex-col items-center justify-center text-center p-6 text-slate-600">
                  <FileSpreadsheet className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs font-semibold">No file selected yet</p>
                  <p className="text-[11px] mt-1 max-w-sm">
                    Select or drag-and-drop a .csv file on the left dropzone. A preview of the imported players will be shown here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-fala-blue" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">Upload Images to Gallery</h2>
                  <p className="text-xs text-slate-400">Add custom base64 photo avatars to the tournament database library</p>
                </div>
              </div>

              {galleryImages.length > 0 && (
                <button
                  type="button"
                  onClick={handleAutoLinkPhotos}
                  disabled={resetting || galleryUploading}
                  className="px-4 py-2 bg-gradient-to-r from-fala-magenta to-fala-blue hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center gap-1.5 self-start sm:self-center"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Auto-Link to Players ({players.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3 text-xs text-slate-400">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">How to Use & Auto-Link</h3>
                  <p className="leading-relaxed">
                    ● <strong className="text-slate-300">Bulk Upload:</strong> You can select multiple images at once to upload them in bulk!
                  </p>
                  <p className="leading-relaxed">
                    ● <strong className="text-slate-300">File Naming:</strong> Name your image files exactly after your players (e.g. <code className="text-fala-magenta font-semibold">John Doe.jpg</code>).
                  </p>
                  <p className="leading-relaxed">
                    ● <strong className="text-slate-300">Auto-Matching:</strong> Click the <strong className="text-fala-blue font-bold">Auto-Link to Players</strong> button to bind all gallery photos to matching player names automatically!
                  </p>
                  <p className="leading-relaxed">
                    ● <strong className="text-slate-300">Size Limit:</strong> Max size per image is <strong className="text-amber-400">800 KB</strong> to protect database performance.
                  </p>
                </div>

                {/* Image Upload Dropzone */}
                <div className="relative border-2 border-dashed border-white/10 hover:border-fala-blue/40 rounded-3xl p-8 transition-all bg-black/20 flex flex-col items-center justify-center text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      
                      setGalleryUploading(true);
                      const totalFiles = files.length;
                      let successCount = 0;
                      let errorCount = 0;
                      
                      for (let i = 0; i < totalFiles; i++) {
                        const file = files[i];
                        if (file.size > 800000) {
                          alert(`Image "${file.name}" is over 800KB and was skipped! Please compress or crop it first.`);
                          errorCount++;
                          continue;
                        }
                        
                        setBulkUploadStatus({
                          current: i + 1,
                          total: totalFiles,
                          msg: `Uploading "${file.name}"...`
                        });
                        
                        try {
                          await new Promise<void>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = async () => {
                              try {
                                const base64 = reader.result as string;
                                const defaultName = file.name.replace(/\.[^/.]+$/, "");
                                await addGalleryImage(defaultName.trim(), base64);
                                successCount++;
                                resolve();
                              } catch (err) {
                                reject(err);
                              }
                            };
                            reader.onerror = () => reject(new Error("File read error"));
                            reader.readAsDataURL(file);
                          });
                        } catch (err) {
                          console.error(`Failed to upload ${file.name}:`, err);
                          errorCount++;
                        }
                      }
                      
                      setGalleryUploading(false);
                      setBulkUploadStatus(null);
                      
                      if (successCount > 0) {
                        alert(`Successfully uploaded ${successCount} out of ${totalFiles} images to the gallery! 🎉${errorCount > 0 ? ` (${errorCount} failed/skipped)` : ''}`);
                      } else {
                        alert("No images were successfully uploaded.");
                      }
                    }}
                    disabled={galleryUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-fala-blue/10 text-fala-blue border border-fala-blue/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {galleryUploading ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-200">
                    {galleryUploading ? "Uploading bulk..." : "Select Profile Photos"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">supports multi-select / jpg, png, webp, gif</p>
                </div>

                {bulkUploadStatus && (
                  <div className="p-3 bg-fala-blue/10 border border-fala-blue/20 rounded-2xl text-center space-y-1.5 animate-pulse">
                    <p className="text-xs font-bold text-slate-200">
                      Processing Images ({bulkUploadStatus.current} / {bulkUploadStatus.total})
                    </p>
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-fala-blue h-full transition-all duration-300"
                        style={{ width: `${(bulkUploadStatus.current / bulkUploadStatus.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{bulkUploadStatus.msg}</p>
                  </div>
                )}
              </div>

              {/* Gallery Images List */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Stored Photos Library ({galleryImages.length})
                </h3>

                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-1.5 border border-white/5 bg-black/10 rounded-2xl">
                    {galleryImages.map((image) => (
                      <div 
                        key={image.id} 
                        className="bg-black/30 border border-white/10 hover:border-white/20 rounded-2xl p-3 flex flex-col justify-between items-center text-center gap-3 relative group"
                      >
                        <img 
                          src={image.dataUrl} 
                          alt={image.name} 
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-2xl object-cover bg-slate-900 border border-white/10"
                        />
                        <div className="w-full space-y-0.5">
                          <p className="text-xs font-black text-slate-200 truncate px-1" title={image.name}>
                            {image.name}
                          </p>
                          <p className="text-[9px] text-slate-500 uppercase font-mono">
                            {((image.dataUrl.length * 3) / 4 / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete "${image.name}" from the database gallery?`)) {
                              try {
                                await deleteGalleryImage(image.id);
                              } catch (err) {
                                console.error(err);
                                alert("Failed to delete image.");
                              }
                            }
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-rose-950/80 hover:bg-rose-600 border border-rose-900/40 hover:border-rose-500 text-rose-400 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[250px] border border-dashed border-white/5 bg-black/10 rounded-3xl flex flex-col items-center justify-center text-center p-6 text-slate-600">
                    <Layers className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs font-semibold">Image library is empty</p>
                    <p className="text-[11px] mt-1 max-w-sm">
                      Upload photos in the left panel. Once uploaded, you will be able to select them instantly for any competitor's profile!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

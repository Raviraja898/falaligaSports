import { Player, Owner } from './types';

export const INITIAL_OWNERS: Owner[] = [
  { id: 'tech-titans', name: 'Tech Titans', color: '#3b82f6', wallet: 1000000, initialWallet: 1000000 },
  { id: 'product-pirates', name: 'Product Pirates', color: '#f59e0b', wallet: 1000000, initialWallet: 1000000 },
  { id: 'marketing-mavericks', name: 'Marketing Mavericks', color: '#ec4899', wallet: 1000000, initialWallet: 1000000 },
  { id: 'sales-spartans', name: 'Sales Spartans', color: '#10b981', wallet: 1000000, initialWallet: 1000000 },
  { id: 'hr-heroes', name: 'HR Heroes', color: '#8b5cf6', wallet: 1000000, initialWallet: 1000000 },
];

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Sarah "Spreadsheet" Sorcerer',
    role: 'Excel & Data Analysis',
    skillRating: 94,
    basePrice: 100000,
    status: 'AVAILABLE',
    photoUrl: '📊',
    gender: 'Female',
    stats: { speed: 65, stamina: 88, teamwork: 90, focus: 98, funFactor: 70 }
  },
  {
    id: 'p2',
    name: 'Devon "Friday Deploy" Daredevil',
    role: 'Risk Management & Coding',
    skillRating: 88,
    basePrice: 80000,
    status: 'AVAILABLE',
    photoUrl: '🚀',
    gender: 'Male',
    stats: { speed: 95, stamina: 70, teamwork: 60, focus: 85, funFactor: 98 }
  },
  {
    id: 'p3',
    name: 'Maya "Mute-Mic" Legend',
    role: 'Meeting Etiquette & QA',
    skillRating: 91,
    basePrice: 90000,
    status: 'AVAILABLE',
    photoUrl: '🎙️',
    gender: 'Female',
    stats: { speed: 70, stamina: 90, teamwork: 95, focus: 92, funFactor: 80 }
  },
  {
    id: 'p4',
    name: 'Arjun "Inbox Zero" Hero',
    role: 'Operations & Communication',
    skillRating: 95,
    basePrice: 120000,
    status: 'AVAILABLE',
    photoUrl: '📥',
    gender: 'Male',
    stats: { speed: 99, stamina: 85, teamwork: 88, focus: 95, funFactor: 65 }
  },
  {
    id: 'p5',
    name: 'Chloe "Coffee Chugger" Chen',
    role: 'Speed & Endurance',
    skillRating: 86,
    basePrice: 70000,
    status: 'AVAILABLE',
    photoUrl: '☕',
    gender: 'Female',
    stats: { speed: 100, stamina: 99, teamwork: 75, focus: 60, funFactor: 90 }
  },
  {
    id: 'p6',
    name: 'Alex "Out of Office" Rivera',
    role: 'Work-Life Balance Advisor',
    skillRating: 89,
    basePrice: 90000,
    status: 'AVAILABLE',
    photoUrl: '🌴',
    gender: 'Male',
    stats: { speed: 40, stamina: 80, teamwork: 85, focus: 90, funFactor: 100 }
  },
  {
    id: 'p7',
    name: 'Marcus "Standup" Aurelius',
    role: 'Agile & Scrums',
    skillRating: 87,
    basePrice: 80000,
    status: 'AVAILABLE',
    photoUrl: '💬',
    gender: 'Male',
    stats: { speed: 60, stamina: 75, teamwork: 99, focus: 80, funFactor: 88 }
  },
  {
    id: 'p8',
    name: 'Lucas "Figma Wizard" Designer',
    role: 'Visuals & UI Polish',
    skillRating: 93,
    basePrice: 110000,
    status: 'AVAILABLE',
    photoUrl: '🎨',
    gender: 'Male',
    stats: { speed: 85, stamina: 80, teamwork: 82, focus: 96, funFactor: 85 }
  },
  {
    id: 'p9',
    name: 'Sasha "Direct Message" Ninja',
    role: 'Backchannel Negotiations',
    skillRating: 90,
    basePrice: 90000,
    status: 'AVAILABLE',
    photoUrl: '🥷',
    gender: 'Female',
    stats: { speed: 92, stamina: 78, teamwork: 80, focus: 94, funFactor: 75 }
  },
  {
    id: 'p10',
    name: 'Tom "Ping Pong" Champion',
    role: 'Recreational Officer',
    skillRating: 85,
    basePrice: 60000,
    status: 'AVAILABLE',
    photoUrl: '🏓',
    gender: 'Male',
    stats: { speed: 94, stamina: 88, teamwork: 78, focus: 85, funFactor: 99 }
  },
  {
    id: 'p11',
    name: 'Rachel "PowerPoint" Princess',
    role: 'Pitch & Presentation',
    skillRating: 92,
    basePrice: 100000,
    status: 'AVAILABLE',
    photoUrl: '📊',
    gender: 'Female',
    stats: { speed: 75, stamina: 82, teamwork: 94, focus: 90, funFactor: 85 }
  },
  {
    id: 'p12',
    name: 'Sam "Stack Overflow" Scholar',
    role: 'Troubleshooting & Search',
    skillRating: 91,
    basePrice: 95000,
    status: 'AVAILABLE',
    photoUrl: '📚',
    gender: 'Male',
    stats: { speed: 80, stamina: 85, teamwork: 85, focus: 99, funFactor: 70 }
  },
  {
    id: 'p13',
    name: 'Emily "Bug Hunter" Watson',
    role: 'QA & Test Automation',
    skillRating: 93,
    basePrice: 115000,
    status: 'AVAILABLE',
    photoUrl: '🐛',
    gender: 'Female',
    stats: { speed: 85, stamina: 92, teamwork: 88, focus: 95, funFactor: 80 }
  },
  {
    id: 'p14',
    name: 'Jessica "Jira Queen" Jones',
    role: 'Project Management & Timelines',
    skillRating: 90,
    basePrice: 95000,
    status: 'AVAILABLE',
    photoUrl: '📅',
    gender: 'Female',
    stats: { speed: 70, stamina: 85, teamwork: 93, focus: 91, funFactor: 82 }
  },
  {
    id: 'p15',
    name: 'Zoe "Brainstorm" Miller',
    role: 'Product Strategy & UX',
    skillRating: 92,
    basePrice: 105000,
    status: 'AVAILABLE',
    photoUrl: '🧠',
    gender: 'Female',
    stats: { speed: 80, stamina: 80, teamwork: 96, focus: 88, funFactor: 92 }
  },
  {
    id: 'p16',
    name: 'Daniel "Docker" Jenkins',
    role: 'DevOps & Infra Reliability',
    skillRating: 89,
    basePrice: 85000,
    status: 'AVAILABLE',
    photoUrl: '🐳',
    gender: 'Male',
    stats: { speed: 88, stamina: 82, teamwork: 78, focus: 94, funFactor: 76 }
  },
  {
    id: 'p17',
    name: 'Sophia "Social Media" Spark',
    role: 'Branding & Public Relations',
    skillRating: 87,
    basePrice: 75000,
    status: 'AVAILABLE',
    photoUrl: '✨',
    gender: 'Female',
    stats: { speed: 90, stamina: 80, teamwork: 92, focus: 75, funFactor: 95 }
  },
  {
    id: 'p18',
    name: 'Ryan "Keyboard Warrior" King',
    role: 'Speed Typing & Documentation',
    skillRating: 86,
    basePrice: 70000,
    status: 'AVAILABLE',
    photoUrl: '⌨️',
    gender: 'Male',
    stats: { speed: 98, stamina: 85, teamwork: 70, focus: 88, funFactor: 78 }
  },
  {
    id: 'p19',
    name: 'Isabella "Icebreaker" Lopez',
    role: 'Culture & Employee Bonding',
    skillRating: 88,
    basePrice: 80000,
    status: 'AVAILABLE',
    photoUrl: '🧊',
    gender: 'Female',
    stats: { speed: 75, stamina: 85, teamwork: 100, focus: 80, funFactor: 98 }
  },
  {
    id: 'p20',
    name: 'Tyler "Tea Master" Brooks',
    role: 'Pantry Logistics & Gossip',
    skillRating: 82,
    basePrice: 50000,
    status: 'AVAILABLE',
    photoUrl: '🍵',
    gender: 'Male',
    stats: { speed: 85, stamina: 70, teamwork: 80, focus: 70, funFactor: 95 }
  },
  {
    id: 'p21',
    name: 'Lily "Lint Master" Cooper',
    role: 'Code Quality & Standardizer',
    skillRating: 91,
    basePrice: 100000,
    status: 'AVAILABLE',
    photoUrl: '🧹',
    gender: 'Female',
    stats: { speed: 82, stamina: 88, teamwork: 84, focus: 98, funFactor: 72 }
  },
  {
    id: 'p22',
    name: 'Oliver "Overtime" Vance',
    role: 'Night Shift & Support Duty',
    skillRating: 85,
    basePrice: 65000,
    status: 'AVAILABLE',
    photoUrl: '🌃',
    gender: 'Male',
    stats: { speed: 70, stamina: 100, teamwork: 80, focus: 85, funFactor: 70 }
  },
  {
    id: 'p23',
    name: 'Ava "Analytics" Patel',
    role: 'BI Dashboards & SQL queries',
    skillRating: 94,
    basePrice: 120000,
    status: 'AVAILABLE',
    photoUrl: '📈',
    gender: 'Female',
    stats: { speed: 80, stamina: 85, teamwork: 90, focus: 97, funFactor: 80 }
  },
  {
    id: 'p24',
    name: 'Grace "Gratitude" Thompson',
    role: 'HR & Conflict Resolution',
    skillRating: 90,
    basePrice: 90000,
    status: 'AVAILABLE',
    photoUrl: '🤝',
    gender: 'Female',
    stats: { speed: 70, stamina: 85, teamwork: 98, focus: 92, funFactor: 88 }
  },
  {
    id: 'p25',
    name: 'Henry "Hardware" Hughes',
    role: 'IT Setup & Fiber Repair',
    skillRating: 87,
    basePrice: 75000,
    status: 'AVAILABLE',
    photoUrl: '🔌',
    gender: 'Male',
    stats: { speed: 88, stamina: 90, teamwork: 80, focus: 85, funFactor: 82 }
  },
  {
    id: 'p26',
    name: 'Mia "Meeting Scheduler" Young',
    role: 'Calendar Optimization',
    skillRating: 88,
    basePrice: 80000,
    status: 'AVAILABLE',
    photoUrl: '🗓️',
    gender: 'Female',
    stats: { speed: 92, stamina: 80, teamwork: 88, focus: 90, funFactor: 84 }
  },
  {
    id: 'p27',
    name: 'Ethan "Ethical Hacker" Ward',
    role: 'Cybersecurity & Auditing',
    skillRating: 95,
    basePrice: 130000,
    status: 'AVAILABLE',
    photoUrl: '🛡️',
    gender: 'Male',
    stats: { speed: 85, stamina: 85, teamwork: 75, focus: 100, funFactor: 70 }
  },
  {
    id: 'p28',
    name: 'Chloe "Creative Writer" Kim',
    role: 'PR & Corporate Copywriting',
    skillRating: 89,
    basePrice: 85000,
    status: 'AVAILABLE',
    photoUrl: '✍️',
    gender: 'Female',
    stats: { speed: 80, stamina: 82, teamwork: 90, focus: 88, funFactor: 90 }
  },
  {
    id: 'p29',
    name: 'Owen "Optimizer" Davis',
    role: 'Database Indexing & Caching',
    skillRating: 92,
    basePrice: 110000,
    status: 'AVAILABLE',
    photoUrl: '⚡',
    gender: 'Male',
    stats: { speed: 94, stamina: 80, teamwork: 82, focus: 98, funFactor: 75 }
  },
  {
    id: 'p30',
    name: 'Natalie "Note Taker" Diaz',
    role: 'Documentation & Wiki Management',
    skillRating: 86,
    basePrice: 70000,
    status: 'AVAILABLE',
    photoUrl: '📝',
    gender: 'Female',
    stats: { speed: 85, stamina: 85, teamwork: 88, focus: 85, funFactor: 80 }
  }
];

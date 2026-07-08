import { Player, Owner, AuctionState } from './types';

export const LOCAL_DATA_VERSION = '2026-07-08-image-fix-v2';

export const LOCAL_OWNERS: Owner[] = [
  {
    "id": "elite-eagle",
    "name": "Elite Eagle",
    "color": "#3b82f6",
    "wallet": 1000000,
    "initialWallet": 1000000
  },
  {
    "id": "ordervengers",
    "name": "Ordervengers",
    "color": "#f59e0b",
    "wallet": 1000000,
    "initialWallet": 1000000
  },
  {
    "id": "the-load-balancers",
    "name": "The Load Balancers",
    "color": "#ec4899",
    "wallet": 1000000,
    "initialWallet": 1000000
  },
  {
    "id": "the-groundbreakers",
    "name": "The Groundbreakers",
    "color": "#10b981",
    "wallet": 1000000,
    "initialWallet": 1000000
  },
  {
    "id": "synergy-slayers",
    "name": "Synergy Slayers",
    "color": "#8b5cf6",
    "wallet": 1000000,
    "initialWallet": 1000000
  },
  {
    "id": "falcon-fury",
    "name": "Falcon Fury",
    "color": "#ef4444",
    "wallet": 1000000,
    "initialWallet": 1000000
  },
  {
    "id": "ctl-alt-defeat",
    "name": "Ctl Alt Defeat",
    "color": "#06b6d4",
    "wallet": 1000000,
    "initialWallet": 1000000
  },
  {
    "id": "ekam",
    "name": "EKAM",
    "color": "#a855f7",
    "wallet": 1000000,
    "initialWallet": 1000000
  }
];

export const LOCAL_PLAYERS: Player[] = [
  {
    "id": "kumuda",
    "name": "Kumuda",
    "role": "Corporate Athlete",
    "skillRating": 28,
    "basePrice": 28000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Kumuda Pic_Kumuda Bopaiah.png",
    "stats": {
      "badminton": 70,
      "carroms": 0,
      "cricket": 70,
      "football": 0,
      "tt": 0
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "sachin-s-shivabugadi",
    "name": "sachin s shivabugadi",
    "role": "Corporate Athlete",
    "skillRating": 32,
    "basePrice": 32000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Sachin_Shambhaji_Shi.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "ragul-murugan",
    "name": "Ragul Murugan",
    "role": "Corporate Athlete",
    "skillRating": 46,
    "basePrice": 46000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Ragul M.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "mohit-b",
    "name": "Mohit B",
    "role": "Corporate Athlete",
    "skillRating": 63,
    "basePrice": 63000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Mohit_Mohit B.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 70,
      "football": 70,
      "tt": 95
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "akash-sharma",
    "name": "Akash Sharma",
    "role": "Corporate Athlete",
    "skillRating": 74,
    "basePrice": 74000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Akash Sharma.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 95,
      "cricket": 70,
      "football": 40,
      "tt": 95
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "deepak-kumar-pandit",
    "name": "Deepak Kumar Pandit",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Deepak Kumar Pandit.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 95,
      "cricket": 0,
      "football": 0,
      "tt": 95
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "dhananjay-dharne",
    "name": "Dhananjay Dharne",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/DJ_Dhananjay Suhas Dhar.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 70,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "keerthana-b-r",
    "name": "Keerthana B R",
    "role": "Corporate Athlete",
    "skillRating": 58,
    "basePrice": 58000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Keerthana B R.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 40,
      "football": 40,
      "tt": 70
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "sanjai-n",
    "name": "Sanjai N",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Sanjai N.jpg",
    "stats": {
      "badminton": 0,
      "carroms": 95,
      "cricket": 95,
      "football": 70,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "kiran-antony",
    "name": "Kiran Antony",
    "role": "Corporate Athlete",
    "skillRating": 42,
    "basePrice": 42000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Kiran Antony.jpg",
    "stats": {
      "badminton": 0,
      "carroms": 70,
      "cricket": 70,
      "football": 70,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "binu-paul",
    "name": "BINU PAUL",
    "role": "Corporate Athlete",
    "skillRating": 44,
    "basePrice": 44000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/BinuPaul_Binu Paul.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 0,
      "cricket": 40,
      "football": 70,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "dileep-kumar-g",
    "name": "Dileep Kumar G",
    "role": "Corporate Athlete",
    "skillRating": 74,
    "basePrice": 74000,
    "status": "AVAILABLE",
    "photoUrl": "",
    "stats": {
      "badminton": 95,
      "carroms": 70,
      "cricket": 95,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "rani-devi",
    "name": "Rani Devi",
    "role": "Corporate Athlete",
    "skillRating": 38,
    "basePrice": 38000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Rani Devi.JPG",
    "stats": {
      "badminton": 40,
      "carroms": 70,
      "cricket": 40,
      "football": 0,
      "tt": 40
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "venkat-ravada",
    "name": "Venkat Ravada",
    "role": "Corporate Athlete",
    "skillRating": 46,
    "basePrice": 46000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Ravada Venkataramana.png",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 70,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "vishnu-benny",
    "name": "Vishnu Benny",
    "role": "Corporate Athlete",
    "skillRating": 61,
    "basePrice": 61000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Vishnu Benny.jpeg",
    "stats": {
      "badminton": 0,
      "carroms": 70,
      "cricket": 95,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "anoop-kumar-mittapelli",
    "name": "Anoop Kumar Mittapelli",
    "role": "Corporate Athlete",
    "skillRating": 43,
    "basePrice": 43000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Anoop_Kumar_Mittapalli.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 95,
      "football": 0,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "madhumurthy-k",
    "name": "Madhumurthy K",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/MadhuKollu_Photo_Madhu Murthy Kollu.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 70,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "saurabh-negi",
    "name": "Saurabh Negi",
    "role": "Corporate Athlete",
    "skillRating": 64,
    "basePrice": 64000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Saurabh Negi.png",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "akhil-m-s",
    "name": "AKHIL M S",
    "role": "Corporate Athlete",
    "skillRating": 80,
    "basePrice": 80000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Akhil MS.JPG",
    "stats": {
      "badminton": 95,
      "carroms": 70,
      "cricket": 95,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "praveen-kumar",
    "name": "Praveen Kumar",
    "role": "Corporate Athlete",
    "skillRating": 40,
    "basePrice": 40000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Praveen Kumar Bhaska.png",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "aditya-mehta",
    "name": "Aditya Mehta",
    "role": "Corporate Athlete",
    "skillRating": 64,
    "basePrice": 64000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Aditya Mehta.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "vishal-khanna-s",
    "name": "Vishal Khanna S",
    "role": "Corporate Athlete",
    "skillRating": 44,
    "basePrice": 44000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Vishal Khanna S.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 0,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "bhavana-balachandran",
    "name": "Bhavana Balachandran",
    "role": "Corporate Athlete",
    "skillRating": 50,
    "basePrice": 50000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Bhavana Balachandran.png",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 70,
      "football": 0,
      "tt": 40
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "raveendra-bista",
    "name": "Raveendra Bista",
    "role": "Corporate Athlete",
    "skillRating": 60,
    "basePrice": 60000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Raveendra Bista.png",
    "stats": {
      "badminton": 95,
      "carroms": 0,
      "cricket": 95,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "anmol-narang",
    "name": "Anmol Narang",
    "role": "Corporate Athlete",
    "skillRating": 14,
    "basePrice": 14000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Anmol Narang.JPG",
    "stats": {
      "badminton": 0,
      "carroms": 0,
      "cricket": 0,
      "football": 70,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "pavel-ray",
    "name": "Pavel Ray",
    "role": "Corporate Athlete",
    "skillRating": 32,
    "basePrice": 32000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Pavel Ray.png",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "jayesh-jain",
    "name": "Jayesh Jain",
    "role": "Corporate Athlete",
    "skillRating": 46,
    "basePrice": 46000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Jayesh Jain.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 0,
      "cricket": 95,
      "football": 95,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "chintapalli-manikanta",
    "name": "Chintapalli Manikanta",
    "role": "Corporate Athlete",
    "skillRating": 58,
    "basePrice": 58000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Manikanta Chintapall.png",
    "stats": {
      "badminton": 40,
      "carroms": 70,
      "cricket": 70,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "glenvin-anil-rosario",
    "name": "Glenvin Anil Rosario",
    "role": "Corporate Athlete",
    "skillRating": 44,
    "basePrice": 44000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Glenvin Anil Rosario.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 0,
      "cricket": 70,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "shalini-p",
    "name": "Shalini P",
    "role": "Corporate Athlete",
    "skillRating": 63,
    "basePrice": 63000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Shalini P.jpeg",
    "stats": {
      "badminton": 95,
      "carroms": 70,
      "cricket": 40,
      "football": 40,
      "tt": 70
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "harshkumar-rajeshbhai-patel",
    "name": "Harshkumar Rajeshbhai Patel",
    "role": "Corporate Athlete",
    "skillRating": 46,
    "basePrice": 46000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Harshkumar Rajeshbha.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 70,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "navya-jaideep",
    "name": "Navya Jaideep",
    "role": "Corporate Athlete",
    "skillRating": 58,
    "basePrice": 58000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Navya Jaideep.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 40,
      "football": 70,
      "tt": 40
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "sumit-kumar",
    "name": "Sumit Kumar",
    "role": "Corporate Athlete",
    "skillRating": 46,
    "basePrice": 46000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Sumit Kumar.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "ankit-ammanagi",
    "name": "Ankit Ammanagi",
    "role": "Corporate Athlete",
    "skillRating": 42,
    "basePrice": 42000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Ankit Ammanagi.jpeg",
    "stats": {
      "badminton": 0,
      "carroms": 0,
      "cricket": 70,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "raksha-prasad-m",
    "name": "RAKSHA PRASAD M",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Raksha Prasad.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "suraj-hiremath",
    "name": "Suraj Hiremath",
    "role": "Corporate Athlete",
    "skillRating": 64,
    "basePrice": 64000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Suraj Hiremath.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "venkata-purandhar-chitteti",
    "name": "Venkata Purandhar Chitteti",
    "role": "Corporate Athlete",
    "skillRating": 50,
    "basePrice": 50000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/purandhar_Chitteti Venkata Pur.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 70,
      "football": 40,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "disha-v",
    "name": "Disha V",
    "role": "Corporate Athlete",
    "skillRating": 36,
    "basePrice": 36000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Disha V.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 0,
      "cricket": 70,
      "football": 40,
      "tt": 0
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "vishwanath-budugumpi",
    "name": "Vishwanath Budugumpi",
    "role": "Corporate Athlete",
    "skillRating": 69,
    "basePrice": 69000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Vishwanath Budugumpi.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 95,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "kirti-dhanapune",
    "name": "Kirti Dhanapune",
    "role": "Corporate Athlete",
    "skillRating": 38,
    "basePrice": 38000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/kirti_Kirti Dhanapune.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 0,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "sachin-gupta",
    "name": "Sachin Gupta",
    "role": "Corporate Athlete",
    "skillRating": 69,
    "basePrice": 69000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Sachin Gupta.png",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 95,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "nandan-r",
    "name": "Nandan R",
    "role": "Corporate Athlete",
    "skillRating": 16,
    "basePrice": 16000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Nandan R.jpeg",
    "stats": {
      "badminton": 0,
      "carroms": 40,
      "cricket": 0,
      "football": 0,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "arko-mitra",
    "name": "Arko Mitra",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Arko Antony Mitra.png",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 40,
      "football": 70,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "arjun-ghosh",
    "name": "Arjun ghosh",
    "role": "Corporate Athlete",
    "skillRating": 42,
    "basePrice": 42000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Arjun Ghosh.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 0,
      "cricket": 0,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "aman-kalal",
    "name": "Aman Kalal",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Aman Kalal.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "neetha-i-j",
    "name": "Neetha I J",
    "role": "Corporate Athlete",
    "skillRating": 14,
    "basePrice": 14000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Neetha Pic_Neetha IJ.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 0,
      "cricket": 0,
      "football": 0,
      "tt": 0
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "rahul-kiran",
    "name": "Rahul Kiran",
    "role": "Corporate Athlete",
    "skillRating": 30,
    "basePrice": 30000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Rahul Kiran.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 0,
      "football": 0,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "prasanna-kumar-r",
    "name": "Prasanna Kumar R",
    "role": "Corporate Athlete",
    "skillRating": 40,
    "basePrice": 40000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Prasanna_Prasanna Kumar R.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "vijay-anantpur",
    "name": "Vijay Anantpur",
    "role": "Corporate Athlete",
    "skillRating": 50,
    "basePrice": 50000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Vijay Anantpur.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 0,
      "cricket": 70,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "viswajith-k-n",
    "name": "Viswajith K N",
    "role": "Corporate Athlete",
    "skillRating": 28,
    "basePrice": 28000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Viswajith K N.jpeg",
    "stats": {
      "badminton": 0,
      "carroms": 70,
      "cricket": 70,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "lakshya-ruhela",
    "name": "Lakshya Ruhela",
    "role": "Corporate Athlete",
    "skillRating": 75,
    "basePrice": 75000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Lakshya Ruhela.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 95,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "vinayak-bhandage",
    "name": "Vinayak Bhandage",
    "role": "Corporate Athlete",
    "skillRating": 58,
    "basePrice": 58000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Vinayak Bhandage.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 70,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "madhu",
    "name": "Madhu",
    "role": "Corporate Athlete",
    "skillRating": 47,
    "basePrice": 47000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Madhu.png",
    "stats": {
      "badminton": 0,
      "carroms": 70,
      "cricket": 95,
      "football": 70,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "vishnu-mohan",
    "name": "Vishnu Mohan",
    "role": "Corporate Athlete",
    "skillRating": 44,
    "basePrice": 44000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Vishnu Mohan.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 70,
      "football": 70,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "pratyush-prakash",
    "name": "Pratyush Prakash",
    "role": "Corporate Athlete",
    "skillRating": 58,
    "basePrice": 58000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Pratyush Prakash.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 70,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "tushar-tekta",
    "name": "Tushar Tekta",
    "role": "Corporate Athlete",
    "skillRating": 63,
    "basePrice": 63000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Tushar Tekta.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 70,
      "cricket": 95,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "sushmitha-m",
    "name": "Sushmitha M",
    "role": "Corporate Athlete",
    "skillRating": 14,
    "basePrice": 14000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/sush_Sushmitha M.png",
    "stats": {
      "badminton": 0,
      "carroms": 0,
      "cricket": 0,
      "football": 0,
      "tt": 70
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "rashmi-kadam",
    "name": "Rashmi Kadam",
    "role": "Corporate Athlete",
    "skillRating": 24,
    "basePrice": 24000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Rashmi Kadam_Rashmi Kadam.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 0,
      "tt": 0
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "nisha-naik",
    "name": "Nisha Naik",
    "role": "Corporate Athlete",
    "skillRating": 50,
    "basePrice": 50000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Nisha Naik.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 0,
      "football": 40,
      "tt": 70
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "iliyas-mulla",
    "name": "Iliyas Mulla",
    "role": "Corporate Athlete",
    "skillRating": 32,
    "basePrice": 32000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Mulla Iliyas.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 0,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "riddhi-bastwadkar",
    "name": "Riddhi Bastwadkar",
    "role": "Corporate Athlete",
    "skillRating": 22,
    "basePrice": 22000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Riddhi Bastwadkar.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 0,
      "football": 0,
      "tt": 0
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "santosh-killamsetty",
    "name": "Santosh Killamsetty",
    "role": "Corporate Athlete",
    "skillRating": 56,
    "basePrice": 56000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Santosh Killamsetty.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 0,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "koushik-bhattacharya",
    "name": "Koushik Bhattacharya",
    "role": "Corporate Athlete",
    "skillRating": 40,
    "basePrice": 40000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/koushik_pic_Koushik Bhattacharya.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "himansu-sekhar-sahoo",
    "name": "HIMANSU SEKHAR SAHOO",
    "role": "Corporate Athlete",
    "skillRating": 58,
    "basePrice": 58000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Himansu Sekhar Sahoo.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 70,
      "cricket": 70,
      "football": 70,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "sri-sathwik",
    "name": "Sri Sathwik",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Sri Srinivasa Ganga.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "ujwal-manjunath",
    "name": "Ujwal Manjunath",
    "role": "Corporate Athlete",
    "skillRating": 44,
    "basePrice": 44000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Ujwal Manjunath.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 40,
      "football": 0,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "dharnendra-l-v",
    "name": "Dharnendra L V",
    "role": "Corporate Athlete",
    "skillRating": 70,
    "basePrice": 70000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Dharnendra L V.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 70,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "nitish-kumar-kushwaha",
    "name": "Nitish Kumar Kushwaha",
    "role": "Corporate Athlete",
    "skillRating": 22,
    "basePrice": 22000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Nitish Kumar Kushwah.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 0,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "gokul-raja",
    "name": "Gokul Raja",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Gokul Raja TS.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 70,
      "cricket": 40,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "ganesh-sanjay-margale",
    "name": "Ganesh Sanjay Margale",
    "role": "Corporate Athlete",
    "skillRating": 46,
    "basePrice": 46000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Ganesh Sanjay Margal.PNG",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "don-chakkappan",
    "name": "Don Chakkappan",
    "role": "Corporate Athlete",
    "skillRating": 22,
    "basePrice": 22000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Don_Chakkappan.jpg",
    "stats": {
      "badminton": 0,
      "carroms": 40,
      "cricket": 70,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "maddali-sudheer",
    "name": "Maddali Sudheer",
    "role": "Corporate Athlete",
    "skillRating": 74,
    "basePrice": 74000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Maddali Sudheer.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 95,
      "football": 95,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "kiran-bendekere",
    "name": "Kiran Bendekere",
    "role": "Corporate Athlete",
    "skillRating": 36,
    "basePrice": 36000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Kiran Bendekere.png",
    "stats": {
      "badminton": 0,
      "carroms": 0,
      "cricket": 70,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "so",
    "name": "So",
    "role": "Corporate Athlete",
    "skillRating": 58,
    "basePrice": 58000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Maqsood Desai.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 70,
      "cricket": 70,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "lohit-v",
    "name": "Lohit V",
    "role": "Corporate Athlete",
    "skillRating": 30,
    "basePrice": 30000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Lohit V.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 70,
      "cricket": 40,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "anupam-kumar",
    "name": "Anupam Kumar",
    "role": "Corporate Athlete",
    "skillRating": 74,
    "basePrice": 74000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Anupam Kumar.jpg",
    "stats": {
      "badminton": 95,
      "carroms": 70,
      "cricket": 95,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "varun-hs",
    "name": "Varun HS",
    "role": "Corporate Athlete",
    "skillRating": 36,
    "basePrice": 36000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Varun HS.jpg",
    "stats": {
      "badminton": 0,
      "carroms": 70,
      "cricket": 40,
      "football": 0,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "vipin-u-n",
    "name": "Vipin U N",
    "role": "Corporate Athlete",
    "skillRating": 44,
    "basePrice": 44000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Vipin UN.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 0,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "hrishikesh-s-raj",
    "name": "Hrishikesh S Raj",
    "role": "Corporate Athlete",
    "skillRating": 58,
    "basePrice": 58000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Hrishikesh Raj.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 70,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "udhay",
    "name": "Udhay",
    "role": "Corporate Athlete",
    "skillRating": 58,
    "basePrice": 58000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Udhaya Kumar.png",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "yash-pendse",
    "name": "Yash Pendse",
    "role": "Corporate Athlete",
    "skillRating": 64,
    "basePrice": 64000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Yash Pendse.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 70,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "shubhi-goyal",
    "name": "Shubhi Goyal",
    "role": "Corporate Athlete",
    "skillRating": 16,
    "basePrice": 16000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Shubhi Goyal.jpg",
    "stats": {
      "badminton": 0,
      "carroms": 40,
      "cricket": 40,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "pratik-g-desai",
    "name": "Pratik G Desai",
    "role": "Corporate Athlete",
    "skillRating": 40,
    "basePrice": 40000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Pratik Desai.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "vishant-singh",
    "name": "Vishant Singh",
    "role": "Corporate Athlete",
    "skillRating": 80,
    "basePrice": 80000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Vishant Singh.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 95,
      "football": 95,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "suraj-pakhare",
    "name": "Suraj Pakhare",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Suraj Pakhare.png",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "d-v-dileep",
    "name": "D V Dileep",
    "role": "Corporate Athlete",
    "skillRating": 32,
    "basePrice": 32000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/D V Dileep.JPG",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "gutta-amarnath",
    "name": "Gutta Amarnath",
    "role": "Corporate Athlete",
    "skillRating": 8,
    "basePrice": 8000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/pic_Amarnath Gutta.png",
    "stats": {
      "badminton": 0,
      "carroms": 0,
      "cricket": 40,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "vikram-gurubelli",
    "name": "Vikram Gurubelli",
    "role": "Corporate Athlete",
    "skillRating": 24,
    "basePrice": 24000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Gurubelli Vikram.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 0,
      "football": 0,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "revathi",
    "name": "Revathi",
    "role": "Corporate Athlete",
    "skillRating": 24,
    "basePrice": 24000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Revathi Mallikarjun.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 0,
      "football": 0,
      "tt": 40
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "rajesh-vavilala",
    "name": "Rajesh Vavilala",
    "role": "Corporate Athlete",
    "skillRating": 55,
    "basePrice": 55000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Rajesh Vavilala.png",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 95,
      "football": 40,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "chennam-yuvaraju",
    "name": "Chennam Yuvaraju",
    "role": "Corporate Athlete",
    "skillRating": 22,
    "basePrice": 22000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Chennam Yuvaraju.JPG",
    "stats": {
      "badminton": 70,
      "carroms": 0,
      "cricket": 40,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "k-c-santosh",
    "name": "K C Santosh",
    "role": "Corporate Athlete",
    "skillRating": 44,
    "basePrice": 44000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Santosh Killamsetty.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 70,
      "football": 40,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "siddarth-s-desai",
    "name": "Siddarth S Desai",
    "role": "Corporate Athlete",
    "skillRating": 40,
    "basePrice": 40000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Siddarth Desai.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "mahesh-nironi",
    "name": "Mahesh Nironi",
    "role": "Corporate Athlete",
    "skillRating": 41,
    "basePrice": 41000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/mahesh_Mahesh Nironi.png",
    "stats": {
      "badminton": 40,
      "carroms": 95,
      "cricket": 70,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "manshu-saingar",
    "name": "Manshu Saingar",
    "role": "Corporate Athlete",
    "skillRating": 50,
    "basePrice": 50000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Manshu Saingar.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 70,
      "football": 40,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "abhisek-mallick",
    "name": "Abhisek Mallick",
    "role": "Corporate Athlete",
    "skillRating": 46,
    "basePrice": 46000,
    "status": "AVAILABLE",
    "photoUrl": "",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 70,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "maqsood-desai",
    "name": "Maqsood Desai",
    "role": "Corporate Athlete",
    "skillRating": 46,
    "basePrice": 46000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Maqsood Desai.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "ayushi-kushwaha",
    "name": "Ayushi Kushwaha",
    "role": "Corporate Athlete",
    "skillRating": 40,
    "basePrice": 40000,
    "status": "AVAILABLE",
    "photoUrl": "",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "thoshima-kaveramma-b-s",
    "name": "Thoshima Kaveramma B S",
    "role": "Corporate Athlete",
    "skillRating": 28,
    "basePrice": 28000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Thoshima Kaveramma.png",
    "stats": {
      "badminton": 0,
      "carroms": 70,
      "cricket": 0,
      "football": 70,
      "tt": 0
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "shruti-l-gataraddihal",
    "name": "Shruti L Gataraddihal",
    "role": "Corporate Athlete",
    "skillRating": 24,
    "basePrice": 24000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Dharnendra L V.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "praveen-g-kalmath",
    "name": "Praveen G Kalmath",
    "role": "Corporate Athlete",
    "skillRating": 36,
    "basePrice": 36000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Praveen G Kalmath.jpeg",
    "stats": {
      "badminton": 0,
      "carroms": 40,
      "cricket": 70,
      "football": 70,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "ashish-kaushal",
    "name": "Ashish Kaushal",
    "role": "Corporate Athlete",
    "skillRating": 24,
    "basePrice": 24000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Ashish Kaushal.jpg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 0,
      "football": 40,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "jagadishwari-s",
    "name": "Jagadishwari S",
    "role": "Corporate Athlete",
    "skillRating": 40,
    "basePrice": 40000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Vishal Khanna S.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "govind-s",
    "name": "Govind S",
    "role": "Corporate Athlete",
    "skillRating": 22,
    "basePrice": 22000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Govind S.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 0,
      "cricket": 0,
      "football": 70,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "vishnu-k-p",
    "name": "Vishnu K P",
    "role": "Corporate Athlete",
    "skillRating": 56,
    "basePrice": 56000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Vishnu Benny.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 70,
      "cricket": 0,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "peethani-raviraja",
    "name": "Peethani RaviRaja",
    "role": "Corporate Athlete",
    "skillRating": 80,
    "basePrice": 80000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Peethani_RaviRaja.jpeg",
    "stats": {
      "badminton": 95,
      "carroms": 70,
      "cricket": 95,
      "football": 70,
      "tt": 70
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "shaik-rahul",
    "name": "Shaik Rahul",
    "role": "Corporate Athlete",
    "skillRating": 27,
    "basePrice": 27000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Shaik Rahul.jpg",
    "stats": {
      "badminton": 0,
      "carroms": 40,
      "cricket": 95,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "kalp-agarwal",
    "name": "Kalp Agarwal",
    "role": "Corporate Athlete",
    "skillRating": 8,
    "basePrice": 8000,
    "status": "AVAILABLE",
    "photoUrl": "",
    "stats": {
      "badminton": 40,
      "carroms": 0,
      "cricket": 0,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "aryan-choudhary",
    "name": "aryan choudhary",
    "role": "Corporate Athlete",
    "skillRating": 40,
    "basePrice": 40000,
    "status": "AVAILABLE",
    "photoUrl": "",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "anmol-rajput",
    "name": "ANMOL RAJPUT",
    "role": "Corporate Athlete",
    "skillRating": 38,
    "basePrice": 38000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Anmol Rajput.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 0,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "souvik-biswas",
    "name": "Souvik Biswas",
    "role": "Corporate Athlete",
    "skillRating": 44,
    "basePrice": 44000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Souvik Biswas.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 70,
      "football": 70,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "bharath-s",
    "name": "Bharath S",
    "role": "Corporate Athlete",
    "skillRating": 16,
    "basePrice": 16000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Bharath S.jpeg",
    "stats": {
      "badminton": 40,
      "carroms": 0,
      "cricket": 0,
      "football": 0,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "agatya-panigrahy",
    "name": "Agatya Panigrahy",
    "role": "Corporate Athlete",
    "skillRating": 24,
    "basePrice": 24000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Agatya Panigrahy.png",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 0,
      "football": 0,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "rohith-h",
    "name": "Rohith H",
    "role": "Corporate Athlete",
    "skillRating": 46,
    "basePrice": 46000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Rohith H.jpg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 40,
      "football": 40,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "rupali-gangarde",
    "name": "Rupali Gangarde",
    "role": "Corporate Athlete",
    "skillRating": 32,
    "basePrice": 32000,
    "status": "AVAILABLE",
    "photoUrl": "",
    "stats": {
      "badminton": 40,
      "carroms": 40,
      "cricket": 40,
      "football": 0,
      "tt": 40
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "kumuda-naik",
    "name": "Kumuda Naik",
    "role": "Corporate Athlete",
    "skillRating": 38,
    "basePrice": 38000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/KumudaNaik.jpeg",
    "stats": {
      "badminton": 70,
      "carroms": 40,
      "cricket": 40,
      "football": 0,
      "tt": 40
    },
    "gender": "Female",
    "falaLeague": "No"
  },
  {
    "id": "mahesh",
    "name": "mahesh",
    "role": "Corporate Athlete",
    "skillRating": 36,
    "basePrice": 36000,
    "status": "AVAILABLE",
    "photoUrl": "/player-images/Mahesh Chinchure.JPG",
    "stats": {
      "badminton": 40,
      "carroms": 70,
      "cricket": 70,
      "football": 0,
      "tt": 0
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "himanshu-jaiswal",
    "name": "Himanshu Jaiswal",
    "role": "Corporate Athlete",
    "skillRating": 52,
    "basePrice": 52000,
    "status": "AVAILABLE",
    "photoUrl": "",
    "stats": {
      "badminton": 40,
      "carroms": 70,
      "cricket": 40,
      "football": 70,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  },
  {
    "id": "vikhyath-bm",
    "name": "Vikhyath BM",
    "role": "Corporate Athlete",
    "skillRating": 46,
    "basePrice": 46000,
    "status": "AVAILABLE",
    "photoUrl": "",
    "stats": {
      "badminton": 95,
      "carroms": 0,
      "cricket": 95,
      "football": 0,
      "tt": 40
    },
    "gender": "Male",
    "falaLeague": "No"
  }
];

export const LOCAL_AUCTION_STATE: AuctionState = {
  activePlayerId: null,
  status: 'IDLE',
  tiedOwners: [],
  originalWinningAmount: 0,
  maxTeamSize: 15,
  minGirlsCount: 4,
  defaultMinBid: 5000,
  autoRandomMode: false,
  lastSoldPlayerId: null
};

export const LOCAL_STORAGE_KEYS = {
  players: 'falaliga_local_players',
  owners: 'falaliga_local_owners',
  bids: 'falaliga_local_bids',
  auction: 'falaliga_local_auction',
  dataVersion: 'falaliga_local_data_version'
};

export function getStoredDataVersion(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LOCAL_STORAGE_KEYS.dataVersion);
}

export function setStoredDataVersion(version: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.dataVersion, version);
}

export function getStoredPlayers(): Player[] | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.players);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Player[];
  } catch {
    return null;
  }
}

export function setStoredPlayers(players: Player[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.players, JSON.stringify(players));
}

export function setStoredOwners(owners: Owner[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.owners, JSON.stringify(owners));
}

export function getStoredOwners(): Owner[] | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.owners);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Owner[];
  } catch {
    return null;
  }
}

export function setStoredAuctionState(state: AuctionState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.auction, JSON.stringify(state));
}

export function getStoredAuctionState(): AuctionState | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.auction);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuctionState;
  } catch {
    return null;
  }
}

export function getStoredBids() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.bids);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setStoredBids(bids: unknown[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.bids, JSON.stringify(bids));
}

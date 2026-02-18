export type UserRole = 'GIVER' | 'RECEIVER' | null;

export type ItemType = 'FOOD' | 'CLOTHES' | 'OTHERS';

export interface Location {
  lat: number;
  lng: number;
  label: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  isAnonymous: boolean;
  role: UserRole;
  bio?: string;
  latitude?: number;
  longitude?: number;
  tags?: ItemType[]; // What they generally need
  distance?: string; // e.g. "3.5 km"
  stats?: {
    given: number;
    received: number;
  };
}

export interface Item {
  id: string;
  kind?: 'OFFER' | 'REQUEST'; // Frontend uses kind
  type?: string;              // Backend uses type
  category?: string;
  title: string;
  quantity?: string; // e.g., "2 bags", "3 meals"
  description: string;
  distance?: string; // Pre-calculated string for UI
  location?: string; // Backend location
  isAnonymous: boolean;
  userName?: string;
  userId?: string;
  createdAt: string | Date;
  status: 'AVAILABLE' | 'TAKEN' | 'CLAIMED' | 'COMPLETED' | string;
  latitude?: number;
  longitude?: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  type: 'text' | 'location';
  location?: Location;
  timestamp: string;
  isMe: boolean;
}

export interface ChatSession {
  id: string;
  itemId: string;
  itemTitle: string;
  otherUserRole: string; // "Neighbor" or specific name
  messages: Message[];
  updatedAt: Date;
}
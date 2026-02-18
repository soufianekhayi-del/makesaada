import { Item, Message, User } from './types';

export const APP_NAME = "Tadamon";

// Mock Data
export const MOCK_ITEMS: Item[] = [
  // OFFERS (Seen by Receivers)
  {
    id: '1',
    kind: 'OFFER',
    type: 'FOOD',
    title: 'Hot Couscous (Family Size)',
    quantity: '1 large pot',
    description: 'Freshly made vegetable couscous, enough for 4 people.',
    distance: '300m',
    isAnonymous: true,
    createdAt: '10 mins ago',
    status: 'AVAILABLE',
  },
  {
    id: '2',
    kind: 'OFFER',
    type: 'CLOTHES',
    title: 'Winter Jacket',
    quantity: 'Size L',
    description: 'Good condition, warm wool coat.',
    distance: '1.2km',
    isAnonymous: false,
    userName: 'Ahmed K.',
    createdAt: '1 hour ago',
    status: 'AVAILABLE',
  },
  {
    id: '3',
    kind: 'OFFER',
    type: 'FOOD',
    title: 'Bread and Pastries',
    quantity: 'Bag of 10',
    description: 'Leftover from bakery, still fresh.',
    distance: '500m',
    isAnonymous: true,
    createdAt: '2 hours ago',
    status: 'AVAILABLE',
  },
  
  // REQUESTS (Seen by Givers)
  {
    id: '4',
    kind: 'REQUEST',
    type: 'FOOD',
    title: 'Dinner for 2 Children',
    quantity: '2 meals',
    description: 'Looking for a warm meal for tonight if possible.',
    distance: '400m',
    isAnonymous: true,
    createdAt: '15 mins ago',
    status: 'AVAILABLE',
  },
  {
    id: '5',
    kind: 'REQUEST',
    type: 'CLOTHES',
    title: 'Baby Shoes Needed',
    quantity: 'Size 20-22',
    description: 'My son has outgrown his shoes, looking for any condition.',
    distance: '2km',
    isAnonymous: false,
    userName: 'Fatima B.',
    createdAt: '3 hours ago',
    status: 'AVAILABLE',
  },
  {
    id: '6',
    kind: 'REQUEST',
    type: 'FOOD',
    title: 'Flour and Oil',
    quantity: 'Basics',
    description: 'Running low on pantry staples for the week.',
    distance: '800m',
    isAnonymous: true,
    createdAt: '5 hours ago',
    status: 'AVAILABLE',
  }
];

export const MOCK_RECEIVERS: User[] = [
  {
    id: 'u1',
    name: 'Anonymous Neighbor',
    isAnonymous: true,
    role: 'RECEIVER',
    bio: 'Mother of three, looking for occasional food support.',
    tags: ['FOOD'],
    distance: '200m'
  },
  {
    id: 'u2',
    name: 'Youssef A.',
    isAnonymous: false,
    role: 'RECEIVER',
    bio: 'Student living alone, sometimes need help with groceries.',
    tags: ['FOOD'],
    distance: '1.5km'
  },
  {
    id: 'u3',
    name: 'The Benali Family',
    isAnonymous: false,
    role: 'RECEIVER',
    bio: 'We recently lost our home to a fire. Anything helps.',
    tags: ['CLOTHES', 'FOOD'],
    distance: '500m'
  },
  {
    id: 'u4',
    name: 'Anonymous Neighbor',
    isAnonymous: true,
    role: 'RECEIVER',
    bio: 'Elderly couple, difficulty walking to market.',
    tags: ['FOOD'],
    distance: '300m'
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'other',
    text: 'Salam, is the couscous still available?',
    type: 'text',
    timestamp: '10:05 AM',
    isMe: false,
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Wa alaykum salam. Yes it is!',
    type: 'text',
    timestamp: '10:06 AM',
    isMe: true,
  },
  {
    id: '3',
    senderId: 'other',
    text: 'Great, can I pick it up in 15 mins?',
    type: 'text',
    timestamp: '10:07 AM',
    isMe: false,
  },
];
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Filter, Package, Shirt, Archive, HandHeart, Heart, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Item, UserRole, User as UserType } from '../types';

import { api } from '../services/api';

interface HomeProps {
  userRole: UserRole;
  items: Item[];
  receivers: UserType[];
  onOfferHelp: (item: Item) => void;
  onContactUser: (user: UserType) => void;
  radius: number;
  setRadius: (r: number) => void;
  locationMode: 'GPS' | 'MANUAL';
  setLocationMode: (mode: 'GPS' | 'MANUAL') => void;
  myLocation: { lat: number, lng: number } | null;
}

export const Home: React.FC<HomeProps> = ({
  userRole, items, receivers, onOfferHelp, onContactUser,
  radius, setRadius, locationMode, setLocationMode, myLocation
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'ALL' | 'FOOD' | 'CLOTHES' | 'OTHERS'>('ALL');
  const [viewMode, setViewMode] = useState<'REQUESTS' | 'NEIGHBORS'>('REQUESTS');

  // Constants for Manual Location (Casablanca Center)
  const CASABLANCA_COORDS = { lat: 33.5731, lng: -7.5898 };

  // Logic: 
  // If User is GIVER -> Show REQUESTS
  // If User is RECEIVER -> Show OFFERS
  const targetKind = userRole === 'GIVER' ? 'REQUEST' : 'OFFER';

  const filteredItems = items.filter(item => {
    // 1. Kind Filter
    if (item.kind !== targetKind) return false;

    // 2. Type Filter
    if (filter !== 'ALL' && item.type !== filter) return false;

    // 3. Distance Filter
    // Always use myLocation if available (which satisfies GPS or MANUAL)
    if (myLocation && (item.latitude || item.location)) {
      const itemLat = (item as any).latitude || CASABLANCA_COORDS.lat;
      const itemLng = (item as any).longitude || CASABLANCA_COORDS.lng;

      const dist = api.utils.calculateDistance(myLocation.lat, myLocation.lng, itemLat, itemLng);

      // Update item distance for display
      item.distance = api.utils.formatDistance(dist);

      if (dist > radius) return false;
    }

    return true;
  });

  const title = userRole === 'GIVER' ? t('home.requestsNearby') : t('home.donationsNearby');

  return (
    <div className="pt-6 px-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-morocco-green">
            {viewMode === 'NEIGHBORS' ? t('home.community') : title}
          </h1>

          <div className="flex items-center gap-2 mt-2">
            <div
              className="flex items-center gap-1 text-xs border border-morocco-green/20 bg-morocco-green/5 rounded-full px-2 py-1"
            >
              <MapPin size={12} className="text-morocco-green" />
              <span className="font-medium text-morocco-green">
                {t('chat.currentLocation')}
              </span>
            </div>
            <span className="text-xs text-gray-400">•</span>
            <p className="text-xs text-gray-500 font-mono">{radius} km</p>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
          />
        </div>
      </div>

      {/* Giver View Toggle (Requests vs Neighbors) */}
      {userRole === 'GIVER' && (
        <div className="bg-white p-1 rounded-xl flex mb-6 border border-gray-100 shadow-sm">
          <button
            onClick={() => setViewMode('REQUESTS')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${viewMode === 'REQUESTS' ? 'bg-morocco-green text-white shadow-md' : 'text-gray-400 hover:text-morocco-green'}`}
          >
            {t('home.viewRequests')}
          </button>
          <button
            onClick={() => setViewMode('NEIGHBORS')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${viewMode === 'NEIGHBORS' ? 'bg-morocco-green text-white shadow-md' : 'text-gray-400 hover:text-morocco-green'}`}
          >
            {t('home.viewNeighbors')}
          </button>
        </div>
      )}

      {/* Item Filters (Only show if in Item mode) */}
      {viewMode === 'REQUESTS' && (
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2 shrink-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${filter === 'ALL' ? 'bg-morocco-charcoal text-white border-morocco-charcoal' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            {t('home.filterAll')}
          </button>
          <button
            onClick={() => setFilter('FOOD')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${filter === 'FOOD' ? 'bg-morocco-green text-white border-morocco-green' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            <Package size={14} /> {t('home.filterFood')}
          </button>
          <button
            onClick={() => setFilter('CLOTHES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${filter === 'CLOTHES' ? 'bg-morocco-terracotta text-white border-morocco-terracotta' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            <Shirt size={14} /> {t('home.filterClothes')}
          </button>
          <button
            onClick={() => setFilter('OTHERS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${filter === 'OTHERS' ? 'bg-morocco-sandDark text-morocco-charcoal border-morocco-sandDark' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            <Archive size={14} /> {t('create.others')}
          </button>
        </div>
      )}

      {/* Content Area */}
      {viewMode === 'REQUESTS' ? (
        <div className="space-y-4 pb-20 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 opacity-50 col-span-full">
              <p className="text-gray-500">{t(filter === 'ALL' ? (viewMode === 'REQUESTS' ? 'home.emptyRequests' : 'home.emptyDonations') : 'home.emptyDonations')}</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <DonationCard
                key={item.id}
                item={item}
                index={index}
                userRole={userRole}
                onAction={() => item.kind === 'REQUEST' ? onOfferHelp(item) : onOfferHelp(item)}
              />
            ))
          )}
        </div>
      ) : (
        // NEIGHBORS VIEW (Registered Receivers)
        <div className="space-y-4 pb-20 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
          {receivers.map((user, index) => (
            <NeighborCard key={user.id} user={user} index={index} onContact={() => onContactUser(user)} />
          ))}
        </div>
      )}
    </div>
  );
};

const NeighborCard: React.FC<{ user: UserType; index: number; onContact: () => void }> = ({ user, index, onContact }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-transparent hover:border-morocco-green/20 transition-all active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-morocco-sandDark flex items-center justify-center text-morocco-charcoal shrink-0">
          <User size={24} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-morocco-charcoal">{user.name}</h3>
            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{user.distance}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 mb-2 leading-relaxed">{user.bio}</p>
          <div className="flex gap-2 mb-3">
            {user.tags?.map(tag => (
              <span key={tag} className={`text-[10px] font-bold px-2 py-1 rounded-full ${tag === 'FOOD' ? 'bg-morocco-green/10 text-morocco-green' : 'bg-morocco-terracotta/10 text-morocco-terracotta'}`}>
                {tag === 'FOOD' ? t('create.food') : (tag === 'CLOTHES' ? t('create.clothes') : tag)}
              </span>
            ))}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="w-full bg-white border border-morocco-green text-morocco-green py-2 rounded-lg text-sm font-medium hover:bg-morocco-green hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            {t('home.reachOut') || 'Reach Out'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const DonationCard: React.FC<{ item: Item; index: number; userRole: UserRole; onAction: () => void }> = ({ item, index, userRole, onAction }) => {
  const { t } = useTranslation();
  // If I am a Giver viewing a Request, styling might be slightly different
  const isRequest = item.kind === 'REQUEST';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-transparent hover:border-morocco-green/20 transition-all active:scale-[0.99]"
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`
          px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1
          ${item.type === 'FOOD' ? 'bg-morocco-green/10 text-morocco-green' : (item.type === 'CLOTHES' ? 'bg-morocco-terracotta/10 text-morocco-terracotta' : 'bg-gray-100 text-gray-600')}
        `}>
          {isRequest && <HandHeart size={10} />}
          {!isRequest && <Heart size={10} />}
          {isRequest
            ? `${t('home.requested')}: ${item.type === 'FOOD' ? t('create.food') : (item.type === 'CLOTHES' ? t('create.clothes') : t('create.others'))}`
            : (item.type === 'FOOD' ? t('create.food') : (item.type === 'CLOTHES' ? t('create.clothes') : t('create.others')))}
        </div>
        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{item.distance}</span>
      </div>

      <h3 className="font-bold text-morocco-charcoal text-lg mb-1">{item.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3 mt-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-500">{item.quantity}</span>
        </div>
        <div className="flex items-center gap-1">
          {item.isAnonymous ? (
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300"></span> {t('home.anonymous')}</span>
          ) : (
            <span>{item.userName || t('home.neighbor')}</span>
          )}
        </div>
      </div>

      {/* If Giver, show action button to help */}
      {userRole === 'GIVER' && isRequest && (
        <div className="mt-3 pt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            className="w-full bg-morocco-green text-white py-2 rounded-lg text-sm font-medium hover:bg-morocco-greenLight active:scale-95 transition-transform"
          >
            {t('home.offerHelp')}
          </button>
        </div>
      )}

      {/* If Receiver viewing Donation, show action button to request */}
      {userRole === 'RECEIVER' && !isRequest && (
        <div className="mt-3 pt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            className="w-full bg-morocco-terracotta text-white py-2 rounded-lg text-sm font-medium hover:bg-morocco-terracottaDark active:scale-95 transition-transform"
          >
            {t('home.contactGiver')}
          </button>
        </div>
      )}
    </motion.div>
  );
};
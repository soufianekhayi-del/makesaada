import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, ChevronLeft, Send, MapPin, X } from 'lucide-react';
import { ChatSession, Location } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../services/api';

interface ChatProps {
  chats: ChatSession[];
  onSendMessage: (chatId: string, text: string) => void;
  onSendLocation: (chatId: string, location: Location) => void;
}

export const Chat: React.FC<ChatProps> = ({ chats, onSendMessage, onSendLocation }) => {
  const { t } = useTranslation();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isLoadingLink, setIsLoadingLink] = useState(false);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedChatId) return;
    onSendMessage(selectedChatId, messageInput);
    setMessageInput('');
  };

  const handleLocationSelect = (loc: Location) => {
    if (selectedChatId) {
      onSendLocation(selectedChatId, loc);
      setShowLocationPicker(false);
    }
  };



  // View: Conversation Detail
  if (selectedChatId && selectedChat) {
    return (
      <div className="flex flex-col h-full bg-white relative">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10">
          <button
            onClick={() => setSelectedChatId(null)}
            className="p-2 -ml-2 text-morocco-charcoal hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 bg-morocco-sandDark rounded-full flex items-center justify-center text-morocco-charcoal">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-morocco-charcoal text-sm">{selectedChat.otherUserRole}</h3>
            <p className="text-xs text-morocco-green truncate max-w-[200px]">{selectedChat.itemTitle}</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {selectedChat.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'location' ? (
                <a
                  href={`https://www.google.com/maps?q=${msg.location?.lat},${msg.location?.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block max-w-[80%] overflow-hidden rounded-2xl shadow-sm border border-gray-200 bg-white hover:opacity-95 transition-opacity"
                >
                  <div className="h-24 bg-gray-200 relative">
                    {/* Mock Map Visual */}
                    <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#ccc_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <MapPin className="text-red-500 drop-shadow-md" size={32} fill="currentColor" />
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-xs font-bold text-gray-800">📍 {t('chat.meetingPoint')}</p>
                    <p className="text-sm text-gray-600">{msg.location?.label}</p>
                    <p className="text-xs text-morocco-green mt-1 font-bold">{t('chat.viewOnMaps')} &rarr;</p>
                  </div>
                </a>
              ) : (
                <div className={`
                        max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${msg.isMe
                    ? 'bg-morocco-green text-white rounded-br-none'
                    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'}
                    `}>
                  {msg.text}
                </div>
              )}
              <span className="text-[10px] text-gray-400 self-end ml-2 mr-2 mb-1">
                {msg.timestamp}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Location Picker Drawer */}
        <AnimatePresence>
          {showLocationPicker && (
            <div className="absolute inset-0 z-20 flex flex-col justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLocationPicker(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-t-3xl p-6 relative z-30 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-morocco-charcoal flex items-center gap-2">
                    <MapPin className="text-morocco-green" size={20} />
                    {t('chat.chooseLocation')}
                  </h3>
                  <button onClick={() => setShowLocationPicker(false)} className="p-2 bg-gray-100 rounded-full">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Option 1: Current GPS */}
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          const loc: Location = {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            label: t('chat.currentLocation')
                          };
                          handleLocationSelect(loc);
                        }, (err) => {
                          console.error(err);
                          alert("Unable to retrieve location. Please check permissions.");
                        });
                      } else {
                        alert("Geolocation not supported");
                      }
                    }}
                    className="w-full p-4 flex items-center gap-3 bg-morocco-green/10 rounded-xl hover:bg-morocco-green/20 active:scale-98 transition-all text-left border border-morocco-green/30"
                  >
                    <div className="p-2 bg-white rounded-full text-morocco-green animate-pulse">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-morocco-green block">{t('chat.currentLocation')}</span>
                      <span className="text-xs text-gray-500">{t('chat_new.send_gps_desc')}</span>
                    </div>
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">{t('chat_new.or_use_maps')}</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  {/* Option 2: Open Google Maps & Paste */}
                  <div className="space-y-3">
                    <a
                      href="https://www.google.com/maps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center text-xs font-bold text-blue-500 hover:underline"
                    >
                      {t('chat_new.open_maps')} &rarr;
                    </a>

                    <div className="flex gap-2 relative">
                      <input
                        type="text"
                        placeholder={t('chat_new.paste_link_placeholder')}
                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-morocco-green pr-10"
                        disabled={isLoadingLink}
                        onPaste={async (e) => {
                          const text = e.clipboardData.getData('text');
                          e.preventDefault();

                          // Check if it looks like a URL or coordinates
                          if (text.includes('google.com/maps') || text.includes('goo.gl')) {
                            setIsLoadingLink(true);
                            try {
                              const res = await api.utils.parseLocation(text);
                              handleLocationSelect(res);
                            } catch (error) {
                              alert("Could not find location in this link. Please try copying coordinates directly.");
                            } finally {
                              setIsLoadingLink(false);
                            }
                          } else {
                            // Fallback: Coordinate Regex
                            const match = text.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
                            if (match) {
                              const lat = parseFloat(match[1]);
                              const lng = parseFloat(match[2]);
                              handleLocationSelect({ lat, lng, label: 'Custom Location' });
                            }
                          }
                        }}
                      />
                      {isLoadingLink && (
                        <div className="absolute right-14 top-3">
                          <div className="animate-spin h-5 w-5 border-2 border-morocco-green border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      <button className="bg-gray-100 text-gray-600 px-4 rounded-xl font-bold text-sm">
                        {t('chat_new.paste')}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center">
                      {t('chat_new.tip_paste')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <button
            onClick={() => setShowLocationPicker(true)}
            className="p-3 text-gray-400 hover:text-morocco-green hover:bg-morocco-green/5 rounded-full transition-colors"
          >
            <MapPin size={24} />
          </button>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat.typeMessage')}
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-morocco-green"
          />
          <button
            onClick={handleSend}
            disabled={!messageInput.trim()}
            className="bg-morocco-green text-white p-3 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-50 disabled:active:scale-100"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    );
  }

  // View: Chat List
  return (
    <div className="pt-6 px-4">
      <h1 className="text-2xl font-bold text-morocco-green mb-6">{t('chat.title')}</h1>

      {chats.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>{t('chat.noChats')}</p>
          <p className="text-sm">{t('chat.startChat')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const isLocation = lastMsg?.type === 'location';

            return (
              <motion.div
                key={chat.id}
                layoutId={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-morocco-green/20 active:bg-gray-50 transition-all cursor-pointer flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-morocco-sandDark rounded-full flex items-center justify-center text-morocco-charcoal shrink-0">
                  <User size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-morocco-charcoal text-sm truncate">{chat.otherUserRole}</h3>
                    <span className="text-[10px] text-gray-400">{chat.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs font-medium text-morocco-green truncate mb-1">{chat.itemTitle}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {isLocation ? `📍 ${t('chat.sharedLocation')}: ${lastMsg.location?.label}` : (lastMsg?.text || 'Started a chat')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
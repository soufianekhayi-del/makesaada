import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/Layout';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Create } from './screens/Create';
import { Chat } from './screens/Chat';
import { Profile } from './screens/Profile';
import { Delivery } from './screens/Delivery';
import { Landing } from './screens/Landing';
import { Item, ChatSession, Message, Location, User, UserRole } from './types';
import { api } from './services/api';

function App() {
  const [showLanding, setShowLanding] = useState<boolean>(true); // Show Landing by default
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'give' | 'chat' | 'delivery' | 'profile'>('home');
  const [userRole, setUserRole] = useState<string | null>(null);

  // Translation Hook for RTL
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  // We want to show Landing page first always (like a website), 
  // then check auth when they click "Start".
  // So we remove the auto-skip effect.

  // Global Data State
  const [items, setItems] = useState<Item[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Global Persistence State
  const [radius, setRadius] = useState<number>(5);
  const [locationMode, setLocationMode] = useState<'GPS' | 'MANUAL' | 'CITY'>('GPS');
  const [myLocation, setMyLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Constants for Manual Location (Casablanca Center)
  const CASABLANCA_COORDS = { lat: 33.5731, lng: -7.5898 };

  React.useEffect(() => {
    if (locationMode === 'GPS') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          (err) => {
            console.log("Loc error", err);
            // Fallback could go here
          }
        );
      }
    } else if (locationMode === 'MANUAL') {
      setMyLocation(CASABLANCA_COORDS);
    }
    // For CITY mode, usually myLocation is set by the user's city coordinates. 
    // We don't automatically overwrite it here unless it's null.
  }, [locationMode]);

  // We'll keep receivers mock for now or fetch users later
  const [receivers, setReceivers] = useState<User[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);

  // Load User and Items
  useEffect(() => {
    const initApp = async () => {
      try {
        const res = await api.auth.me();
        if (res.user) {
          setCurrentUser(res.user);
          setUserRole(res.user.role || null);
          setHasOnboarded(true);

          // Initialize Location from User Profile
          if (res.user.latitude && res.user.longitude) {
            setMyLocation({ lat: res.user.latitude, lng: res.user.longitude });
            // If we have a stored location, we assume 'CITY' or 'MANUAL' mode to avoid 
            // immediate GPS override, unless we persist "Use GPS" preference.
            // For now, defaulting to CITY/MANUAL if location exists ensures they see what they signed up with.
            setLocationMode('CITY');
          }

          // Fetch Chats
          try {
            const myChats = await api.chats.getAll();
            const fixedChats = myChats.map((c: any) => ({
              ...c,
              updatedAt: new Date(c.updatedAt),
              messages: c.messages.map((m: any) => ({ ...m, timestamp: m.timestamp }))
            }));
            setChats(fixedChats);
          } catch (e) {
            console.error("Failed chats", e);
          }

          // Fetch Neighbors (if geolocation allowed or using manual loc)
          // We use the location we just set
          const targetLat = res.user.latitude || 0;
          const targetLng = res.user.longitude || 0;

          if (targetLat !== 0) {
            try {
              const neighbors = await api.users.getNeighbors(targetLat, targetLng);
              setReceivers(neighbors);
            } catch (e) { console.error("Failed neighbors", e) }
          } else if (navigator.geolocation) {
            // Fallback to GPS if no profile location
            navigator.geolocation.getCurrentPosition(async (pos) => {
              try {
                const neighbors = await api.users.getNeighbors(pos.coords.latitude, pos.coords.longitude);
                setReceivers(neighbors);
              } catch (e) { console.error("Failed neighbors", e) }
            }, (err) => {
              console.log("Loc permission denied", err);
              api.users.getNeighbors(0, 0).then(setReceivers).catch(console.error);
            });
          }
        }
      } catch (e) {
        // Not logged in or auth failed, just stay on landing/onboarding
      }

      // Fetch Items (Global)
      try {
        const fetchedItems = await api.items.getAll();
        setItems(fetchedItems);
      } catch (e) {
        console.error("Failed to fetch items", e);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const handleOnboardingComplete = (user: any) => {
    setCurrentUser(user);
    setUserRole(user.role as UserRole);
    setHasOnboarded(true);

    if (user.latitude && user.longitude) {
      setMyLocation({ lat: user.latitude, lng: user.longitude });
    }

    if (user.locationMode) {
      setLocationMode(user.locationMode);
    } else if (user.latitude) {
      // Default to CITY if we have location but no explicit mode
      setLocationMode('CITY');
    }
  };

  // Logic to add a new Donation or Request
  const handleAddItem = async (newItem: Item) => {
    try {
      const createdItem = await api.items.create(newItem);
      setItems([createdItem, ...items]);
      setActiveTab('home');
    } catch (e) {
      console.error("Failed to create item", e);
      alert("Failed to create item");
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      setCurrentUser(null);
      setHasOnboarded(false);
      setShowLanding(true);
      setActiveTab('home');
      setMyLocation(null); // Reset location
      setLocationMode('GPS');
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // Logic when a Giver clicks "Offer Help" or Receiver clicks "Request" on an ITEM
  const handleOfferHelp = async (item: Item) => {
    // Check if chat already exists
    const existingChat = chats.find(c => c.itemId === item.id);

    if (existingChat) {
      setActiveTab('chat');
      return;
    }

    try {
      // Create new chat via API
      // We need otherUser ID from the item.
      // Assuming item has userId.
      const newChatRes = await api.chats.create({ itemId: item.id, otherUserId: item.userId });

      // Format new chat for state
      const newChat: ChatSession = {
        id: newChatRes.id,
        itemId: item.id,
        itemTitle: item.title,
        otherUserRole: item.userName || 'Neighbor',
        messages: [],
        updatedAt: new Date()
      };

      setChats([newChat, ...chats]);
      setActiveTab('chat');
    } catch (e) {
      console.error("Failed to create chat", e);
    }
  };

  // Logic to Contact a User Directly (Neighbors View)
  const handleContactUser = async (user: User) => {
    // Check if chat already exists with this user
    // This is a naive check; ideally backend filters unique participants.
    // For now, we just create a new one or find one.

    try {
      const res = await api.chats.create({ otherUserId: user.id });

      const newChat: ChatSession = {
        id: res.id,
        itemId: res.item_id || 'direct',
        itemTitle: t('chat.directMessage'), // Need to add translation key or hardcode
        otherUserRole: user.name,
        messages: [],
        updatedAt: new Date()
      };

      setChats([newChat, ...chats]);
      setActiveTab('chat');
    } catch (e) {
      console.error("Failed to contact user", e);
      // Fallback if backend rejects null item_id
      alert("Unable to start chat. Please try offering help on a specific item first.");
    }
  };

  const handleSendMessage = async (chatId: string, text: string) => {
    try {
      const msgRes = await api.chats.sendMessage(chatId, { text, type: 'text' });

      setChats(currentChats => currentChats.map(chat => {
        if (chat.id === chatId) {
          // Transform backend message to frontend Message
          const newMessage: Message = {
            id: msgRes.id,
            senderId: 'me',
            text: msgRes.text,
            type: 'text',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
          };
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            updatedAt: new Date()
          };
        }
        return chat;
      }));
    } catch (e) {
      console.error("Failed to send", e);
    }
  };

  const handleSendLocation = (chatId: string, location: Location) => {
    setChats(currentChats => currentChats.map(chat => {
      if (chat.id === chatId) {
        const newMessage: Message = {
          id: Date.now().toString(),
          senderId: 'me',
          text: `Shared location: ${location.label}`,
          type: 'location',
          location: location,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true
        };

        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          updatedAt: new Date()
        };
      }
      return chat;
    }));
  };

  if (showLanding) {
    return <Landing onStart={() => setShowLanding(false)} />;
  }

  if (!hasOnboarded) {
    return (
      <div className="h-[100dvh] bg-morocco-sand text-morocco-charcoal font-sans w-full max-w-[430px] mx-auto relative bg-pattern-geo shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-morocco-sand/90 -z-10" />
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <Home
          userRole={userRole as UserRole}
          items={items}
          receivers={receivers}
          onOfferHelp={handleOfferHelp}
          onContactUser={handleContactUser}
          radius={radius}
          setRadius={setRadius}
          locationMode={locationMode}
          setLocationMode={setLocationMode}
          myLocation={myLocation}
        />;
      case 'create':
        return <Create
          userRole={userRole}
          onAddItem={handleAddItem}
          currentLocation={myLocation}
        />;
      case 'delivery':
        return <Delivery />;
      case 'chat':
        return <Chat
          chats={chats}
          onSendMessage={handleSendMessage}
          onSendLocation={handleSendLocation}
        />;
      case 'profile':
        return <Profile
          currentUser={currentUser}
          items={items}
          onUpdateUser={(updatedUser) => {
            setCurrentUser(updatedUser);
            setUserRole(updatedUser.role as UserRole);
          }}
          onLogout={handleLogout}
          locationMode={locationMode}
          setLocationMode={setLocationMode}
        />; // Pass data for history
      default:
        return <Home
          userRole={userRole}
          items={items}
          receivers={receivers}
          onOfferHelp={handleOfferHelp}
          setLocationMode={setLocationMode}
          myLocation={myLocation}
        />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} showNav={hasOnboarded}>
      {renderScreen()}
    </Layout>
  );
}

export default App;
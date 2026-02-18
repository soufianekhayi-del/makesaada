/// <reference types="vite/client" />
import { supabase } from './supabase';





// Helper: Calculate distance in km
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

export const api = {
    utils: {
        calculateDistance: haversine,
        formatDistance: (d: number) => d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)} km`,
        parseLocation: async (url: string) => {
            // Call Vercel Serverless Function
            const res = await fetch(`/api/parse-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            if (!res.ok) throw new Error("Failed to parse location");
            return res.json();
        }
    },
    auth: {
        register: async (data: any) => {
            const { email, password, username, name, role, city, phone, bio, latitude, longitude } = data;

            // Supabase requires email. If app uses username, we can fake an email or ask for it.
            // For migration seamlessly, we might assume username is email or append a domain.
            // Checking if 'username' looks like email, if not append placeholder domain
            const emailToUse = email || (username.includes('@') ? username : `${username}@tadamon.app`);

            const { data: authData, error } = await supabase.auth.signUp({
                email: emailToUse,
                password: password,
                options: {
                    data: {
                        username,
                        name,
                        role: role || 'NEIGHBOR',
                        city,
                        phone,
                        bio,
                        latitude,
                        longitude
                    }
                }
            });

            if (error) throw error;
            return { user: authData.user, token: authData.session?.access_token };
        },

        login: async (data: any) => {
            const { username, password } = data;
            const emailToUse = username.includes('@') ? username : `${username}@tadamon.app`;

            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: emailToUse,
                password: password
            });

            if (error) throw error;
            return { user: authData.user, token: authData.session?.access_token };
        },

        logout: async () => {
            await supabase.auth.signOut();
        },

        me: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No session');

            // Fetch public profile from 'users' table
            const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                console.error("Error fetching profile:", error);
            }

            // Return combined user object to match expected frontend shape
            return {
                user: {
                    id: session.user.id,
                    email: session.user.email,
                    ...profile
                }
            };
        }
    },
    users: {
        getNeighbors: async (lat: number, lng: number) => {
            // Fetch users with location data
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .not('latitude', 'is', null)
                .not('longitude', 'is', null);

            if (error) throw error;
            return data || [];
        },
        updateMe: async (data: any) => {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error("Not authenticated");

            const { data: updatedUser, error } = await supabase
                .from('users')
                .update(data)
                .eq('id', userData.user.id)
                .select()
                .single();

            if (error) throw error;
            return { user: updatedUser };
        }
    },
    items: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('items')
                .select('*, user:users(id, name, role)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map to match frontend Item interface
            return data.map(item => ({
                ...item,
                kind: item.type, // DB 'type' stores 'OFFER'/'REQUEST'
                type: item.category, // DB 'category' stores 'FOOD'/'CLOTHES'
                // @ts-ignore
                userName: item.is_anonymous ? 'Anonymous Neighbor' : item.user?.name || 'Unknown',
                userId: item.user_id,
                quantity: item.quantity,
                isAnonymous: item.is_anonymous,
                location: item.location,
                latitude: item.latitude,
                longitude: item.longitude,
                createdAt: item.created_at,
                // @ts-ignore
                status: item.status
            }));
        },
        create: async (data: any) => {
            const { title, description, quantity, type, kind, location, isAnonymous, urgent, latitude, longitude } = data;
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error("Not authenticated");

            // Frontend handles 'type' and 'kind' differently than DB schema potentially
            // frontend: type=FOOD, kind=OFFER
            // db: category=FOOD, type=OFFER
            const { data: newItem, error } = await supabase
                .from('items')
                .insert({
                    title,
                    description,
                    quantity,
                    category: type,
                    type: kind,
                    location: location || 'Casablanca',
                    is_anonymous: isAnonymous,
                    urgent,
                    latitude,
                    longitude,
                    user_id: userData.user.id
                })
                .select()
                .single();

            if (error) throw error;
            return newItem;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('items').delete().eq('id', id);
            if (error) throw error;
        }
    },
    chats: {
        getAll: async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return [];
            const userId = userData.user.id;

            // Fetch chats where user is a participant
            // This is tricky with Supabase JS standard client without deep filtering
            // Easier approach: Get all chat_participants for this user, then fetch those chats

            const { data: myChats, error: partError } = await supabase
                .from('chat_participants')
                .select('chat_id')
                .eq('user_id', userId);

            if (partError) throw partError;
            const chatIds = myChats.map(c => c.chat_id);

            if (chatIds.length === 0) return [];

            const { data: chats, error } = await supabase
                .from('chat_sessions')
                .select(`
                    id, 
                    updated_at, 
                    item_id,
                    item:items(title),
                    chat_participants(user:users(id, name, role)),
                    messages(id, text, type, created_at, sender_id)
                `)
                .in('id', chatIds)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            // Format for frontend
            return chats.map(chat => {
                // @ts-ignore
                const otherParticipant = chat.chat_participants.find((p: any) => p.user.id !== userId);
                const otherUser = otherParticipant?.user;
                // Safely handle if Supabase returns array or object for single relation
                const otherUserRole = otherUser ? (Array.isArray(otherUser) ? otherUser[0]?.name : otherUser.name) : 'Unknown';

                return {
                    id: chat.id,
                    itemId: chat.item_id,
                    // @ts-ignore
                    itemTitle: chat.item?.title || 'Direct Chat',
                    otherUserRole,
                    // @ts-ignore
                    messages: chat.messages.map((m: any) => ({
                        id: m.id,
                        text: m.text,
                        type: m.type,
                        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isMe: m.sender_id === userId,
                        senderId: m.sender_id
                    })),
                    updatedAt: chat.updated_at
                };
            });
        },
        create: async (data: any) => {
            const { itemId, otherUserId } = data;
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error("Unauthorized");
            const userId = userData.user.id;

            // 1. Create Session
            const { data: chat, error } = await supabase
                .from('chat_sessions')
                .insert({ item_id: itemId })
                .select()
                .single();

            if (error) throw error;

            // 2. Add Participants
            const { error: partError } = await supabase
                .from('chat_participants')
                .insert([
                    { chat_id: chat.id, user_id: userId },
                    { chat_id: chat.id, user_id: otherUserId }
                ]);

            if (partError) throw partError;

            return chat;
        },
        subscribeToChat: (chatId: string, callback: (msg: any) => void) => {
            // Realtime Implementation
            const channel = supabase
                .channel(`chat:${chatId}`)
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                    (payload) => {
                        // Transform payload to message format
                        const newMsg = payload.new;
                        // We need to fetch sender info if we want to be precise, or just return basic
                        // For quick update:
                        callback({
                            id: newMsg.id,
                            text: newMsg.text,
                            type: newMsg.type,
                            timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            senderId: newMsg.sender_id,
                            isMe: false // The UI will determine this based on current user ID check anyway
                        });
                    }
                )
                .subscribe();

            return { unsubscribe: () => supabase.removeChannel(channel) };
        },
        sendMessage: async (chatId: string, data: any) => {
            const { text, type } = data;
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error("Unauthorized");

            const { data: message, error } = await supabase
                .from('messages')
                .insert({
                    chat_id: chatId,
                    sender_id: userData.user.id,
                    text,
                    type: type || 'text'
                })
                .select()
                .single();

            if (error) throw error;

            // Create a fake socket-like response or just the message
            return {
                ...message,
                timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true
            };
        }
    }
};

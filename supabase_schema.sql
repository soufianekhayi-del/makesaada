-- Enable PostGIS for location features
create extension if not exists postgis;

-- 0. CLEANUP LEGACY TABLES (From previous production_db.sql)
-- We drop these quotes tables to avoid confusion with new lowercase tables
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "ChatSession" CASCADE;
DROP TABLE IF EXISTS "_ChatSessionToUser" CASCADE;
DROP TABLE IF EXISTS "Item" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;


-- Users Table (Managed by Supabase Auth, but we keep a public profile table)
-- Note: Supabase handles auth.users. We will trigger a profile creation on signup.
create table public.users (
  id uuid references auth.users not null primary key,
  username text unique,
  name text,
  role text default 'NEIGHBOR', -- 'NEIGHBOR', 'ASSOCIATION', 'RESTAURANT'
  city text,
  phone text,
  bio text,
  avatar_url text,
  latitude float,
  longitude float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies for Users
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using ( true );

create policy "Users can insert their own profile"
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );

-- Items Table
create table public.items (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text, -- 'FOOD', 'CLOTHES', 'SERVICES', 'FURNITURE', 'DEVICES'
  type text, -- 'OFFER', 'REQUEST'
  status text default 'AVAILABLE',
  quantity text, -- Changed to text to match legacy schema (e.g. "2 bags")
  unit text,
  is_anonymous boolean default false,
  urgent boolean default false,
  images text[],
  location text, -- Human readable address/city
  latitude float,
  longitude float,
  user_id uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.items enable row level security;

-- Policies for Items
create policy "Items are viewable by everyone"
  on public.items for select
  using ( true );

create policy "Authenticated users can create items"
  on public.items for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own items"
  on public.items for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own items"
  on public.items for delete
  using ( auth.uid() = user_id );


-- Chat Sessions Table
create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.items(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Join table for Chat <-> Users (Many-to-Many)
create table public.chat_participants (
  chat_id uuid references public.chat_sessions(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  primary key (chat_id, user_id)
);

-- Enable RLS
alter table public.chat_sessions enable row level security;
alter table public.chat_participants enable row level security;

-- Policies for Chat
create policy "Users can view chats they are participating in"
  on public.chat_sessions for select
  using (
    exists (
      select 1 from public.chat_participants
      where chat_participants.chat_id = chat_sessions.id
      and chat_participants.user_id = auth.uid()
    )
  );

create policy "Users can create chat sessions"
  on public.chat_sessions for insert
  with check ( auth.role() = 'authenticated' );

create policy "Participants are viewable by chat members"
  on public.chat_participants for select
  using (
    exists (
      select 1 from public.chat_participants as cp
      where cp.chat_id = chat_participants.chat_id
      and cp.user_id = auth.uid()
    )
  );

create policy "Users can join chats"
  on public.chat_participants for insert
  with check ( auth.uid() = user_id );


-- Messages Table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chat_sessions(id) on delete cascade not null,
  sender_id uuid references public.users(id) not null,
  text text,
  type text default 'text', -- 'text', 'image', 'location'
  media_url text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies for Messages
create policy "Users can view messages in their chats"
  on public.messages for select
  using (
    exists (
      select 1 from public.chat_participants
      where chat_participants.chat_id = messages.chat_id
      and chat_participants.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their chats"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.chat_participants
      where chat_participants.chat_id = messages.chat_id
      and chat_participants.user_id = auth.uid()
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

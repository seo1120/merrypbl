-- Feature 1: Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature 1: Messages table
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature 2: Manito Participants table
CREATE TABLE IF NOT EXISTS manito_participants (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature 2: Manito Matches table
CREATE TABLE IF NOT EXISTS manito_matches (
  id BIGSERIAL PRIMARY KEY,
  giver_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(giver_user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE manito_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE manito_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can create/update their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- All users (including anonymous) can read all profiles (to see nicknames)
CREATE POLICY "All users can read all profiles"
  ON profiles FOR SELECT
  USING (true);

-- RLS Policies for messages
-- All authenticated users can create messages
CREATE POLICY "Authenticated users can create messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- All users (including anonymous) can read all messages
CREATE POLICY "All users can read all messages"
  ON messages FOR SELECT
  USING (true);

-- RLS Policies for manito_participants
-- Users can insert their own participation
CREATE POLICY "Users can insert their own participation"
  ON manito_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- All authenticated users can read the participant list
CREATE POLICY "Authenticated users can read participants"
  ON manito_participants FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for manito_matches
-- Users can ONLY read the row where they are the giver
CREATE POLICY "Users can read their own match"
  ON manito_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = giver_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_manito_participants_user_id ON manito_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_manito_matches_giver ON manito_matches(giver_user_id);
CREATE INDEX IF NOT EXISTS idx_manito_matches_receiver ON manito_matches(receiver_user_id);


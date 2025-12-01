-- Create astrologers table
CREATE TABLE IF NOT EXISTS astrologers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialties TEXT[], -- Array of specialties e.g. ['Vedic', 'Numerology']
  experience INTEGER, -- Years of experience
  price DECIMAL(10, 2) NOT NULL, -- Price per minute
  image_url TEXT,
  is_celebrity BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 1) DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_astrologers_is_online ON astrologers(is_online);

-- Seed data for Raghav Shastri
INSERT INTO astrologers (name, specialties, experience, price, image_url, is_celebrity, is_online, rating, reviews)
VALUES (
  'Raghav Shastri', 
  ARRAY['Vedic', 'Numerology', 'Vastu'], 
  15, 
  20.00, 
  '/astrologer-raghav-shastri.png', 
  TRUE, 
  TRUE, 
  4.9, 
  1250
);

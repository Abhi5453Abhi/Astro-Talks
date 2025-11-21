#!/bin/bash

# Test script for saving user profile to database
# 
# INSTRUCTIONS:
# 1. First, log in to your app in the browser (http://localhost:3000)
# 2. Open browser DevTools (F12) → Application/Storage → Cookies → http://localhost:3000
# 3. Find the cookie named "next-auth.session-token" (or "next-auth.csrf-token" for production)
# 4. Copy the cookie value and replace YOUR_SESSION_COOKIE below
# 5. Run this script: bash test-save-profile.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"
SESSION_COOKIE="${SESSION_COOKIE:-YOUR_SESSION_COOKIE_HERE}"

echo "Testing user profile save endpoint..."
echo "URL: $BASE_URL/api/users/save"
echo ""

# Test data
curl -X POST "$BASE_URL/api/users/save" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_COOKIE" \
  -d '{
    "name": "Test User",
    "dateOfBirth": "1990-01-15",
    "birthTime": "10:30",
    "gender": "male",
    "languages": ["english", "hindi"],
    "zodiacSign": "Capricorn",
    "placeOfBirth": "Mumbai"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "Done!"


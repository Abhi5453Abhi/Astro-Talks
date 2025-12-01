#!/bin/bash

# Test User Profile Save Endpoint
# This script helps you test the /api/users/save endpoint

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "=========================================="
echo "Testing User Profile Save Endpoint"
echo "=========================================="
echo ""
echo "NOTE: This endpoint requires authentication."
echo "You need to provide a valid session cookie."
echo ""
echo "To get your session cookie:"
echo "1. Open your app in browser: $BASE_URL"
echo "2. Log in with Google"
echo "3. Open DevTools (F12) → Application → Cookies → $BASE_URL"
echo "4. Find cookie: 'next-auth.session-token'"
echo "5. Copy its value"
echo ""
read -p "Enter your session cookie (or press Enter to test without auth): " SESSION_COOKIE

echo ""
echo "Testing endpoint: POST $BASE_URL/api/users/save"
echo ""

if [ -z "$SESSION_COOKIE" ]; then
  echo "Testing WITHOUT authentication (will get 401)..."
  curl -X POST "$BASE_URL/api/users/save" \
    -H "Content-Type: application/json" \
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
    -s | jq '.' 2>/dev/null || cat
else
  echo "Testing WITH authentication..."
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
    -s | jq '.' 2>/dev/null || cat
fi

echo ""
echo "=========================================="
echo "Test completed!"
echo "=========================================="


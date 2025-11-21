#!/bin/bash

# Test script for API endpoints
# This script tests the API endpoints and validates 401 error handling

BASE_URL="${BASE_URL:-http://localhost:3000}"
echo "Testing API endpoints at: $BASE_URL"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local cookies=$5
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "  Endpoint: $method $endpoint"
    
    if [ -n "$cookies" ]; then
        echo "  With cookies: Yes"
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -H "Cookie: $cookies" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        echo "  With cookies: No (expecting 401)"
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "401" ]; then
        echo -e "  Status: ${RED}401 Unauthorized${NC}"
        echo "  Response: $body"
        echo ""
        return 1
    elif [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "  Status: ${GREEN}$http_code OK${NC}"
        echo "  Response: $body"
        echo ""
        return 0
    else
        echo -e "  Status: ${YELLOW}$http_code${NC}"
        echo "  Response: $body"
        echo ""
        return 2
    fi
}

echo "=========================================="
echo "TEST 1: Testing endpoints WITHOUT authentication"
echo "=========================================="
echo ""

# Test GET /api/users/get (should return 401)
test_endpoint "GET" "/api/users/get" "" "Get user profile (no auth)"

# Test GET /api/messages/get (should return 401)
test_endpoint "GET" "/api/messages/get" "" "Get messages (no auth)"

# Test POST /api/users/save (should return 401)
test_endpoint "POST" "/api/users/save" '{"name":"Test User","dateOfBirth":"1990-01-01"}' "Save user profile (no auth)"

# Test POST /api/messages/save (should return 401)
test_endpoint "POST" "/api/messages/save" '{"messages":[{"id":"1","role":"user","content":"Hello","timestamp":1234567890}]}' "Save messages (no auth)"

# Test POST /api/users/mobile (should return 401)
test_endpoint "POST" "/api/users/mobile" '{"mobile":"1234567890"}' "Update mobile (no auth)"

echo ""
echo "=========================================="
echo "TEST 2: Testing endpoints WITH authentication"
echo "=========================================="
echo ""
echo -e "${YELLOW}To test with authentication, you need to:${NC}"
echo "1. Log in through the browser"
echo "2. Copy the 'next-auth.session-token' cookie from browser DevTools"
echo "3. Run this script with: COOKIES='next-auth.session-token=YOUR_TOKEN' ./test-api-endpoints.sh"
echo ""

if [ -n "$COOKIES" ]; then
    echo "Testing with provided cookies..."
    echo ""
    
    # Test GET /api/users/get (with auth)
    test_endpoint "GET" "/api/users/get" "" "Get user profile (with auth)" "$COOKIES"
    
    # Test GET /api/messages/get (with auth)
    test_endpoint "GET" "/api/messages/get" "" "Get messages (with auth)" "$COOKIES"
    
    # Test POST /api/users/save (with auth)
    test_endpoint "POST" "/api/users/save" '{"name":"Test User","dateOfBirth":"1990-01-01","languages":["english"]}' "Save user profile (with auth)" "$COOKIES"
    
    # Test POST /api/messages/save (with auth)
    test_endpoint "POST" "/api/messages/save" '{"messages":[{"id":"1","role":"user","content":"Hello","timestamp":1234567890}]}' "Save messages (with auth)" "$COOKIES"
    
    # Test POST /api/users/mobile (with auth)
    test_endpoint "POST" "/api/users/mobile" '{"mobile":"1234567890"}' "Update mobile (with auth)" "$COOKIES"
else
    echo -e "${YELLOW}Skipping authenticated tests (no cookies provided)${NC}"
fi

echo ""
echo "=========================================="
echo "TEST 3: Testing public endpoint (no auth required)"
echo "=========================================="
echo ""

# Test GET /api/users/get-by-email (public endpoint)
test_endpoint "GET" "/api/users/get-by-email?email=test@example.com" "" "Get user by email (public)"

echo ""
echo "=========================================="
echo "Testing complete!"
echo "=========================================="
echo ""
echo "To get authentication cookies:"
echo "1. Open browser DevTools (F12)"
echo "2. Go to Application/Storage → Cookies → http://localhost:3000"
echo "3. Copy the value of 'next-auth.session-token'"
echo "4. Run: COOKIES='next-auth.session-token=YOUR_TOKEN' ./test-api-endpoints.sh"
echo ""


#!/bin/bash
# Test script for PreplyAI API

API_URL="http://localhost:3001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing PreplyAI API"
echo "======================="
echo ""

# Test 1: Health endpoint
echo "📍 Test 1: Health Endpoint"
echo -n "   GET /health ... "
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/health 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $HTTP_CODE)"
    if [ -z "$HTTP_CODE" ]; then
        echo -e "   ${RED}Error: Could not connect to $API_URL${NC}"
        echo -e "   ${YELLOW}Make sure the API is running: cd apps/api && npm run dev${NC}"
        exit 1
    fi
fi
echo ""

# Test 2: Auth endpoint (should fail without valid token)
echo "📍 Test 2: Auth Endpoint (without token)"
echo -n "   POST /auth/firebase ... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken":"invalid"}' 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE - correctly rejected)"
    echo "   Response: $BODY"
else
    echo -e "${YELLOW}⚠ UNEXPECTED${NC} (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
fi
echo ""

# Test 3: Protected endpoint (should fail without auth)
echo "📍 Test 3: Protected Endpoint (without auth)"
echo -n "   POST /google/connect ... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/google/connect 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE - correctly requires auth)"
    echo "   Response: $BODY"
else
    echo -e "${YELLOW}⚠ UNEXPECTED${NC} (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
fi
echo ""

# Test 4: Non-existent endpoint
echo "📍 Test 4: Non-existent Endpoint"
echo -n "   GET /nonexistent ... "
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/nonexistent 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "404" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
else
    echo -e "${YELLOW}⚠ UNEXPECTED${NC} (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
fi
echo ""

echo "======================="
echo -e "${GREEN}✓ All basic tests completed!${NC}"
echo ""
echo "💡 To test with real Firebase auth:"
echo "   1. Get a Firebase ID token from your frontend"
echo "   2. Use: curl -H \"Authorization: Bearer YOUR_TOKEN\" $API_URL/google/connect"


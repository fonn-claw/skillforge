#!/bin/bash
set -e

BASE_URL="${1:-http://localhost:3000}"
PASS=0
FAIL=0

check() {
  local name="$1"
  local result="$2"
  if [ "$result" = "true" ]; then
    echo "  PASS: $name"
    ((PASS++))
  else
    echo "  FAIL: $name"
    ((FAIL++))
  fi
}

echo "=== SkillForge Smoke Tests ==="
echo "Target: $BASE_URL"
echo ""

# Test 1: Register a new user
echo "[Auth]"
REGISTER=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoketest@test.com","password":"test1234","displayName":"Smoke Test"}')
check "Register new user (201 or 409)" "$([ "$REGISTER" = "201" ] || [ "$REGISTER" = "409" ] && echo true || echo false)"

# Test 2: Login with demo learner account
LOGIN_RESP=$(curl -s -c /tmp/sf-cookies.txt -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"learner@skillforge.app","password":"demo1234"}')
check "Login learner@skillforge.app" "$(echo "$LOGIN_RESP" | grep -q '"role"' && echo true || echo false)"

# Test 3: Login with demo mentor account
MENTOR_RESP=$(curl -s -c /tmp/sf-cookies-mentor.txt -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"mentor@skillforge.app","password":"demo1234"}')
check "Login mentor@skillforge.app" "$(echo "$MENTOR_RESP" | grep -q '"role"' && echo true || echo false)"

# Test 4: Login with demo admin account
ADMIN_RESP=$(curl -s -c /tmp/sf-cookies-admin.txt -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skillforge.app","password":"demo1234"}')
check "Login admin@skillforge.app" "$(echo "$ADMIN_RESP" | grep -q '"role"' && echo true || echo false)"

# Test 5: Get tree nodes (authenticated)
echo ""
echo "[Tree API]"
NODES=$(curl -s -b /tmp/sf-cookies.txt "$BASE_URL/api/tree/nodes")
NODE_COUNT=$(echo "$NODES" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
check "GET /api/tree/nodes returns ~15 nodes (got $NODE_COUNT)" "$([ "$NODE_COUNT" -ge 14 ] && [ "$NODE_COUNT" -le 20 ] && echo true || echo false)"

# Test 6: Get tree edges (authenticated)
EDGES=$(curl -s -b /tmp/sf-cookies.txt "$BASE_URL/api/tree/edges")
EDGE_COUNT=$(echo "$EDGES" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
check "GET /api/tree/edges returns ~14 edges (got $EDGE_COUNT)" "$([ "$EDGE_COUNT" -ge 12 ] && [ "$EDGE_COUNT" -le 20 ] && echo true || echo false)"

# Test 7: Logout
echo ""
echo "[Logout]"
LOGOUT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/logout" -b /tmp/sf-cookies.txt)
check "Logout returns 200" "$([ "$LOGOUT" = "200" ] && echo true || echo false)"

# Test 8: Unauthenticated access blocked
UNAUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/tree/nodes")
check "Unauthenticated /api/tree/nodes blocked (not 200)" "$([ "$UNAUTH" != "200" ] && echo true || echo false)"

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1

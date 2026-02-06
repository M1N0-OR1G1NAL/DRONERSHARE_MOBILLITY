# Quick Start Guide - Flight Tier System

## Prerequisites

- Node.js 16+ installed
- MongoDB 5.0+ running (or use MongoDB Atlas)
- Git installed

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/M1N0-OR1G1NAL/DRONERSHARE_MOBILLITY.git
cd DRONERSHARE_MOBILLITY/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dronershare
JWT_SECRET=your-secret-key-change-this-in-production
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod --dbpath /path/to/your/data/directory
```

**Option B: MongoDB Atlas**
Update `MONGODB_URI` in `.env` with your Atlas connection string

### 5. Start the Server

```bash
npm start
```

Server should be running on `http://localhost:3000`

## Testing the Tier System

### Using curl

#### 1. Register a New User (Tier 0)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+420123456789"
  }'
```

Save the `token` from the response.

#### 2. Check Dashboard (Tier 0)

```bash
TOKEN="paste-your-token-here"

curl -X GET http://localhost:3000/api/flight-access/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "tier": {
    "level": 0,
    "description": "Prospective Visitor"
  },
  "permissions": {
    "isBrowsingProspect": true,
    "isSubscribedMember": false
  }
}
```

#### 3. Upgrade to Subscriber (Tier 1)

```bash
curl -X POST http://localhost:3000/api/flight-access/elevate/subscriber \
  -H "Authorization: Bearer $TOKEN"
```

#### 4. Activate Services

```bash
# Activate auto taxi
curl -X POST http://localhost:3000/api/flight-access/service/auto-taxi \
  -H "Authorization: Bearer $TOKEN"

# Activate pilot rental
curl -X POST http://localhost:3000/api/flight-access/service/pilot-rental \
  -H "Authorization: Bearer $TOKEN"

# Activate cargo logistics
curl -X POST http://localhost:3000/api/flight-access/service/cargo-logistics \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. View Updated Dashboard

```bash
curl -X GET http://localhost:3000/api/flight-access/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "tier": {
    "level": 1,
    "description": "Active Subscriber",
    "onboardingCompletedAt": "2026-02-06T12:00:00.000Z"
  },
  "permissions": {
    "isBrowsingProspect": false,
    "isSubscribedMember": true
  },
  "services": {
    "autoTaxi": true,
    "pilotRental": true,
    "cargoLogistics": true
  }
}
```

### Using the Test Script

Save this as `test-tiers.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=== Testing Flight Tier System ==="

# 1. Register
echo -e "\n1. Registering new user..."
RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123",
    "firstName": "Demo",
    "lastName": "User",
    "phone": "+420999888777"
  }')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token received: ${TOKEN:0:20}..."

# 2. Check initial tier
echo -e "\n2. Checking initial tier (should be 0)..."
curl -s -X GET $BASE_URL/api/flight-access/dashboard \
  -H "Authorization: Bearer $TOKEN" | json_pp

# 3. Upgrade to subscriber
echo -e "\n3. Upgrading to subscriber..."
curl -s -X POST $BASE_URL/api/flight-access/elevate/subscriber \
  -H "Authorization: Bearer $TOKEN" | json_pp

# 4. Activate all services
echo -e "\n4. Activating auto-taxi service..."
curl -s -X POST $BASE_URL/api/flight-access/service/auto-taxi \
  -H "Authorization: Bearer $TOKEN" | json_pp

echo -e "\n5. Activating pilot-rental service..."
curl -s -X POST $BASE_URL/api/flight-access/service/pilot-rental \
  -H "Authorization: Bearer $TOKEN" | json_pp

echo -e "\n6. Activating cargo-logistics service..."
curl -s -X POST $BASE_URL/api/flight-access/service/cargo-logistics \
  -H "Authorization: Bearer $TOKEN" | json_pp

# 5. Final dashboard
echo -e "\n7. Final dashboard (all services active)..."
curl -s -X GET $BASE_URL/api/flight-access/dashboard \
  -H "Authorization: Bearer $TOKEN" | json_pp

echo -e "\n=== Test Complete ==="
```

Run it:
```bash
chmod +x test-tiers.sh
./test-tiers.sh
```

### Using Postman

1. Import the API endpoints:
   - `POST http://localhost:3000/api/auth/register`
   - `POST http://localhost:3000/api/auth/login`
   - `GET http://localhost:3000/api/flight-access/dashboard`
   - `POST http://localhost:3000/api/flight-access/elevate/subscriber`
   - `POST http://localhost:3000/api/flight-access/service/auto-taxi`

2. Set up authorization:
   - Type: Bearer Token
   - Token: (paste token from login/register response)

3. Test the workflow as described above

## Running Tests

### Unit Tests

```bash
npm test -- flightTierSystem.test.js
```

### API Tests

```bash
npm test -- flightAccessAPI.test.js
```

### All Tests

```bash
npm test
```

### With Coverage

```bash
npm test -- --coverage
```

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:** Make sure MongoDB is running:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod --dbpath /path/to/data
```

### JWT Token Invalid

**Error:** `Invalid authentication token`

**Solution:** 
- Make sure JWT_SECRET is set in .env
- Token may have expired (7 days), register/login again
- Check if Bearer prefix is included in Authorization header

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
PORT=3001
```

## Next Steps

1. ✅ Test all 4 tiers
2. ✅ Test service toggles
3. ✅ Test admin operations (if you have admin user)
4. 📖 Read full documentation: [Flight Tier System](/docs/FLIGHT_TIER_SYSTEM.md)
5. 📖 Check API usage examples: [API Usage Guide](/docs/API_USAGE_GUIDE.md)
6. 🔨 Integrate with existing drone booking system
7. 🎨 Build frontend UI for tier management

## API Documentation

Full API documentation available at:
- Technical docs: `/docs/FLIGHT_TIER_SYSTEM.md`
- Usage guide: `/docs/API_USAGE_GUIDE.md`
- Implementation summary: `/docs/IMPLEMENTATION_SUMMARY.md`

## Support

- 📝 Create an issue on GitHub
- 📧 Contact the development team
- 📖 Review the documentation

## License

MIT License - see LICENSE file for details

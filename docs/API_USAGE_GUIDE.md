# Flight Tier System - API Usage Guide

## Quick Start

### 1. Register a New User (Tier 0)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+420123456789"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64f1234567890abcdef",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "platformTier": 0,
    "tierDescription": "Prospective Visitor"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "64f1234567890abcdef",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "platformTier": 0,
    "tierDescription": "Prospective Visitor",
    "subscriberServices": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. View Dashboard (Tier 0)

```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/flight-access/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "tier": {
    "level": 0,
    "description": "Prospective Visitor",
    "onboardingCompletedAt": null
  },
  "permissions": {
    "isBrowsingProspect": true,
    "isSubscribedMember": false,
    "isSystemOverseer": false,
    "isTechCrew": false
  },
  "services": null,
  "transportPermissions": null
}
```

### 4. Upgrade to Subscriber (Tier 0 → Tier 1)

```bash
curl -X POST http://localhost:3000/api/flight-access/elevate/subscriber \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "message": "Tier elevation successful",
  "user": {
    "id": "64f1234567890abcdef",
    "email": "user@example.com",
    "platformTier": 1,
    "tierDescription": "Active Subscriber",
    "onboardingCompletedAt": "2026-02-06T12:00:00.000Z"
  }
}
```

### 5. View Dashboard (Tier 1)

```bash
curl -X GET http://localhost:3000/api/flight-access/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "tier": {
    "level": 1,
    "description": "Active Subscriber",
    "onboardingCompletedAt": "2026-02-06T12:00:00.000Z"
  },
  "permissions": {
    "isBrowsingProspect": false,
    "isSubscribedMember": true,
    "isSystemOverseer": false,
    "isTechCrew": false
  },
  "services": {
    "autoTaxi": false,
    "pilotRental": false,
    "cargoLogistics": false
  },
  "transportPermissions": {
    "routeAutomation": false,
    "manualOperation": false,
    "freightHandling": false
  }
}
```

### 6. Activate Auto Taxi Service

```bash
curl -X POST http://localhost:3000/api/flight-access/service/auto-taxi \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "message": "Service toggled successfully",
  "services": {
    "autoTaxi": true,
    "pilotRental": false,
    "cargoLogistics": false
  },
  "transportPermissions": {
    "routeAutomation": true,
    "manualOperation": false,
    "freightHandling": false
  }
}
```

### 7. Activate Pilot Rental Service

```bash
curl -X POST http://localhost:3000/api/flight-access/service/pilot-rental \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "message": "Service toggled successfully",
  "services": {
    "autoTaxi": true,
    "pilotRental": true,
    "cargoLogistics": false
  },
  "transportPermissions": {
    "routeAutomation": true,
    "manualOperation": true,
    "freightHandling": false
  }
}
```

### 8. Activate Cargo Logistics Service

```bash
curl -X POST http://localhost:3000/api/flight-access/service/cargo-logistics \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "message": "Service toggled successfully",
  "services": {
    "autoTaxi": true,
    "pilotRental": true,
    "cargoLogistics": true
  },
  "transportPermissions": {
    "routeAutomation": true,
    "manualOperation": true,
    "freightHandling": true
  }
}
```

### 9. Deactivate a Service

```bash
# Toggle again to deactivate
curl -X POST http://localhost:3000/api/flight-access/service/auto-taxi \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "message": "Service toggled successfully",
  "services": {
    "autoTaxi": false,
    "pilotRental": true,
    "cargoLogistics": true
  },
  "transportPermissions": {
    "routeAutomation": false,
    "manualOperation": true,
    "freightHandling": true
  }
}
```

## Admin Operations

### 10. Appoint User as System Overseer (Tier 2)

Requires admin authentication:

```bash
ADMIN_TOKEN="admin-jwt-token-here"
TARGET_USER_ID="target-user-id-here"

curl -X POST http://localhost:3000/api/flight-access/elevate/overseer \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$TARGET_USER_ID\"}"
```

Response:
```json
{
  "message": "User appointed as System Overseer",
  "user": {
    "id": "64f1234567890abcdef",
    "email": "user@example.com",
    "platformTier": 2,
    "tierDescription": "System Overseer"
  }
}
```

### 11. Assign User as Technical Crew (Tier 3)

```bash
curl -X POST http://localhost:3000/api/flight-access/elevate/tech-crew \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$TARGET_USER_ID\"}"
```

Response:
```json
{
  "message": "User assigned as Technical Crew",
  "user": {
    "id": "64f1234567890abcdef",
    "email": "user@example.com",
    "platformTier": 3,
    "tierDescription": "Technical Crew"
  }
}
```

## Error Handling Examples

### Unauthorized Access
```bash
curl -X GET http://localhost:3000/api/flight-access/dashboard
```

Response (401):
```json
{
  "error": "Authentication required"
}
```

### Invalid Credentials
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "wrongpassword"
  }'
```

Response (401):
```json
{
  "error": "Invalid credentials"
}
```

### Insufficient Permissions
```bash
# Tier 0 user trying to toggle service
curl -X POST http://localhost:3000/api/flight-access/service/auto-taxi \
  -H "Authorization: Bearer $TIER0_TOKEN"
```

Response (403):
```json
{
  "error": "Only Active Subscribers can toggle services"
}
```

### Invalid Tier Elevation
```bash
# Tier 1 user trying to upgrade to subscriber again
curl -X POST http://localhost:3000/api/flight-access/elevate/subscriber \
  -H "Authorization: Bearer $TIER1_TOKEN"
```

Response (400):
```json
{
  "error": "Can only upgrade to subscriber from Prospective Visitor tier"
}
```

## Testing Flow

Complete workflow test:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# 1. Register
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "testpass123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+420123456789"
  }')
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# 2. View dashboard (Tier 0)
echo -e "\n2. Viewing dashboard (Tier 0)..."
curl -s -X GET $BASE_URL/api/flight-access/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Upgrade to subscriber
echo -e "\n3. Upgrading to subscriber..."
curl -s -X POST $BASE_URL/api/flight-access/elevate/subscriber \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. View dashboard (Tier 1)
echo -e "\n4. Viewing dashboard (Tier 1)..."
curl -s -X GET $BASE_URL/api/flight-access/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Activate all services
echo -e "\n5. Activating auto-taxi..."
curl -s -X POST $BASE_URL/api/flight-access/service/auto-taxi \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n6. Activating pilot-rental..."
curl -s -X POST $BASE_URL/api/flight-access/service/pilot-rental \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n7. Activating cargo-logistics..."
curl -s -X POST $BASE_URL/api/flight-access/service/cargo-logistics \
  -H "Authorization: Bearer $TOKEN" | jq

# 8. View final dashboard
echo -e "\n8. Viewing final dashboard..."
curl -s -X GET $BASE_URL/api/flight-access/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq

# 9. Get profile
echo -e "\n9. Getting user profile..."
curl -s -X GET $BASE_URL/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq
```

Save as `test-flight-tiers.sh` and run:
```bash
chmod +x test-flight-tiers.sh
./test-flight-tiers.sh
```

## Integration with Existing Services

### Using Tier Permissions in Drone Booking

```javascript
// In your drone booking controller
const bookDrone = async (req, res) => {
  const user = req.user;
  const { serviceType } = req.body;

  // Check tier and service permissions
  if (!user.isSubscribedMember()) {
    return res.status(403).json({
      error: 'Active Subscriber status required',
      upgradeUrl: '/api/flight-access/elevate/subscriber'
    });
  }

  // Check specific service
  if (serviceType === 'auto-taxi' && !user.autoTaxiAllowed()) {
    return res.status(403).json({
      error: 'Auto taxi service not activated',
      activateUrl: '/api/flight-access/service/auto-taxi'
    });
  }

  // Proceed with booking...
};
```

## Notes

- JWT tokens expire after 7 days
- All dates/times are in UTC ISO 8601 format
- Services can only be toggled by Tier 1 (Active Subscribers)
- Admin operations (Tier 2/3 assignment) require enterprise userLevel or existing overseer status
- Save your JWT token after login/registration for subsequent requests

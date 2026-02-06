# Flight Tier Access System - API Documentation

## Overview

The Flight Tier Access System implements a 4-phase authentication and authorization model for the Drontylity autonomous drone platform.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register New User

**POST** `/auth/register`

Creates a new user account with Tier 0 (Prospective Visitor) status.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+420123456789"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "tier": 0,
    "tierDescription": "Prospective Visitor"
  }
}
```

### Login

**POST** `/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "tier": 1,
    "tierDescription": "Active Subscriber",
    "services": {
      "route_automation": true,
      "manual_operation": false,
      "freight_handling": true
    }
  }
}
```

### Get Current User Profile

**GET** `/auth/me`

Returns current authenticated user's profile.

**Headers:**
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+420123456789",
  "tier": 1,
  "tierDescription": "Active Subscriber",
  "onboardingCompletedAt": "2026-02-06T05:30:00.000Z",
  "services": {
    "route_automation": true,
    "manual_operation": false,
    "freight_handling": true
  },
  "createdAt": "2026-02-05T10:00:00.000Z"
}
```

---

## Flight Access Endpoints

### Get Dashboard

**GET** `/flight-access`

Returns tier-specific dashboard data for the current user.

**Headers:**
- `Authorization: Bearer <token>`

**Response for Tier 0 (200):**
```json
{
  "tier": 0,
  "tierDescription": "Prospective Visitor",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "onboardingCompletedAt": null,
  "tierNotes": null
}
```

**Response for Tier 1 (200):**
```json
{
  "tier": 1,
  "tierDescription": "Active Subscriber",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "onboardingCompletedAt": "2026-02-06T05:30:00.000Z",
  "tierNotes": null,
  "services": {
    "route_automation": true,
    "manual_operation": false,
    "freight_handling": true
  },
  "enabledServices": ["route_automation", "freight_handling"]
}
```

### Elevate Tier

**POST** `/flight-access/elevate/:target`

Elevates user to a specific tier.

**Parameters:**
- `target` (path): Target tier level (0-3)

**Headers:**
- `Authorization: Bearer <token>`

**Self-Service (Tier 0 → 1):**

Anyone can upgrade themselves from Tier 0 to Tier 1.

```bash
POST /flight-access/elevate/1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully upgraded to Active Subscriber",
  "tier": 1,
  "tierDescription": "Active Subscriber"
}
```

**Administrative Elevation (→ Tier 2 or 3):**

Requires System Overseer or Super Admin privileges.

**Request Body (optional):**
```json
{
  "targetUserId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully appointed as System Overseer",
  "tier": 2,
  "tierDescription": "System Overseer"
}
```

**Error Response (403):**
```json
{
  "error": "Only System Overseers or Super Admins can promote to administrative tiers"
}
```

### Toggle Service

**POST** `/flight-access/service/:service`

Toggles a transportation service on/off for Tier 1 subscribers.

**Parameters:**
- `service` (path): Service name
  - `route_automation` - Route Automation (Auto Taxi)
  - `manual_operation` - Manual Operation (Pilot Rental)
  - `freight_handling` - Freight Handling (Cargo Logistics)

**Headers:**
- `Authorization: Bearer <token>`

**Restrictions:**
- Only available for Tier 1 (Active Subscriber) users

**Example Request:**
```bash
POST /flight-access/service/route_automation
```

**Response (200):**
```json
{
  "success": true,
  "message": "Route Automation (Auto Taxi) enabled",
  "service": "route_automation",
  "enabled": true,
  "allServices": {
    "route_automation": true,
    "manual_operation": false,
    "freight_handling": false
  }
}
```

**Error Response (403):**
```json
{
  "error": "Service toggles are only available for Active Subscribers (Tier 1)"
}
```

### List All Users

**GET** `/flight-access/users`

Returns list of all users with their tier information (admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Restrictions:**
- Only available for Tier 2 (System Overseer) users

**Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "email": "user1@example.com",
    "name": "John Doe",
    "tier": 1,
    "tierDescription": "Active Subscriber",
    "onboardingCompletedAt": "2026-02-06T05:30:00.000Z",
    "services": ["route_automation", "freight_handling"],
    "createdAt": "2026-02-05T10:00:00.000Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "email": "admin@example.com",
    "name": "Jane Admin",
    "tier": 2,
    "tierDescription": "System Overseer",
    "onboardingCompletedAt": null,
    "services": [],
    "createdAt": "2026-01-15T08:00:00.000Z"
  }
]
```

---

## Tier System

### Tier 0: Prospective Visitor

- **Purpose:** Marketing and exploration
- **Access:** Read-only view of platform capabilities
- **Upgrade:** Can self-upgrade to Tier 1

### Tier 1: Active Subscriber

- **Purpose:** Full service access for drone transportation
- **Services Available:**
  - Route Automation (a) - Automated taxi rides
  - Manual Operation (b) - Personal drone rental
  - Freight Handling (c) - Package transport
- **Service Control:** Each service can be independently toggled

### Tier 2: System Overseer

- **Purpose:** Platform administration
- **Capabilities:** User management, system configuration
- **Restrictions:** Cannot access subscriber services

### Tier 3: Technical Crew

- **Purpose:** Fleet maintenance and operations
- **Capabilities:** Diagnostic tools, maintenance protocols
- **Restrictions:** Cannot access subscriber services

---

## Usage Examples

### Complete User Journey

#### 1. Register as New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepass123",
    "firstName": "Alice",
    "lastName": "Smith",
    "phone": "+420987654321"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepass123"
  }'
```

Save the returned `token` for subsequent requests.

#### 3. View Dashboard (Tier 0)
```bash
curl -X GET http://localhost:3000/api/flight-access \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Upgrade to Subscriber
```bash
curl -X POST http://localhost:3000/api/flight-access/elevate/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. Enable Route Automation Service
```bash
curl -X POST http://localhost:3000/api/flight-access/service/route_automation \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 6. Enable Manual Operation Service
```bash
curl -X POST http://localhost:3000/api/flight-access/service/manual_operation \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 7. View Updated Dashboard (Tier 1)
```bash
curl -X GET http://localhost:3000/api/flight-access \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created (successful registration) |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found (resource not found) |
| 500 | Internal Server Error |

---

## Security Considerations

1. **JWT Tokens:** Expire after 7 days
2. **Password Hashing:** Uses bcrypt with 10 rounds
3. **Tier Restrictions:**
   - Tier 0→1: Self-service
   - Tier 2/3: Requires admin privileges
4. **Service Isolation:** Administrative tiers cannot access subscriber services
5. **Input Validation:** All inputs are validated before processing

---

## Environment Variables

```bash
# Required
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/dronershare

# Optional
PORT=3000
NODE_ENV=development
```

---

## Testing

To run tests:

```bash
cd backend
npm test
```

For flight tier specific tests:

```bash
npm test -- flightTier.test.js
```

Note: Tests require a running MongoDB instance.

---

## Support

For issues or questions, please open an issue on GitHub.

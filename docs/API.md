# DroneShare Mobility - API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.dronershare.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## API Endpoints

### Drones

#### Get Available Drones

```http
GET /api/drones
```

**Query Parameters:**
- `lat` (optional): Latitude for location-based search
- `lng` (optional): Longitude for location-based search
- `radius` (optional): Search radius in km (default: 50)
- `serviceLevel` (optional): Filter by service level (level1/level2/level3)

**Response:**
```json
{
  "drones": [
    {
      "_id": "drone_id",
      "droneId": "DRN-001",
      "model": "SkyTransport X1",
      "manufacturer": "AeroTech",
      "status": "available",
      "currentLocation": {
        "type": "Point",
        "coordinates": [14.4378, 50.0755],
        "altitude": 0
      },
      "batteryLevel": 95,
      "specifications": {
        "maxRange": 50,
        "maxPayload": 120,
        "maxSpeed": 80,
        "passengerCapacity": 1,
        "hasSolarPanels": true
      },
      "serviceLevel": "level2"
    }
  ],
  "count": 1
}
```

#### Get Drone Details

```http
GET /api/drones/:id
```

**Response:**
```json
{
  "_id": "drone_id",
  "droneId": "DRN-001",
  "model": "SkyTransport X1",
  "currentLocation": { ... },
  "batteryLevel": 95,
  "specifications": { ... },
  "currentDockStation": {
    "_id": "station_id",
    "name": "Prague Central Dock"
  }
}
```

#### Get Drone Status

```http
GET /api/drones/:id/status
```

**Response:**
```json
{
  "droneId": "DRN-001",
  "status": "available",
  "location": {
    "lat": 50.0755,
    "lng": 14.4378,
    "altitude": 0
  },
  "batteryLevel": 95,
  "batteryStatus": {
    "hasSufficient": true,
    "currentLevel": 95,
    "needsCharging": false,
    "recommendation": "SUFFICIENT"
  },
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

#### Get Nearby Dock Stations

```http
GET /api/drones/stations/nearby?lat=50.0755&lng=14.4378&radius=20
```

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Search radius in km (default: 50)

**Response:**
```json
{
  "stations": [
    {
      "_id": "station_id",
      "name": "Prague Central Dock",
      "location": {
        "type": "Point",
        "coordinates": [14.4378, 50.0755],
        "address": "Wenceslas Square, Prague"
      },
      "capacity": {
        "total": 20,
        "available": 15
      },
      "chargingStations": {
        "solar": {
          "count": 10,
          "totalPower": 50,
          "currentOutput": 35
        },
        "wind": {
          "count": 5,
          "totalPower": 25,
          "currentOutput": 15
        }
      },
      "energyInfo": {
        "solar": { "current": 35, "capacity": 50, "efficiency": 70 },
        "wind": { "current": 15, "capacity": 25, "efficiency": 60 },
        "total": { "current": 50, "capacity": 75, "efficiency": 66.67 }
      }
    }
  ],
  "count": 1
}
```

#### Get Fleet Statistics (Admin)

```http
GET /api/drones/fleet/statistics
```

**Authentication:** Required (Admin role)

**Response:**
```json
{
  "fleet": {
    "total": 100,
    "available": 75,
    "charging": 15,
    "inUse": 8,
    "maintenance": 2
  },
  "averageBatteryLevel": 82.5,
  "totalFlightHours": 15420
}
```

### Reservations

#### Create Reservation

```http
POST /api/reservations
```

**Authentication:** Required

**Request Body:**
```json
{
  "startLocation": {
    "lat": 50.0755,
    "lng": 14.4378,
    "address": "Prague City Center"
  },
  "endLocation": {
    "lat": 50.0875,
    "lng": 14.4214,
    "address": "Prague Airport"
  },
  "serviceLevel": "level2",
  "pickupType": "user_location",
  "scheduledTime": "2024-01-15T14:00:00.000Z",
  "payload": 80
}
```

**Response:**
```json
{
  "reservation": {
    "_id": "reservation_id",
    "user": "user_id",
    "drone": "drone_id",
    "serviceLevel": "level2",
    "startLocation": { ... },
    "endLocation": { ... },
    "route": {
      "distance": 12.5,
      "estimatedDuration": 18,
      "waypoints": [[14.4378, 50.0755], [14.4214, 50.0875]],
      "optimizedPath": "{...}"
    },
    "status": "pending",
    "estimatedCost": 787,
    "legislativeCheck": {
      "passed": true,
      "restrictions": [
        "Flight altitude must not exceed 120m",
        "Visual line of sight required"
      ],
      "checkedAt": "2024-01-15T12:00:00.000Z"
    },
    "createdAt": "2024-01-15T12:00:00.000Z"
  },
  "route": {
    "waypoints": [ ... ],
    "distance": 12.5,
    "estimatedDuration": 18,
    "energyRequired": 25,
    "pathEfficiency": 95.2,
    "safetyScore": 98
  },
  "drone": {
    "id": "drone_id",
    "model": "SkyTransport X1",
    "batteryLevel": 95
  }
}
```

#### Get User's Reservations

```http
GET /api/reservations
```

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (pending/confirmed/in_progress/completed/cancelled)
- `limit` (optional): Results per page (default: 10)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "reservations": [
    {
      "_id": "reservation_id",
      "drone": {
        "_id": "drone_id",
        "model": "SkyTransport X1",
        "manufacturer": "AeroTech",
        "batteryLevel": 95
      },
      "serviceLevel": "level2",
      "startLocation": { ... },
      "endLocation": { ... },
      "status": "confirmed",
      "estimatedCost": 787,
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### Get Reservation Details

```http
GET /api/reservations/:id
```

**Authentication:** Required (Must be reservation owner)

**Response:**
```json
{
  "_id": "reservation_id",
  "user": {
    "_id": "user_id",
    "firstName": "Jan",
    "lastName": "Novák",
    "email": "jan.novak@example.com"
  },
  "drone": { ... },
  "serviceLevel": "level2",
  "route": { ... },
  "status": "in_progress",
  "actualStartTime": "2024-01-15T14:05:00.000Z",
  "payment": {
    "amount": 787,
    "currency": "CZK",
    "status": "paid",
    "paidAt": "2024-01-15T13:55:00.000Z"
  }
}
```

#### Upload Pre-Flight Photos

```http
POST /api/reservations/:id/pre-flight-photos
```

**Authentication:** Required (For Level 3 service)

**Request Body:**
```json
{
  "photos": [
    "https://storage.example.com/drone-photos/pre-1.jpg",
    "https://storage.example.com/drone-photos/pre-2.jpg"
  ]
}
```

**Response:**
```json
{
  "message": "Pre-flight photos uploaded",
  "reservation": {
    "_id": "reservation_id",
    "preFlightPhotos": [
      {
        "url": "https://storage.example.com/drone-photos/pre-1.jpg",
        "timestamp": "2024-01-15T13:50:00.000Z",
        "verified": false
      }
    ]
  }
}
```

#### Upload Post-Flight Photos

```http
POST /api/reservations/:id/post-flight-photos
```

**Authentication:** Required (For Level 3 service)

**Request Body:**
```json
{
  "photos": [
    "https://storage.example.com/drone-photos/post-1.jpg",
    "https://storage.example.com/drone-photos/post-2.jpg"
  ]
}
```

**Response:**
```json
{
  "message": "Post-flight photos uploaded",
  "reservation": {
    "_id": "reservation_id",
    "status": "completed",
    "postFlightPhotos": [ ... ]
  }
}
```

#### Cancel Reservation

```http
DELETE /api/reservations/:id
```

**Authentication:** Required

**Response:**
```json
{
  "message": "Reservation cancelled",
  "reservation": {
    "_id": "reservation_id",
    "status": "cancelled"
  }
}
```

## WebSocket Events

### Real-Time Tracking

Connect to WebSocket server:

```javascript
const socket = io('http://localhost:3000');

// Subscribe to drone tracking
socket.emit('track-drone', { droneId: 'DRN-001' });

// Listen for location updates
socket.on('drone-location-update', (data) => {
  console.log('Drone location:', data);
  // {
  //   droneId: 'DRN-001',
  //   location: { lat: 50.0755, lng: 14.4378 },
  //   batteryLevel: 92,
  //   status: 'in_use'
  // }
});

// Listen for arrival updates
socket.on('arrival-update', (data) => {
  console.log('ETA:', data.estimatedArrival);
});
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

- **Anonymous requests**: 100 requests per 15 minutes
- **Authenticated requests**: 1000 requests per 15 minutes
- **IoT device updates**: Unlimited

## Examples

### Complete Booking Flow

```javascript
// 1. Get available drones
const drones = await fetch('/api/drones?lat=50.0755&lng=14.4378');

// 2. Create reservation
const reservation = await fetch('/api/reservations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startLocation: { lat: 50.0755, lng: 14.4378 },
    endLocation: { lat: 50.0875, lng: 14.4214 },
    serviceLevel: 'level2',
    pickupType: 'user_location'
  })
});

// 3. Track drone in real-time
const socket = io('http://localhost:3000');
socket.emit('track-drone', { droneId: reservation.drone.id });

// 4. Upload post-flight photos (Level 3 only)
await fetch(`/api/reservations/${reservation._id}/post-flight-photos`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    photos: ['url1.jpg', 'url2.jpg']
  })
});
```

## Postman Collection

Import the Postman collection for testing:

```bash
curl -o postman-collection.json https://raw.githubusercontent.com/M1N0-OR1G1NAL/DRONERSHARE_MOBILLITY/main/docs/postman-collection.json
```

## Support

For API issues or questions, please open an issue on GitHub.

# DroneShare Mobility - Setup Guide

## Prerequisites

Before setting up the DroneShare Mobility platform, ensure you have the following installed:

### Required Software
- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn** package manager
- **Git**

### Optional (for mobile development)
- **Expo CLI** (for React Native development)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### External Services
- **Google Maps API Key** (for map services)
- **Stripe Account** (for payment processing)
- **AWS Account** (for IoT integration)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/M1N0-OR1G1NAL/DRONERSHARE_MOBILLITY.git
cd DRONERSHARE_MOBILLITY
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/dronershare

# JWT Configuration
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRE=7d

# AWS IoT Configuration
AWS_IOT_ENDPOINT=your-iot-endpoint.iot.region.amazonaws.com
AWS_IOT_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Maps API (Google Maps)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Drone Configuration
MAX_DRONE_RANGE_KM=50
MAX_DRONE_PAYLOAD_KG=120
CHARGING_STATION_THRESHOLD=20
```

#### Start MongoDB

Ensure MongoDB is running:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Run Database Migrations (Optional)

If you have seed data:

```bash
npm run seed
```

#### Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend API will be available at `http://localhost:3000`

#### Verify Backend Installation

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "uptime": 1.234,
  "environment": "development"
}
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment

Create `.env` file in frontend directory:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
REACT_APP_WS_URL=ws://localhost:3000
```

#### Start the Mobile App

```bash
# Start Expo development server
npm start

# Or directly start on specific platform
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For web browser
```

### 4. IoT Layer Setup (Optional)

For testing drone communication:

```bash
cd ../iot
npm install
```

Create `.env` file:

```env
AWS_IOT_ENDPOINT=your-iot-endpoint.iot.region.amazonaws.com
AWS_IOT_REGION=us-east-1
DRONE_ID=test-drone-001
```

Start IoT simulator:

```bash
node droneSimulator.js
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Run Specific Test Suite

```bash
npm test -- --testPathPattern=reservation
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Development Workflow

### Running the Full Stack

Option 1: Manual (separate terminals)
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start

# Terminal 3 - IoT Simulator (optional)
cd iot && node droneSimulator.js
```

Option 2: Using Docker Compose
```bash
docker-compose up
```

### API Documentation

Once the backend is running, access the API documentation at:
- Swagger UI: `http://localhost:3000/api-docs`
- Postman Collection: `docs/postman-collection.json`

## Database Initialization

### Create Sample Data

```bash
cd backend
node scripts/seedDatabase.js
```

This will create:
- 10 sample drones
- 5 dock stations
- 3 test users
- Sample reservations

### Database Indexes

Important indexes are created automatically by Mongoose schemas. Verify with:

```bash
mongo dronershare
db.drones.getIndexes()
db.reservations.getIndexes()
db.dockstations.getIndexes()
```

## Configuration

### Service Levels

The system supports three service levels:

**Level 1 - Fixed Pickup**
- User goes to nearest dock station
- Lower cost
- Best for predictable routes

**Level 2 - User Location Pickup**
- Drone flies to user's location
- Medium cost
- Flexible pickup

**Level 3 - Self-Piloting**
- User rents and pilots the drone
- Requires pilot license verification
- Highest flexibility
- Photo verification required

### Pricing Configuration

Edit `backend/src/config/pricing.js`:

```javascript
module.exports = {
  baseCostPerKm: 50, // CZK per kilometer
  levelMultipliers: {
    level1: 1.0,
    level2: 1.3,
    level3: 1.5
  },
  minimumCharge: 200 // CZK
};
```

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**IoT Connection Issues**
- Verify AWS credentials
- Check IoT endpoint URL
- Ensure device certificates are properly configured

**Frontend Can't Connect to Backend**
- Verify backend is running on port 3000
- Check CORS settings in backend
- Ensure API_URL in frontend .env is correct

### Debugging

Enable debug logs:

```bash
# Backend
DEBUG=* npm run dev

# View MongoDB queries
DEBUG=mongoose:* npm run dev
```

## Production Deployment

### Environment Preparation

1. **Server Requirements**:
   - 4 CPU cores minimum
   - 8GB RAM minimum
   - 100GB storage
   - Ubuntu 20.04 LTS or similar

2. **Install Dependencies**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mongodb
```

3. **Configure Firewall**:
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 27017/tcp  # Only if MongoDB is remote
sudo ufw enable
```

### Using PM2 for Process Management

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start src/server.js --name "dronershare-api"

# Configure to start on boot
pm2 startup
pm2 save
```

### Using Docker

```bash
# Build image
docker build -t dronershare-backend ./backend

# Run container
docker run -d \
  -p 3000:3000 \
  --name dronershare-api \
  --env-file backend/.env \
  dronershare-backend
```

### SSL/TLS Configuration

Use Let's Encrypt with Nginx:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.dronershare.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring

### Health Checks

```bash
# API health
curl https://api.dronershare.com/health

# Database health
mongo --eval "db.adminCommand('ping')"
```

### Logs

```bash
# View PM2 logs
pm2 logs dronershare-api

# View system logs
journalctl -u dronershare-api -f
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/M1N0-OR1G1NAL/DRONERSHARE_MOBILLITY/issues
- Documentation: https://github.com/M1N0-OR1G1NAL/DRONERSHARE_MOBILLITY/docs

## Next Steps

After successful installation:

1. Review the [Architecture Documentation](ARCHITECTURE.md)
2. Check the [API Documentation](API.md)
3. Explore the [Contributing Guidelines](CONTRIBUTING.md)
4. Set up your development environment
5. Start building features!

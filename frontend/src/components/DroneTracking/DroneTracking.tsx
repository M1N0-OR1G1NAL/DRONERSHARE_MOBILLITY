import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './DroneTracking.css';

interface DronePosition {
  lat: number;
  lng: number;
  altitude: number;
  battery: number;
  speed: number;
  timestamp: Date;
}

const containerStyle = {
  width: '100%',
  height: '500px'
};

const DroneTracking: React.FC = () => {
  const [dronePosition, setDronePosition] = useState<DronePosition>({
    lat: 50.0755,
    lng: 14.4378,
    altitude: 0,
    battery: 100,
    speed: 0,
    timestamp: new Date()
  });

  const [isTracking, setIsTracking] = useState(false);

  // Simulate real-time tracking (in production, this would be from WebSocket or API)
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setDronePosition(prev => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
        altitude: Math.max(0, prev.altitude + (Math.random() - 0.5) * 10),
        battery: Math.max(0, prev.battery - Math.random() * 0.5),
        speed: Math.random() * 50,
        timestamp: new Date()
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <div className="drone-tracking">
      <h2>Real-time lokalizace dronu</h2>
      
      <div className="tracking-controls">
        <button 
          onClick={toggleTracking}
          className={isTracking ? 'stop-button' : 'start-button'}
        >
          {isTracking ? 'Zastavit sledování' : 'Spustit sledování'}
        </button>
      </div>

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: dronePosition.lat, lng: dronePosition.lng }}
          zoom={15}
        >
          <Marker
            position={{ lat: dronePosition.lat, lng: dronePosition.lng }}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="15" fill="#1976d2" stroke="white" stroke-width="2"/>
                  <circle cx="20" cy="20" r="5" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40)
            }}
            title="Aktuální poloha dronu"
          />
        </GoogleMap>
      </LoadScript>

      <div className="drone-telemetry">
        <h3>Telemetrie dronu</h3>
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <span className="label">Pozice:</span>
            <span className="value">
              {dronePosition.lat.toFixed(6)}, {dronePosition.lng.toFixed(6)}
            </span>
          </div>
          <div className="telemetry-item">
            <span className="label">Nadmořská výška:</span>
            <span className="value">{dronePosition.altitude.toFixed(1)} m</span>
          </div>
          <div className="telemetry-item">
            <span className="label">Baterie:</span>
            <span className="value battery" style={{ 
              color: dronePosition.battery > 50 ? 'green' : dronePosition.battery > 20 ? 'orange' : 'red'
            }}>
              {dronePosition.battery.toFixed(1)}%
            </span>
          </div>
          <div className="telemetry-item">
            <span className="label">Rychlost:</span>
            <span className="value">{dronePosition.speed.toFixed(1)} km/h</span>
          </div>
          <div className="telemetry-item">
            <span className="label">Poslední aktualizace:</span>
            <span className="value">{dronePosition.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneTracking;

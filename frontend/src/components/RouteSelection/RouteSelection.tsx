import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import './RouteSelection.css';

interface Location {
  lat: number;
  lng: number;
  label: string;
}

const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 50.0755,
  lng: 14.4378 // Prague, Czech Republic
};

const RouteSelection: React.FC = () => {
  const [pointA, setPointA] = useState<Location | null>(null);
  const [pointB, setPointB] = useState<Location | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const location: Location = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
      label: ''
    };

    if (!pointA) {
      location.label = 'Start (A)';
      setPointA(location);
    } else if (!pointB) {
      location.label = 'Cíl (B)';
      setPointB(location);
    }
  }, [pointA, pointB]);

  const calculateRoute = useCallback(() => {
    if (!pointA || !pointB) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: pointA.lat, lng: pointA.lng },
        destination: { lat: pointB.lat, lng: pointB.lng },
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const route = result.routes[0];
          if (route.legs[0]) {
            setDistance(route.legs[0].distance?.text || '');
            setDuration(route.legs[0].duration?.text || '');
          }
        }
      }
    );
  }, [pointA, pointB]);

  const resetRoute = () => {
    setPointA(null);
    setPointB(null);
    setDirections(null);
    setDistance('');
    setDuration('');
  };

  React.useEffect(() => {
    if (pointA && pointB) {
      calculateRoute();
    }
  }, [pointA, pointB, calculateRoute]);

  return (
    <div className="route-selection">
      <h2>Výběr trasy</h2>
      <div className="instructions">
        <p>Klikněte na mapu pro výběr bodu A (start) a bodu B (cíl)</p>
      </div>
      
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onClick={handleMapClick}
        >
          {pointA && (
            <Marker
              position={{ lat: pointA.lat, lng: pointA.lng }}
              label="A"
              title={pointA.label}
            />
          )}
          {pointB && (
            <Marker
              position={{ lat: pointB.lat, lng: pointB.lng }}
              label="B"
              title={pointB.label}
            />
          )}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>

      <div className="route-info">
        {pointA && (
          <div className="point-info">
            <strong>Bod A:</strong> {pointA.lat.toFixed(6)}, {pointA.lng.toFixed(6)}
          </div>
        )}
        {pointB && (
          <div className="point-info">
            <strong>Bod B:</strong> {pointB.lat.toFixed(6)}, {pointB.lng.toFixed(6)}
          </div>
        )}
        {distance && (
          <div className="route-stats">
            <strong>Vzdálenost:</strong> {distance}
          </div>
        )}
        {duration && (
          <div className="route-stats">
            <strong>Odhadovaný čas letu:</strong> {duration}
          </div>
        )}
      </div>

      <div className="route-actions">
        <button onClick={resetRoute} disabled={!pointA && !pointB}>
          Resetovat trasu
        </button>
        {pointA && pointB && (
          <button className="primary-button">
            Pokračovat k rezervaci
          </button>
        )}
      </div>
    </div>
  );
};

export default RouteSelection;

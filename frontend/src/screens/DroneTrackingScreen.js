import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import io from 'socket.io-client';

/**
 * Real-time drone tracking screen
 * Shows live location of drone during flight
 */
const DroneTrackingScreen = ({ route }) => {
  const { reservationId, droneId } = route.params;
  const [droneLocation, setDroneLocation] = useState(null);
  const [droneStatus, setDroneStatus] = useState('pending');
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [estimatedArrival, setEstimatedArrival] = useState(null);

  useEffect(() => {
    // Connect to real-time updates via WebSocket
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connected to tracking service');
      socket.emit('track-drone', { droneId });
    });

    socket.on('drone-location-update', (data) => {
      setDroneLocation({
        latitude: data.location.lat,
        longitude: data.location.lng
      });
      setBatteryLevel(data.batteryLevel);
      setDroneStatus(data.status);
    });

    socket.on('arrival-update', (data) => {
      setEstimatedArrival(data.estimatedArrival);
    });

    return () => {
      socket.disconnect();
    };
  }, [droneId]);

  if (!droneLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connecting to drone...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          ...droneLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02
        }}
      >
        <Marker
          coordinate={droneLocation}
          title="Your Drone"
          description={`Battery: ${batteryLevel}%`}
        >
          <View style={styles.droneMarker}>
            <Text style={styles.droneIcon}>🚁</Text>
          </View>
        </Marker>
      </MapView>

      <View style={styles.statusPanel}>
        <Text style={styles.statusTitle}>Flight Status</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusValue}>{droneStatus}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Battery:</Text>
          <Text style={styles.statusValue}>{batteryLevel}%</Text>
        </View>

        {estimatedArrival && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>ETA:</Text>
            <Text style={styles.statusValue}>{estimatedArrival}</Text>
          </View>
        )}

        <View style={styles.batteryBar}>
          <View style={[styles.batteryFill, { width: `${batteryLevel}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  map: {
    flex: 1
  },
  droneMarker: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  droneIcon: {
    fontSize: 32
  },
  statusPanel: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  statusLabel: {
    fontSize: 14,
    color: '#666'
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  batteryBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden'
  },
  batteryFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5
  }
});

export default DroneTrackingScreen;

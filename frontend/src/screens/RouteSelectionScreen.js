import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

/**
 * Main screen for selecting drone taxi route
 * Allows user to select point A (start) and point B (destination)
 */
const RouteSelectionScreen = ({ navigation }) => {
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [serviceLevel, setServiceLevel] = useState('level1');
  const [estimatedRoute, setEstimatedRoute] = useState(null);

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    
    if (!startLocation) {
      setStartLocation(coordinate);
    } else if (!endLocation) {
      setEndLocation(coordinate);
      // Calculate route
      calculateRoute(startLocation, coordinate);
    } else {
      // Reset and start over
      setStartLocation(coordinate);
      setEndLocation(null);
      setEstimatedRoute(null);
    }
  };

  const calculateRoute = async (start, end) => {
    try {
      // In production, call backend API
      const response = await fetch('http://localhost:3000/api/reservations/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startLocation: { lat: start.latitude, lng: start.longitude },
          endLocation: { lat: end.latitude, lng: end.longitude },
          serviceLevel
        })
      });

      const data = await response.json();
      setEstimatedRoute(data.route);
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate route');
    }
  };

  const handleBooking = () => {
    if (!startLocation || !endLocation) {
      Alert.alert('Error', 'Please select both start and end locations');
      return;
    }

    navigation.navigate('BookingConfirmation', {
      startLocation,
      endLocation,
      serviceLevel,
      estimatedRoute
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 50.0755,
          longitude: 14.4378,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }}
        onPress={handleMapPress}
      >
        {startLocation && (
          <Marker
            coordinate={startLocation}
            title="Start"
            pinColor="green"
          />
        )}
        {endLocation && (
          <Marker
            coordinate={endLocation}
            title="Destination"
            pinColor="red"
          />
        )}
        {estimatedRoute && estimatedRoute.waypoints && (
          <Polyline
            coordinates={estimatedRoute.waypoints.map(wp => ({
              latitude: wp[1],
              longitude: wp[0]
            }))}
            strokeWidth={3}
            strokeColor="#007AFF"
          />
        )}
      </MapView>

      <View style={styles.bottomPanel}>
        <Text style={styles.title}>Select Your Route</Text>
        
        <View style={styles.serviceLevelContainer}>
          <TouchableOpacity
            style={[styles.levelButton, serviceLevel === 'level1' && styles.levelButtonActive]}
            onPress={() => setServiceLevel('level1')}
          >
            <Text style={styles.levelButtonText}>Level 1</Text>
            <Text style={styles.levelDescription}>Fixed pickup point</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.levelButton, serviceLevel === 'level2' && styles.levelButtonActive]}
            onPress={() => setServiceLevel('level2')}
          >
            <Text style={styles.levelButtonText}>Level 2</Text>
            <Text style={styles.levelDescription}>Pickup at your location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.levelButton, serviceLevel === 'level3' && styles.levelButtonActive]}
            onPress={() => setServiceLevel('level3')}
          >
            <Text style={styles.levelButtonText}>Level 3</Text>
            <Text style={styles.levelDescription}>Rent & fly yourself</Text>
          </TouchableOpacity>
        </View>

        {estimatedRoute && (
          <View style={styles.routeInfo}>
            <Text>Distance: {estimatedRoute.distance.toFixed(2)} km</Text>
            <Text>Duration: {estimatedRoute.estimatedDuration.toFixed(0)} min</Text>
            <Text>Estimated Cost: {estimatedRoute.estimatedCost} CZK</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.bookButton, (!startLocation || !endLocation) && styles.bookButtonDisabled]}
          onPress={handleBooking}
          disabled={!startLocation || !endLocation}
        >
          <Text style={styles.bookButtonText}>Book Drone</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  serviceLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  levelButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  levelButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  levelButtonText: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  levelDescription: {
    fontSize: 10,
    textAlign: 'center'
  },
  routeInfo: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15
  },
  bookButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc'
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default RouteSelectionScreen;

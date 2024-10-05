import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const HomePage = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [location, setLocation] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    const loadEmployeeData = async () => {
        try {
          const storedEmployeeId = await AsyncStorage.getItem('employeeId');
          const storedName = await AsyncStorage.getItem('name');
          const storedMobileNumber = await AsyncStorage.getItem('mobileNumber');
          
          console.log('Loaded Data:', { storedEmployeeId, storedName, storedMobileNumber }); // Log loaded data
      
          if (storedEmployeeId) setEmployeeId(storedEmployeeId);
          if (storedName) setName(storedName);
          if (storedMobileNumber) setMobileNumber(storedMobileNumber);
        } catch (error) {
          console.log('Error loading employee data:', error);
        }
      };
      

    loadEmployeeData();
  }, []);

  // Request location permission for Android
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Permission',
          message: 'We need access to your location to mark attendance.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Detect location
  const detectLocation = async () => {
    const permissionGranted = await requestLocationPermission();

    if (!permissionGranted) {
      Alert.alert('Permission Denied', 'Location permission is required to mark attendance.');
      return;
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        // Use fetch to get the address from Nominatim
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await response.json();
          const address = data.display_name; // Get the formatted address
          Alert.alert('Location Detected', `Latitude: ${latitude}, Longitude: ${longitude}\nLocation: ${address}`);
          setLocationName(address); // Store the location name in state
        } catch (error) {
          console.log('Error getting address:', error);
          Alert.alert('Error', 'Could not retrieve address.');
        }
      },
      (error) => {
        console.log('Error getting location:', error);
        Alert.alert('Error', 'Could not detect location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  // Mark Attendance
  const markAttendance = () => {
    if (!location) {
      Alert.alert('Error', 'Please detect your location before marking attendance.');
      return;
    }

    const newRecord = {
      time: moment().format('MMMM Do YYYY, h:mm:ss a'), // Current date and time
      location,
    };

    setAttendanceRecords((prevRecords) => [...prevRecords, newRecord]);
    Alert.alert('Attendance Marked', 'Your attendance has been recorded successfully.');
  };

  // Render attendance record
  const renderAttendanceRecord = ({ item }) => (
    <View style={styles.attendanceRecord}>
      <Text style={styles.attendanceText}>Time: {item.time}</Text>
      <Text style={styles.attendanceText}>Location: Lat {item.location.latitude}, Lon {item.location.longitude}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Employee Details</Text>
      
      <Text style={styles.text}>Employee ID: {employeeId}</Text>
      {/* <Text style={styles.text}>Name: {name}</Text>
      <Text style={styles.text}>Mobile Number: {mobileNumber}</Text> */}

      <TouchableOpacity style={styles.button} onPress={detectLocation}>
        <Text style={styles.buttonText}>Detect Location</Text>
      </TouchableOpacity>

      {location && (
        <View style={styles.locationContainer}>
          {/* <Text style={styles.locationText}>Latitude: {location.latitude}</Text>
          <Text style={styles.locationText}>Longitude: {location.longitude}</Text> */}
          {locationName && <Text style={styles.locationText}>Location: {locationName}</Text>} 
        </View>
      )}

      <TouchableOpacity style={styles.attendanceButton} onPress={markAttendance}>
        <Text style={styles.attendanceButtonText}>Mark Attendance</Text>
      </TouchableOpacity>

      <Text style={styles.attendanceTitle}>Attendance Records:</Text>
      <FlatList
        data={attendanceRecords}
        renderItem={renderAttendanceRecord}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No attendance records yet.</Text>}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  locationContainer: {
    marginTop: 20,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  attendanceButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  attendanceButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  attendanceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  attendanceRecord: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  attendanceText: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
  },
});

export default HomePage;

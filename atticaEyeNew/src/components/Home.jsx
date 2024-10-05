import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/constants';
import { NativeModules } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const { CallLogModule, SmsModule } = NativeModules;

const Home = () => {
  const [employeeData, setEmployeeData] = useState({
    callLogs: [],
    messages: [],
    location: {},
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const getEmployeeId = async () => {
      try {
        const storedEmployeeId = await AsyncStorage.getItem('employeeId');
        if (storedEmployeeId) {
          setEmployeeId(storedEmployeeId);
          await fetchEmployeeData(storedEmployeeId);
        } else {
          throw new Error('Employee ID not found in storage.');
        }
      } catch (error) {
        setErrorMessage(error.message);
        setLoading(false); // Stop loading on error
      }
    };

    getEmployeeId();
  }, []);

  const fetchEmployeeData = async (id) => {
    try {
      console.log('Fetching data for ID:', id);
      
      // Fetch call logs using CallLogModule
      const callLogs = await new Promise((resolve, reject) => {
        CallLogModule.getCallLogs((logs) => {
          resolve(logs);
        });
      });
      console.log('Fetched Call Logs:', callLogs);

      // Fetch messages using SmsModule
      const messages = await new Promise((resolve, reject) => {
        SmsModule.getSmsLogs((logs) => {
          resolve(logs);
        });
      });
      console.log('Fetched Messages:', messages);

      // Fetch location
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const timestamp = position.timestamp;

          console.log('Fetched Location:', { latitude, longitude });

          // Combine all data into employeeData
          const data = {
            employeeId: id,
            callLogs,
            messages,
            location: { latitude, longitude, timestamp },
          };

          setEmployeeData(data);
          await sendEmployeeData(data);
        },
        (error) => {
          console.error('Geolocation error:', error.code, error.message);
          setErrorMessage('Unable to retrieve location.');
        }
      );
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false); // Stop loading after data fetching attempt
    }
  };

  const sendEmployeeData = async (data) => {
    try {
        console.log('Sending data:', JSON.stringify(data)); // Log data being sent

        const response = await fetch(`${BASE_URL}/employee/${data.employeeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`Failed to send employee data: ${errorText}`);
        }

        console.log('Data sent successfully');
    } catch (error) {
        console.error('Error sending data:', error);
        setErrorMessage(error.message);
    }
};


  if (loading) {
    return <Text>Loading data...</Text>; // Display loading message
  }

  if (errorMessage) {
    return <Text>Error: {errorMessage}</Text>; // Display error message
  }

  const locationDisplay = employeeData.location.latitude && employeeData.location.longitude
    ? `Latitude: ${employeeData.location.latitude}, Longitude: ${employeeData.location.longitude}`
    : 'No location data available';

  return (
    <View style={styles.container}>
      <Text>Employee ID: {employeeId}</Text>
      <Text>Location: {locationDisplay}</Text>
      <Text>Call Logs: {employeeData.callLogs.length > 0 ? JSON.stringify(employeeData.callLogs) : "No call logs available"}</Text>
      <Text>Messages: {employeeData.messages.length > 0 ? JSON.stringify(employeeData.messages) : "No messages available"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;



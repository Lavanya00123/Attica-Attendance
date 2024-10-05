// LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert,StyleSheet,TouchableOpacity } from 'react-native';
import axios from 'axios';
import {BASE_URL} from '../../config/constants'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Login = ({ navigation }) => {
  // const navigation = useNavigation();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/users/login`, { employeeId, password });
      
      // Log the entire response to check its structure
      console.log('Login Response:', response.data);
  
      if (response.status === 200) {
        await AsyncStorage.setItem('employeeId', employeeId);
        
        // Check if name and mobileNumber are defined before storing
        const name = response.data.name || ''; // Default to empty string if undefined
        const mobileNumber = response.data.mobileNumber || ''; // Default to empty string if undefined
  
        await AsyncStorage.setItem('name', name);
        await AsyncStorage.setItem('mobileNumber', mobileNumber);
  
        console.log('Employee ID saved:', employeeId);
        console.log('Name saved:', name);
        console.log('Mobile Number saved:', mobileNumber);
        
        Alert.alert('Login successful');
        navigation.navigate('HomePage'); // Navigate to Home screen
      } else {
        Alert.alert('Login failed', 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login failed', error.response?.data?.message || 'An error occurred');
    }
  };
  
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        value={employeeId}
        onChangeText={setEmployeeId}
        placeholder="Enter your Employee ID"
        style={styles.input}
        // keyboardType="numeric"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Enter your Password"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}> Register now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center', // Align content to center vertically
      alignItems: 'center', // Align content to center horizontally
      padding: 20,
      backgroundColor: '#f5f5f5', // Light background color
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 30,
      color: '#333', // Darker text color
    },
    input: {
      width: '100%',
      padding: 10,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      backgroundColor: '#fff',
    },
    button: {
      backgroundColor: '#007BFF',
      paddingVertical: 15,
      paddingHorizontal: 50,
      borderRadius: 8,
      marginTop: 20,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    registerContainer: {
      flexDirection: 'row',
      marginTop: 20,
    },
    registerText: {
      fontSize: 16,
      color: '#666',
    },
    registerLink: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#007BFF',
    },
  });
  

export default Login;

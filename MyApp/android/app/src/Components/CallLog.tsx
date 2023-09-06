import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, PermissionsAndroid } from 'react-native';
import CallDetectorManager from 'react-native-call-detection';
import CallLogs from 'react-native-call-log';

interface CallLogEntry {
  event: string;
  number: string;
}

const CallLogAccessFile: React.FC = () => {
  const [callLog, setCallLog] = useState<CallLogEntry[]>([]);

  useEffect(() => {
    let callDetector: CallDetectorManager | null = null;

    const handleCallEvent = (event: string, number: string | null) => {
      if (event && number) {
        const callEntry: CallLogEntry = { event, number };
        setCallLog((prevCallLog) => [...prevCallLog, callEntry]);
        console.log(`Event: ${event}, Number: ${number}`);
      }
    };

    const requestPhoneStatePermission = async () => {
      try {
        const rationale: PermissionsAndroid.Rationale = {
          title: 'Phone State Permission',
          message: 'This app needs access to your phone state and call logs',
          buttonPositive: 'OK',
        };

        const grantedPhoneState = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          rationale
        );

        const grantedCallLog = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          rationale
        );

        if (
          grantedPhoneState === PermissionsAndroid.RESULTS.GRANTED &&
          grantedCallLog === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions Accepted by User');
          // Initialize the call detector
          callDetector = new CallDetectorManager(
            handleCallEvent,
            true // To read the phone number of the incoming call [ANDROID]
          );
        } else {
          console.log('Permissions denied by user');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };

    // Request permission when the component mounts
    requestPhoneStatePermission();

    return () => {
      if (callDetector) {
        callDetector.dispose();
      }
    };
  }, []);



  return (
    <View>
      <Text>Call Log:</Text>
      <FlatList
        data={callLog}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>Event: {item.event}</Text>
            <Text>Number: {item.number}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default CallLogAccessFile;

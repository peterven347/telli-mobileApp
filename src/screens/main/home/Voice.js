import React, { useState, useRef } from 'react';
import { View, Button, Text, StyleSheet, PermissionsAndroid, Platform } from 'react-native';


export default function VoiceNote() {


  return (
    <View style={styles.container}>
      <Text>Voice</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    alignItems: 'center',
    width: 250,
  },
  buttonRow: {
    flexDirection: 'row',
    marginVertical: 5,
    gap: 10,
  },
  timer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
});

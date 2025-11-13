import React, { useRef } from 'react';
import {Dimensions, View, Button, StyleSheet } from 'react-native';
import { NodeCameraView } from 'react-native-nodemediaclient';

export default function Broadcaster() {
  const nodeCameraRef = useRef();

	const startStreaming = () => {
		vbRef.current.start();
	};

	const stopStreaming = () => {
		vbRef.current.stop();
	};

	return (
		<View style={styles.container}>
			{/* Camera Preview */}
			<NodeCameraView
				ref={nodeCameraRef}
				style={{
					width: Dimensions.get('screen').width,
					height: Dimensions.get('screen').height,
				}}
				outputUrl={"rtmp://192.168.5.248/live/test"}
				camera={{ cameraId: 1, cameraFrontMirror: true }}
				audio={{ bitrate: 32000, profile: 1, samplerate: 44100 }}
				video={{
					preset: 12,
					bitrate: 400000,
					profile: 1,
					fps: 15,
					videoFrontMirror: false,
				}}
				autopreview={true}
			/>

			{/* Start/Stop Buttons */}
			<View style={styles.controls}>
				<Button title="Start Streaming" onPress={startStreaming} />
				<Button title="Stop Streaming" onPress={stopStreaming} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	camera: { flex: 1 },
	controls: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
});

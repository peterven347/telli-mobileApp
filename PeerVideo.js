import React, { useEffect, useState, useRef } from 'react';
import { View, Button, Text, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices, RTCView, MediaStream } from 'react-native-webrtc';
import SplashScreen from 'react-native-splash-screen'
import { initSocket, socketEmit } from "../../../../../apis/socket"

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:relay1.expressturn.com:3478',
            username: 'efGHklmn',
            credential: 'ABC123xyz'
        }
    ]
};

export default function App() {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const pc = useRef(null);
    const iceCandidatesQueue = useRef([]);
    const isOfferer = useRef(false);
    async function requestPermissions() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);
                const cameraGranted = granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED;
                const audioGranted = granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED;
                if (!cameraGranted || !audioGranted) {
                    Alert.alert('Permissions not granted', 'You need to enable camera and audio permissions to use this app');
                }
            } catch (err) {
                console.warn(err);
            }
        }
    }

    const createPeerConnection = async () => {
        const newPc = new RTCPeerConnection(configuration);
        newPc.onicecandidate = (event) => {
            if (event.candidate) {
                socketEmit('ice-candidate', {
                    candidate: event.candidate,
                });
            }
        };
        newPc.ontrack = event => {
            console.log('📡 ontrack event:');
            if (event.streams && event.streams[0]) {
                console.log('Setting remote stream:');
                // setRemoteStream(event.streams[0]);
                const inboundStream = new MediaStream();
                event.streams[0]?.getTracks().forEach(track => inboundStream.addTrack(track));
                setRemoteStream(inboundStream);
            }
        };

        newPc.oniceconnectionstatechange = () => {
            console.log('🧊 ICE connection state:', newPc.iceConnectionState);
        };
        newPc.onconnectionstatechange = () => {
            console.log('📡 Connection state:', newPc.connectionState);
        };

        return newPc;
    };

    const proceedCall = async () => {
        try {
            const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
            setLocalStream(stream);
            pc.current = await createPeerConnection();
            stream.getTracks().forEach(track => {
                pc.current.addTrack(track, stream);
            });
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);

            socketEmit('offer', {
                sdp: pc.current.localDescription,
            });
        } catch (err) {
            console.log(err)
        }
    };

    const handleOffer = async (payload) => {
        socketEmit("join-room", "roomId")
        try {
            pc.current = await createPeerConnection();
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setLocalStream(stream);
            stream.getTracks().forEach(track => {
                pc.current.addTrack(track, stream);
            });

            await pc.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));

            for (const candidate of iceCandidatesQueue.current) {
                try {
                    await pc.current.addIceCandidate(candidate);
                    console.log("✅ Queued ICE candidate added");
                } catch (err) {
                    console.error("Error adding queued ICE candidate:", err);
                }
            }
            iceCandidatesQueue.current = []; // Clear queue
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            socketEmit('answer', {
                sdp: pc.current.localDescription,
            });
        } catch (err) {
            console.log('Error handling offer:', err);
        }
    };

    const handleAnswer = async (payload) => {
        try {
            await pc.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));

            for (const candidate of iceCandidatesQueue.current) {
                try {
                    await pc.current.addIceCandidate(candidate);
                    console.log("✅ Queued ICE candidate added");
                } catch (err) {
                    console.error("Error adding queued ICE candidate:", err);
                }
            }
            iceCandidatesQueue.current = []; // Clear queue
        } catch (err) {
            console.error('Error handling answer:', err);
        }
    };

    const pickCall = async () => {
        handleOffer()
    };

    const ignoreCall = async () => {
        socketEmit("ignore-call", "roomId")
    };

    const hangUp = () => {
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }
    };
    
    const startCall = () => {
        socketEmit("create-room", "the room")
    }

    useEffect(() => {
        SplashScreen.hide()
        requestPermissions()
        async function connect() {
            const socket = await initSocket()

            socket.on('ice-candidate', async (incoming) => {
                console.log("Receiving ICE candidate...");
                if (pc.current) {
                    const candidate = new RTCIceCandidate(incoming.candidate);

                    if (pc.current.remoteDescription && pc.current.remoteDescription.type) {
                        try {
                            await pc.current.addIceCandidate(candidate);
                            console.log("✅ ICE candidate added immediately");
                        } catch (err) {
                            console.error('Error adding received ice candidate', err);
                        }
                    } else {
                        console.log("🕒 Remote description not set. Queuing candidate.");
                        iceCandidatesQueue.current.push(candidate);
                    }
                }
            });

            socket.on('offer', async (payload) => {
                console.log('📨 Offer received');
                await handleOffer(payload);
            });

            socket.on('answer', async (payload) => {
                console.log('📨 Answer received');
                await handleAnswer(payload);
            });

            socket.on("join-room", async (roomId) => {
                await ring()
            });

            socket.on("cancel-call", async () => {

            });

            socket.on("user-joined", () => {
                proceedCall()
            })
        }
        connect();
    }, [])

    return (
        <View style={{ marginTop: 60 }}>
            <Button title="Join Room" onPress={startCall} />
            {localStream && (
                <>
                    <Text>Local Stream</Text>
                    <Text>{localStream.toURL()}</Text>
                    <RTCView
                        streamURL={localStream.toURL()}
                        style={{ width: 300, height: 300 }}
                        objectFit="cover"
                        mirror={false}

                    />
                </>
            )}

            {remoteStream && (
                <>
                    <Text>Remote Stream</Text>
                    <Text>{remoteStream.toURL()}</Text>
                    <RTCView
                        streamURL={remoteStream.toURL()}
                        style={{ width: 300, height: 300 }}
                        objectFit="cover"
                    />
                </>
            )}
            <Button title="Leave Room" onPress={hangUp} />
        </View>
    )
}
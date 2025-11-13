import React, { useEffect, useMemo, useRef, useState } from "react"
import { Alert, Button, Modal, PermissionsAndroid, Platform, View } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices, RTCView, MediaStream } from 'react-native-webrtc';
import { useChatBoxSectorId, useDomain, useLastMessageId, useToken, useUser } from "../../../store/useStore"
import { refreshAccessToken, sendPendingIssue, emitMessage } from "../../../apis/chat.api"
import { initSocket, socketEmit, url } from "../../../apis/socket"
import { isSameDay } from "../../../utils/isSameDay"
import { createChat } from "../../../utils/createChat"
import AddContacts from "./home/stackScreens/AddContacts"
import AddDomain from "./home/stackScreens/AddDomain"
import AddSector from "./home/stackScreens/AddSector"
import SectorDetail from "./home/stackScreens/SectorDetail"
import ChatBox from "./home/ChatBox"
import ResizableComponent from "./home/stackScreens/ResizableComponent"
import SideComponent from "./home/stackScreens/SideComponent"
import PeerVideoCall from "./home/PeerVideoCall"
const Stack = createNativeStackNavigator()

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // {
        //     urls: 'turn:relay1.expressturn.com:3478',
        //     username: 'efGHklmn',
        //     credential: 'ABC123xyz'
        // }
    ]
}

const userContacts = {
    _id: "ccccccc",
    domain: "Contacts",
    pinned: true,
    settings: {},
    sectors: [
        {
            _id: "ai",
            domain_id: "ccccccc",
            title: "AI",
            status: "private",
            time: Date.now(),
            data: []
        }
    ]
}

function midnightTimestamp() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
}

const getDomain = async () => {
    const { domains, setCurrDomainId, setDomains } = useDomain.getState()
    try {
        const c = await AsyncStorage.getItem("currDomain")
        const p = await AsyncStorage.getItem("pinned")
        const pinned = JSON.parse(p)
        let accessToken = useToken.getState().accessToken
        const httpCall = await fetch(`${url}/chat/domain`, {
            headers: {
                Authorization: "Bearer " + accessToken,
            }
        })
        const res = await httpCall.json()
        if (res.exp) {
            let accessToken_ = await refreshAccessToken()
            if (accessToken_) {
                getDomain()
            }
        } else if (res.success === true) {
            res.domain?.forEach(i => {
                if (pinned?.includes(i._id)) {
                    i.pinned = true
                }
            })
            const existingUserContacts = domains.find(d => d._id === "ccccccc");
            const updatedDomains = await res.domain.map(newDomain => {
                const existingDomain = domains.find(d => d._id === newDomain._id);
                if (!existingDomain) return newDomain
                const existingSectorMap = new Map(existingDomain.sectors.map(sector => [sector._id, sector]));
                const mergedSectors = newDomain.sectors.map(sector => {
                    return existingSectorMap.get(sector._id) || sector;
                });

                return {
                    ...existingDomain,
                    sectors: mergedSectors,
                    logo: newDomain.logo,
                    Settings: newDomain.Settings,
                    link: newDomain.link
                };
            });
            const mergedDomains = [...updatedDomains, existingUserContacts ? existingUserContacts : userContacts]
            setDomains(mergedDomains);
            const foundDomain = res.domain.find(i => i._id === c)
            setCurrDomainId(foundDomain?._id ?? "ccccccc")
            await AsyncStorage.setItem("cacheDomain", JSON.stringify(mergedDomains))
        }
    } catch (err) {
        console.log(err)
    }
}

const getIssuesVoted = async () => {
    const { setUser } = useUser.getState()
    try {
        let accessToken = useToken.getState().accessToken
        const httpCall = await fetch(`${url}/user/issues-voted`, {
            headers: {
                Authorization: "Bearer " + accessToken,
            }
        })
        const res = await httpCall.json()
        if (res.exp) {
            let accessToken_ = await refreshAccessToken()
            if (accessToken_) {
                getIssuesVoted()
            }
        } else if (res.success === true) {
            setUser(prev => ({
                ...prev,
                issues_voted: res.data
            }))
        }
    } catch (err) {

    }
}

let delay = 125
let totalTimeout = 0
const sync = async () => {
    const domains = useDomain.getState().domains
    const notSent = domains.map(
        d => d.sectors
            .map(s => s.data.filter(item => item._id === undefined))
            .filter(ii => ii.length >= 1)
    ).filter(jj => jj.length >= 1)
        .flat(2)
        .sort((a, b) => b.time - a.time)

    for (let i of notSent) {
        let timer;
        const timeout = totalTimeout
        timer = setTimeout(() => {
            emitMessage(i)
        }, timeout);
        delay += 125;
        totalTimeout += delay
    }
}

const addSectorDomain = async (sector) => {
    const setDomains = useDomain.getState().setDomains
    const httpCall = await fetch(`${url}/domain/${sector._id}`, {
        headers: {
            Authorization: "Bearer " + accessToken,
        }
    })
    const res = await httpCall.json()
    if (res.success === true) {
        if (res.data.length >= 1) {
            setDomains(prev => [...res.data, ...prev])
            showSnackBar(`You joined ${sector.title}`)
        } else {
            showSnackBar("can't join this sector")
        }
    }
}

function Main({ navigation, route }) {
    const { domains, setDomains, currDomainId, setCurrDomainId } = useDomain()
    const { chatBoxSectorId, setChatBoxSectorId } = useChatBoxSectorId()
    const [dropVisible, setDropVisible] = useState(false)
    const [chatBoxVisible, setChatBoxVisible] = useState(false)
    const [focusTextInput, setFocusTextInput] = useState(false)
    const [currAudio, setCurrAudio] = useState(null)
    const [currAudioId, setCurrAudioId] = useState("")
    const [allSliders, setAllSliders] = useState({})
    useEffect(() => {
        (async () => {
            try {
                if (domains.length === 0) {
                    const c = await AsyncStorage.getItem("currDomain");
                    const cacheDomainStr = await AsyncStorage.getItem("cacheDomain");
                    const cacheDomain = JSON.parse(cacheDomainStr);
                    setCurrDomainId(c ?? "ccccccc");
                    if (cacheDomain) {
                        setDomains(cacheDomain);
                    }
                }
            } catch (err) {
                console.log("error on Main", err);
            }
        })();

        return () => {
            console.log("unmounted")
        }
    }, [])

    useEffect(() => {
        if (route.params?.openChatBox === true) {
            setChatBoxVisible(true)
        }
    }, [])

    return (
        <>
            <SideComponent
                navigation={navigation}
                dropVisible={dropVisible}
                setDropVisible={setDropVisible}
                chatBoxVisible={chatBoxVisible}
                setChatBoxVisible={setChatBoxVisible}
                setFocusTextInput={setFocusTextInput}
            />
            <ResizableComponent navigation={navigation} />
            {
                chatBoxVisible &&
                <ChatBox navigation={navigation}
                    // route={route}
                    visible={chatBoxVisible}
                    focusTextInput={focusTextInput}
                    onClose={() => {
                        setChatBoxVisible(false)
                        setChatBoxSectorId("");
                        setFocusTextInput(false)
                    }}
                    currAudio={currAudio}
                    setCurrAudio={setCurrAudio}
                    currAudioId={currAudioId}
                    setCurrAudioId={setCurrAudioId}
                    allSliders={allSliders}
                    setAllSliders={setAllSliders}
                />
            }
        </>
    )
}

export default function ChatScreen({ navigation }) {
    const { accessToken } = useToken()
    const { lastSectorMessageId, setLastSectorMessageId } = useLastMessageId()
    const { domains, setDomains, setFetchedSectorIds } = useDomain()
    const { chatBoxSectorId } = useChatBoxSectorId()
    const domain = domains.find(d => d._id === "ccccccc")
    const sectorsInContacts = useMemo(() => {
        return domain?.sectors.map(s => s._id) || [];
    }, [domain]);
    const sectorsRef = useRef(sectorsInContacts);
    const ccd = domains.sort((a, b) => b.createdAt - a.createdAt)
        .find(i => i._id !== "ccccccc")
        ?.sectors.sort((a, b) => b.time - a.time)

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callModalVisible, setCallModalVisible] = useState(false)
    const pc = useRef(null);
    const [didIOffer, setDidIoffer] = useState(false);
    const iceCandidatesQueue = useRef([]);

    async function requestPermissions() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
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
    };

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

        newPc.onerror = () => {
            console.log("an error occured")
        }

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

    const hangUp = () => {
        console.log("hanging up...")
        // setDidIoffer(false)
        // setCallModalVisible(false)
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

        // mediaDevices.getUserMedia({ video: true, audio: true })
        //     .then(tempStream => {
        //         tempStream.getTracks().forEach(track => track.stop());
        //     })
        //     .catch(err => {
        //         console.warn("No active devices to stop", err);
        //     });
    };

    const startCall = () => {
        setDidIoffer(true)
        socketEmit("create-room", "the room")
        setCallModalVisible(true)
    };

    async function downloadFile(url, data, domainId) {
        const path = `${RNFS.DocumentDirectoryPath}/${data.name}`;
        const download = RNFS.downloadFile({
            fromUrl: url,
            toFile: path,
            progress: ({ contentLength, bytesWritten }) => {
                const percent = (bytesWritten / contentLength) * 100;
                console.log(`Downloaded ${percent.toFixed(2)}%`);
            },
            progressDivider: 5,
        });
        try {
            const result = await download.promise;
            if (result.statusCode === 200) {
                setDomains(prev =>
                    prev.map(d => {
                        if (d._id !== domainId) return d
                        return {
                            ...d,
                            sectors: d.sectors.map(s => {
                                if (s._id !== (domainId === "ccccccc" ? data.creator_id : data.sector_id)) return s;
                                return {
                                    ...s,
                                    data: s.data.map(m => {
                                        if (m._id !== data._id) return m;
                                        return {
                                            ...m,
                                            uri: `file://${path}`
                                        }
                                    })
                                };
                            }),
                        };
                    })
                );
            } else {
                console.log(result)
                throw new Error(`Download failed with status ${result.statusCode}`);
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        sectorsRef.current = [...new Set(sectorsInContacts)];
    }, [sectorsInContacts]);

    useEffect(() => {
        requestPermissions()
        async function connect() {
            if (accessToken) {
                console.log("access token available")
            }
            const socket = await initSocket();
            if (!socket.connected) {
                socket.connect()
            }

            // socket.on("test", ({ a }, callback) => {
            //     console.log(a)
            //     // callback("uu")
            // });

            socket.on("join-room", ({ room }) => {
                console.log(`joining ${room} as guest`)
                setCallModalVisible(true)
            });

            socket.on("cancel-call", () => {
                console.log("cancelling call...")
                setCallModalVisible(false)
                setDidIoffer(false)
            });

            socket.on("user-joined", () => {
                console.log("guest joined")
                proceedCall()
            });

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

            socket.on("leave-room", () => {
                hangUp()
            });

            socket.on("connect", async () => {
                console.log("socket connected")
                // console.log(111, ccd)
                await getDomain()
                console.log("lastSectorMessageId:", lastSectorMessageId)
                socket.emit("missedSectorMessages", lastSectorMessageId)
                sync()
            });

            socket.on("ack-message", ({ _id, messageId, sectorId, domainId }) => {
                console.log("ack note")
                setDomains(prev =>
                    prev.map(d => {
                        if (d._id !== domainId) return d
                        return {
                            ...d,
                            sectors: d.sectors.map(s => {
                                if (s._id !== sectorId) return s;
                                return {
                                    ...s,
                                    data: s.data.map(m => {
                                        if (m.id !== messageId) return m;
                                        const { id, domainId, ...rest } = m
                                        return {
                                            ...rest,
                                            _id: _id
                                        }
                                    })
                                };
                            }),
                        };
                    })
                );
                if (domainId !== "ccccccc") {
                    setLastSectorMessageId(_id)
                }
            });

            socket.on("sector-message", ({ data, domainId, time }) => {
                if (data.hasOwnProperty("uri")) {
                    setTimeout(() => {
                        downloadFile(`${url}/files/chat/${data.name}`, data, domainId)
                    }, 2000)
                }
                if (domainId === "ccccccc" && !(sectorsRef.current).includes(data.creator_id)) {
                    createChat(data.creator_number, { ...data, sector_id: data.creator_id })
                } else {
                    setDomains(prev =>
                        prev.map(d => {
                            if (d._id !== domainId) return d
                            return {
                                ...d,
                                time: Date.now(),
                                sectors: d.sectors.map(s => {
                                    if (s._id !== (domainId === "ccccccc" ? data.creator_id : data.sector_id)) return s;
                                    return {
                                        ...s,
                                        time: time,
                                        unread: chatBoxSectorId === s._id ? s?.unread ?? 0 : (s?.unread ?? 0) + 1,
                                        data: [
                                            { ...data, time: Date.now() },
                                            ...(!isSameDay(s.time) ?
                                                [{ _id: Date.now().toString(), dateInfo: new Date(Date.now()).toLocaleDateString(), createdAt: midnightTimestamp() }] : []),
                                            ...(s.data || []),
                                        ]
                                    };
                                }),
                            };
                        })
                    );
                }
                setLastSectorMessageId(data._id)
                if (domainId === "ccccccc") {
                    socket.emit("ackMessage", `${data.creator_id}-${data.sector_id}-${data._id}`)
                }
            });

            socket.on("syncMessages", ({ data }) => {
                if (data.length >= 1) {
                    setDomains(prev =>
                        prev.map(d => ({
                            ...d,
                            sectors: d.sectors.map(s => {
                                const matchingData = data.filter(item => item.sector_id === s._id);
                                if (matchingData.length === 0) return s;
                                return {
                                    ...s,
                                    time: Date.now(),
                                    data: [...matchingData, ...(s.data || [])],
                                };
                            }),
                        }))
                    );
                    console.log("sync completed.")
                }
            });

            socket.on("edit-domain-logo", ({ data, domainId }) => {
                setDomains(prev =>
                    prev.map(d => {
                        if (d._id !== domainId) return d
                        return {
                            ...d,
                            logo: data,
                        };
                    })
                );
            });

            socket.on("new-domain", ({ data }) => {
                console.log(data)
                setDomains(prev => [data, ...prev])
            });

            socket.on("new-sector", ({ data }) => {
                const foundDomain = domains.find(i => i._id === data.domain_id)
                if (foundDomain) {
                    setDomains(prev =>
                        prev.map(d => {
                            if (d._id !== data.domain_id) return d
                            return {
                                ...d,
                                time: Date.now(),
                                sectors: [{ ...data, data: [], time: Date.now() }, ...d.sectors]
                            }
                        })
                    )
                } else {
                    addSectorDomain(data)
                }
            });

            socket.on("connect_error", (err) => {
                if (err.message === "invalid token") {
                    console.log("Token expired or missing");
                    (async () => {
                        await refreshAccessToken();
                    })();
                }
                else {
                    console.log(err);
                    console.log("socket error");
                }
            });

            socket.on("disconnect", (reason) => {
                console.log("ds")
                console.warn('Socket disconnected:', reason);
                setFetchedSectorIds([])
            });
        }
        connect();
    }, []);

    return (
        <>
            <Modal visible={callModalVisible}
                onRequestClose={() => setCallModalVisible(false)}
            >
                <PeerVideoCall
                    localStream={localStream}
                    remoteStream={remoteStream}
                    didIOffer={didIOffer}
                    hangUp={hangUp}
                />
            </Modal>
            {/* <Button title="rrr" onPress={startCall} />
            <Button title="hangup" onPress={hangUp} /> */}
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="main">
                    {(props) => (
                        <Main{...props} />
                    )}
                </Stack.Screen>
                <Stack.Screen name="sectorDetail" component={SectorDetail} options={{}} />
                <Stack.Screen name="addDomain" component={AddDomain} options={{ animation: "slide_from_left" }} />
                <Stack.Screen name="addSector" component={AddSector} options={{ animation: "slide_from_left" }} />
                <Stack.Screen name="addContacts" component={AddContacts} options={{ animation: "fade_from_bottom" }} />
            </Stack.Navigator>
        </>
    )
}



// const pending = await AsyncStorage.getItem("pending")
// const parsed = JSON.parse(pending)
// if (parsed !== null && parsed.state.pending.length >= 1) {
//     // await Promise.all(parsed.state.pending.map(i => sendPendingIssue(i))) //if order does not matter
//     for (const i of parsed.state.pending) {
//         await sendPendingIssue(i)
//     }
// }
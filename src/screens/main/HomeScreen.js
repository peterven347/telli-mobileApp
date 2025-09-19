import React, { useEffect, useMemo, useRef, useState } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { useChatBoxSectorId, useDomain, useToken } from "../../../store/useStore"
import { refreshAccessToken, initSocket } from "../../../utils/https"
import { isSameDay } from "../../../utils/isSameDay"
import { createChat } from "../../../utils/createChat"

import AddContacts from "./home/stackScreens/AddContacts"
import AddDomain from "./home/stackScreens/AddDomain"
import AddSector from "./home/stackScreens/AddSector"
import SectorDetail from "./home/stackScreens/SectorDetail"
import SectorView from "./home/SectorView"
import ResizableComponent from "./home/stackScreens/ResizableComponent"
import SideComponent from "./home/stackScreens/SideComponent"

const Stack = createNativeStackNavigator()

function Main({ navigation, route, domains, setCurrDomainId, setDomains, chatBoxSectorId }) {
    const { setChatBoxSectorId } = useChatBoxSectorId()
    const [dropVisible, setDropVisible] = useState(false)
    const [chatBoxVisible, setChatBoxVisible] = useState(false)

    useEffect(() => {
        (async () => {
            try {
                console.log("getting cached domain");
                const c = await AsyncStorage.getItem("currDomain");
                const cacheDomainStr = await AsyncStorage.getItem("cacheDomain");
                const cacheDomain = JSON.parse(cacheDomainStr);
                setCurrDomainId(c);
                if (cacheDomain && domains.length === 0) {
                    setDomains(cacheDomain);
                }
            } catch (err) {
                console.log("error on Main", err);
            }
        })();
    }, [])

    useEffect(() => {
        if (route.params?.openChatBox === true) {
            setChatBoxVisible(true)
        }
    }, [])

    return (
        <>
            <SideComponent navigation={navigation}
                dropVisible={dropVisible}
                setDropVisible={setDropVisible}
                chatBoxVisible={chatBoxVisible}
                setChatBoxVisible={setChatBoxVisible}
            />
            <ResizableComponent navigation={navigation} />
            {chatBoxVisible &&
                <SectorView navigation={navigation}
                    route={route}
                    visible={chatBoxVisible}
                    onClose={() => {
                        setChatBoxSectorId("");
                        setDomains(prev =>
                            prev.map(d => {
                                return {
                                    ...d,
                                    sectors: d.sectors.map(s => {
                                        if (s._id !== chatBoxSectorId) return s;
                                        return {
                                            ...s,
                                            unread: 0,
                                        };
                                    }),
                                };
                            })
                        );
                        setChatBoxVisible(false)
                    }}
                />}
        </>
    )
}

export default function HomeScreen({ navigation }) {
    const { accessToken } = useToken()
    const { domains, setDomains, setCurrDomainId, setFetchedSectorIds } = useDomain()
    const { chatBoxSectorId } = useChatBoxSectorId()
    const domain = domains.find(d => d._id === "ccccccc")
    const sectorsInContacts = useMemo(() => {
        return domain?.sectors.map(s => s._id) || [];
    }, [domain]);
    const sectorsRef = useRef(sectorsInContacts);

    useEffect(() => {
        sectorsRef.current = sectorsInContacts;
    }, [sectorsInContacts]);

    useEffect(() => {
        async function connect() {
            if (accessToken) {
                console.log("access token available")
            }
            const socket = await initSocket();
            if (!socket.connected) {
                socket.connect()
            }
            socket.on("test", ({ a }, callback) => {
                console.log(a)
                // callback("uu")
            })
            socket.on("connect", async () => {
                console.log("socket connected")
                await getDomain()
                socket.emit("missedNotes")
                sync()
                // await sendPendingVotes()
                getIssuesVoted() //no need, just get as rsponse after vote
            })
            socket.on("dm", ({ data, senderId }) => {
                console.log("DM", (new Date()).toLocaleTimeString(), senderId)
                if ((sectorsRef.current).includes(senderId)) {
                    setDomains(prev =>
                        prev.map(d => {
                            if (d._id !== "ccccccc") return d
                            return {
                                ...d,
                                time: Date.now(),
                                sectors: d.sectors.map(s => {
                                    if (s._id !== senderId) return s;
                                    return {
                                        ...s,
                                        time: Date.now(),
                                        unread: chatBoxSectorId === s._id ? s?.unread ?? 0 : (s?.unread ?? 0) + 1,
                                        data: [
                                            ...(s.data || []),
                                            ...(!isSameDay(s.time) ?
                                                [{ _id: Date.now().toString(), creator_id: "user", note: new Date(Date.now()).toLocaleDateString(), createdAt: ts }] : []),
                                            { ...data, sector_id: senderId, time: Date.now() }
                                        ]
                                    };
                                }),
                            };
                        })
                    );
                } else {
                    createChat(senderId, data)
                }
            })
            socket.on("note", ({ data, domainId }, callback) => {
                console.log("note", (new Date()).toLocaleTimeString())
                // callback(8765)
                setDomains(prev =>
                    prev.map(d => {
                        if (d._id !== domainId) return d
                        return {
                            ...d,
                            time: Date.now(),
                            sectors: d.sectors.map(s => {
                                if (s._id !== data.sector_id) return s;
                                return {
                                    ...s,
                                    time: Date.now(),
                                    unread: chatBoxSectorId === s._id ? s?.unread ?? 0 : (s?.unread ?? 0) + 1,
                                    data: [
                                        ...(s.data || []),
                                        ...(!isSameDay(s.time) ?
                                            [{ _id: Date.now().toString(), creator_id: "user", note: new Date(Date.now()).toLocaleDateString(), createdAt: ts }] : []),
                                        { ...data, time: Date.now() }
                                    ]
                                };
                            }),
                        };
                    })
                );
            })
            socket.on("syncNotes", ({ data }) => {
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
            })
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
            })
            socket.on("new-domain", ({ data }) => {
                console.log(data)
                setDomains(prev => [data, ...prev])
            })
            socket.on("new-sector", ({ data }) => {
                const foundDomain = domains.find(i => i._id === data.domain_id)
                if (foundDomain) {
                    setDomains(prev =>
                        prev.map(d => {
                            if (d._id !== data.domain_id) return d
                            return {
                                ...d,
                                sectors: [{ ...data, data: [], time: Date.now() }, ...d.sectors]
                            }
                        })
                    )
                } else {
                    addSectorDomain(data)
                }
            })
            socket.on("connect_error", (err) => {
                if (err.message === "invalid") {
                    console.log("Token expired or missing");
                    (async () => {
                        await refreshAccessToken();
                    })();
                }
                else {
                    // console.log(err);
                    // console.log("socket error");
                }
            })
            socket.on("disconnect", (reason) => {
                console.log("ds")
                console.warn('Socket disconnected:', reason);
                setFetchedSectorIds([])
            })
        }
        connect();
        return () => {
            console.log("unmounted")
        }
    }, []);

    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="main">
                    {(props) => (
                        <Main
                            {...props}
                            domains={domains}
                            setDomains={setDomains}
                            setCurrDomainId={setCurrDomainId}
                            chatBoxSectorId={chatBoxSectorId}
                            setFetchedSectorIds={setFetchedSectorIds}
                        />
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
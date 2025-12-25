import React, { } from 'react';
import { View, Button, Text, Image, StyleSheet } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { socketEmit, url } from "../../../../apis/socket"
import Mci from "react-native-vector-icons/MaterialCommunityIcons"


export default function PeerVideoCall({ localStream, remoteStream, didIOffer, hangUp }) {
    const handleCallCancel = () => {
        if (remoteStream) {
            socketEmit("leave-room", "the room")
            hangUp()
        } else if (didIOffer) {
            socketEmit("cancel-call", "the room")
            hangUp()
        } else {
            socketEmit("ignore-call", "the room")
            hangUp()
        }
    }

    return (
        <>
        <Text>{remoteStream? "active" : "not"}</Text>
            {
                remoteStream ?
                    <View style={{}}>
                        {localStream && (
                            <>
                                <RTCView
                                    streamURL={localStream.toURL()}
                                    style={{ width: 150, height: 200, position: "absolute", zIndex: 1 }}
                                    objectFit="cover"
                                    mirror={false}
                                />
                            </>
                        )}
                        <RTCView
                            streamURL={remoteStream.toURL()}
                            style={{ width: "100%", height: "100%" }}
                            objectFit="cover"
                        />
                        <View style={[styles.hangUpBtn, { position: "absolute", zIndex: 1, bottom: 60, alignSelf: "center" }]}>
                            <Mci name="phone" size={24} color="#f00" onPress={handleCallCancel} style={{}} />
                        </View>
                    </View>
                    :
                    <View style={styles.container}>
                        <View style={styles.going}>
                            <Text style={{ color: "#fff" }}>{didIOffer ? "outgoing" : "incoming"}</Text>
                            <Mci name="phone-outline" />
                        </View>

                        <View style={{ alignItems: "center" }}>
                            <Image
                                source={{
                                    uri: `${url}/api/user/img-file/domainImg/1756169590246-try-1001724403.jpg`,
                                    headers: { Authorization: "Bearer " + "accessToken" }
                                }}
                                style={styles.image}
                            />
                            <Text style={{ color: "#fff" }}>Peter</Text>
                            {/* <Image source={{ uri: `${url}/files/domainLogo/1759321988042-B-1000098091.jpg`, headers: { Authorization: "Bearer " + "accessToken" } }} style={styles.image} /> */}
                        </View>
                        <View style={styles.btns}>
                            <View style={styles.hangUpBtn}>
                                <Mci name="phone" size={24} color="#f00" onPress={handleCallCancel} />
                            </View>
                            {didIOffer === false && <View style={styles.pickBtn}>
                                <Mci name="phone" size={24} color="#0f0" style={{ transform: [{ scaleX: -1 }] }} onPress={() => { socketEmit("join-room", "the room") }} />
                            </View>}
                        </View>
                    </View>
            }
        </>
    )
}

const styles = StyleSheet.create({
    btns: {
        flexDirection: "row",
        columnGap: 160,
        alignItems: "center",
    },
    container: {
        flex: 1,
        backgroundColor: "#061432ff",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 70,
        justifyContent: "space-between"
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#ccc",
    },
    going: {
        flexDirection: "row",
        columnGap: 8,
        alignItems: "center",
    },
    hangUpBtn: {
        backgroundColor: "rgba(240, 123, 123, 1)",
        borderRadius: 25,
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center"
    },
    pickBtn: {
        backgroundColor: "rgba(205, 236, 205, 1)",
        borderRadius: 40,
        width: 80,
        height: 80,
        alignItems: "center",
        justifyContent: "center"
    }
})
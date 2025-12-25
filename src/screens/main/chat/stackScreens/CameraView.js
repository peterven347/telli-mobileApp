import React, { useRef, useState } from "react"
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Camera, useCameraDevice } from "react-native-vision-camera"
import Mci from "react-native-vector-icons/MaterialCommunityIcons"
import Fa6 from "react-native-vector-icons/FontAwesome6"

export default function CameraView({ setFiles, close }) {
    const camera = useRef(null)
    const [camSide, setCamSide] = useState("back")
    const device = useCameraDevice(camSide);
    const rotateCamera = () => {
        if (camSide === "back") {
            setCamSide("front")
        } else {
            setCamSide("back")
        }
    }

    const capture = async () => {
        const photo = await camera.current?.takePhoto()
        setFiles(prev => [...prev, {...photo, type: "image/jpeg"}]);
        close()
    }

    return (
        <>
            <Mci name="close" size={28} color="#fff" style={styles.closeBtn} onPress={close} />
            <View style={styles.container}>
                <Pressable style={styles.iconView} onPress={rotateCamera}>
                    <Fa6 name="camera-rotate" size={20} color="#fff" />
                </Pressable>
                <Pressable style={styles.iconView} onPress={rotateCamera}>
                    <Fa6 name="camera-rotate" size={20} color="#fff" />
                </Pressable>
                <Pressable style={styles.iconView} onPress={rotateCamera}>
                    <Fa6 name="camera-rotate" size={20} color="#fff" />
                </Pressable>
            </View>
            <View style={styles.cameraBtn}>
                <TouchableOpacity style={styles.innerCameraBtn} onPress={capture} />
            </View>
            <Camera
                ref={camera}
                style={{ flex: 1 }}
                device={device}
                photo={true}
                isActive={true}
            />
        </>
    )
}

const styles = StyleSheet.create({
    cameraBtn: {
        width: 80,
        height: 80,
        position: "absolute",
        bottom: 40, zIndex: 1,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: "#66b",
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center"
    },
    closeBtn: {
        position: "absolute",
        zIndex: 1,
        left: 16,
        top: 30
    },
    container: {
        position: "absolute",
        top: 30,
        right: 16,
        zIndex: 1,
        rowGap: 12
    },
    iconView: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#fff2",
        alignItems: "center",
        justifyContent: "center"
    },
    innerCameraBtn: {
        width: 80,
        height: 80,
        backgroundColor: "#fff",
        borderRadius: 60
    }
})
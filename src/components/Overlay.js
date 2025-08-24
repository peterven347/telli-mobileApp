import React from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"

export default function Overlay() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#66b" style={{alignSelf: "center"}}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        flex: 1,
        backgroundColor: "#0002",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        zIndex: 2
    }
})
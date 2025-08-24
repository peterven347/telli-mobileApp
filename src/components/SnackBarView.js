import React, { useEffect } from "react"
import { Animated, StyleSheet, Text, useAnimatedValue } from "react-native"
import { useSnackBar } from "../../store/useStore"

export default function SnackBarView() {
    const { snackBar } = useSnackBar()
    const translateY = useAnimatedValue(70)
    useEffect(() => {
        if (snackBar.visible) {
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(translateY, {
                toValue: 70,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [snackBar.visible])

    return (
        snackBar.visible &&
        <Animated.View style={[styles.snackBar, { transform: [{ translateY }] }]}>
            <Text style={{ textAlign: "center", color: "#111", fontWeight: "bold" }}>{snackBar.text}</Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    snackBar: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 60,
    }
})
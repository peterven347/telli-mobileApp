import React, { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { keepLocalCopy, pick, types } from '@react-native-documents/picker'
import Mci from "react-native-vector-icons/MaterialCommunityIcons";

export default function ExpandableInput({ navigation, textInput, focusTextInput, setTextInput, setFiles, setCameraOn }) {
    const [expanded, setExpanded] = useState(false);
    const height = useSharedValue(0);
    const keyboardOffset = useSharedValue(0);
    const textInputFocus = useRef(null)

    const toggleExpand = () => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        height.value = withTiming(newExpanded ? 70 : 0, { duration: 250 });
    };

    const expandStyle = useAnimatedStyle(() => ({
        height: height.value,
    }));

    const moveUpStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: -keyboardOffset.value }],
    }));

    const pickFiles = async (mode, type) => {
        try {
            Keyboard.dismiss()
            toggleExpand()
            const files = await pick({
                mode: mode,
                requestLongTermAccess: true,
                allowMultiSelection: true,
                type: type
            })
            const localCopies = await keepLocalCopy({
                files: files.map(f => ({
                    uri: f.uri,
                    fileName: f.name ?? 'Telli' + Date.now(),
                })),
                destination: 'documentDirectory',
            });
            const localWithMetadata = localCopies.map((copy, i) => ({
                ...copy,
                type: files[i].type ?? null,
                name: files[i].name,
                size: files[i].size,
            }));
            // console.log(files[0].uri)
            // console.log(localCopies[0])
            // console.log(localWithMetadata[0])

            setFiles(prev => {
                const combined = [...prev, ...localWithMetadata];
                const unique = Array.from(new Map(combined.map(f => [f.sourceUri, f])).values());
                return unique;
            });

        } catch (err) {
            console.log(err)
        }
    };

    useEffect(() => {
        console.log(focusTextInput)
        setTimeout(() => {
            focusTextInput && textInputFocus.current?.focus()
        }, 1);
    }, []);

    return (
        <Animated.View style={[styles.wrapper, moveUpStyle]}>
            <Animated.View style={expandStyle}>
                <View style={styles.iconInner}>
                    <Mci name="camera-outline" size={24} color="grey" onPress={() => { Keyboard.dismiss(); toggleExpand(); setCameraOn() }} />
                    <Mci name="image-outline" size={24} color="grey" onPress={() => { pickFiles("import", [types.images, types.video]) }} />
                    <Mci name="attachment" size={24} color="grey" onPress={() => { pickFiles("open", [types.allFiles]) }} />
                </View>
            </Animated.View>

            <TouchableOpacity hitSlop={10} style={styles.mediaIcon} onPress={toggleExpand}>
                <Mci name="dots-vertical-circle-outline" size={26} color="grey" />
            </TouchableOpacity>

            <TextInput
                multiline
                ref={textInputFocus}
                placeholder="Type a message..."
                placeholderTextColor="#ccc"
                value={textInput}
                style={styles.input}
                onChangeText={setTextInput}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "86%",
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
    },
    iconInner: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: "100%",
    },
    input: {
        maxHeight: 150,
        paddingStart: 48,
    },
    mediaIcon: {
        backgroundColor: "#fafafa",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        width: 40,
        position: "absolute",
        bottom: 0,
        start: 1,
        zIndex: 1,
    },
});

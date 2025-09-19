import React, { useEffect } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, useAnimatedValue } from 'react-native';
import Oct from "react-native-vector-icons/Octicons"

const Dropdown = ({ dropVisible, setDropVisible, dropDSectorId, setDropDSectorId, data }) => {
    const dropdownAnim = useAnimatedValue(0)

    useEffect(() => {
        if (dropVisible) {
            Animated.timing(dropdownAnim, {
                toValue: 1,
                duration: 220,
                useNativeDriver: false
            }).start()
        } else {
            Animated.timing(dropdownAnim, {
                toValue: 0,
                duration: 220,
                useNativeDriver: false
            }).start();
        }
    }, [dropVisible])

    const dropdownHeight = dropdownAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Math.min((data?.length + 1) * 38, 300)],
    })
    return (
        <Pressable hitSlop={3} onPress={() => setDropVisible(true)}>
            <Oct name="triangle-down" size={24} color="#444" width={24} style={{ textAlign: "center" }} />
            {dropVisible &&
                <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
                    <Text style={{ ...styles.allSector, backgroundColor: "#333" }} onPress={() => { setDropDSectorId(""); setDropVisible(false) }}>select</Text>
                    <ScrollView showsVerticalScrollIndicator={false} >
                        {
                            data.map((i, index) =>
                                <TouchableOpacity key={i._id} onPress={() => { setDropDSectorId(i._id); setDropVisible(false) }}>
                                    <Text numberOfLines={1} style={{ padding: 10, marginBottom: 2, color: "#eee", fontWeight: 500, backgroundColor: dropDSectorId === i._id ? "#444" : "" }}>
                                        {i.title}
                                    </Text>
                                </TouchableOpacity>
                            )}
                    </ScrollView>
                </Animated.View>
            }
        </Pressable>
    );
};

const styles = StyleSheet.create({
    allSector: {
        borderBottomWidth: 0.5,
        paddingVertical: 7.5,
        fontWeight: 500,
        textAlign: "center",
        color: "#eee",
        borderBottomColor: "#eee",
    },
    dropdown: {
        position: 'absolute',
        top: "10%",
        end: "30%",
        backgroundColor: '#444d',
        borderRadius: 2,
        width: 76,
        // overflow: "hidden"
    },
});

export default Dropdown;

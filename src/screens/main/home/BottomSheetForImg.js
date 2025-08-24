import React, { useEffect, useRef, } from "react";
import { BackHandler, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { useDomainImg } from "../../../../store/useStore"
import Ant from "react-native-vector-icons/AntDesign";
import Sli from "react-native-vector-icons/SimpleLineIcons";

export default function ButtomSheetForImg({bottomSheetRef}) {
    const indexRef = useRef(null);
    const {setImageUri} = useDomainImg()

    useEffect(() => {
        const backAction = () => {
            if (indexRef?.current !== null && indexRef?.current !== -1) {
                bottomSheetRef.current.close()
                return true;
            }else {
                return false
            }
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    const openCamera = () => {
        const options = {
            mediaType: "photo",
        }
        launchCamera(options, (response) => {
            if (response.didCancel) return
            else if (response.errorCode) return
            else {
                setImageUri({fileName: response.assets[0].fileName, type: response.assets[0].type, uri: response.assets[0].uri});
            }
            bottomSheetRef.current.close()
        })
    }
    const openGallery = () => {
        const options = {
            mediaType: "photo",
            selectionLimit: 1,
        }
        launchImageLibrary(options, (response) => {
            if (response.didCancel) return
            else if (response.errorCode) return
            else {
                setImageUri({fileName: response.assets[0].fileName, type: response.assets[0].type, uri: response.assets[0].uri});
            }
            bottomSheetRef.current.forceClose()
        })
    }

    return(
        <View>
            <View style={styles.titleView}>
                <Text style={styles.title}>Select domain image</Text>
            </View>
            <Pressable style={styles.pressables} onPress={openCamera}>
                <View style={styles.iconBg}>
                    <Sli name="camera" size={20} color="#119"/>
                </View>
                <Text style={styles.text}>Take a photo</Text>
            </Pressable>
            <Pressable style={styles.pressables} onPress={openGallery}>
                <View style={styles.iconBg}>
                    <Ant name="picture" size={21} color="#119"/>
                </View>
                <Text style={styles.text}>Select from gallery</Text>
            </Pressable>
            <TouchableOpacity activeOpacity={0.8} style={[styles.pressables, styles.cancel]} onPress={() => bottomSheetRef.current.close()}>
                <Text style={styles.text}>Cancel</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    cancel: {
        height: 50,
        paddingEnd: 12,
        marginTop: 40,
        backgroundColor: "#cccd",
        justifyContent: "center",
    },
    iconBg: {
        width: 40, 
        height: 40,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#44b6"
    },
    pressables: {
        width: "90%",
        height: 70,
        borderWidth: 0.5,
        borderRadius: 10,
        columnGap: 12,
        paddingStart: 12,
        marginBottom: 12,
        borderColor: "#bbb",
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#fff",
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#444"
    },
    title: {
        color: "#999",
        fontWeight: "500",
    },
    titleView: {
        width: "90%",
        marginBottom: 6,
        alignSelf: "center"
    }
})
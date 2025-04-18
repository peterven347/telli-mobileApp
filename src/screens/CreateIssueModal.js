import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {Alert, Dimensions, Image, Keyboard, Modal, StyleSheet, Text, Pressable, View, FlatList, ScrollView} from 'react-native';
import { Button, Divider, Snackbar, TextInput } from 'react-native-paper';
import {launchCamera, launchImageLibrary} from "react-native-image-picker";
import Ant from "react-native-vector-icons/AntDesign";
import Mci from "react-native-vector-icons/MaterialCommunityIcons";
import Oct from "react-native-vector-icons/Octicons";
import Sli from "react-native-vector-icons/SimpleLineIcons";
import { useModal } from "../../store/useStore";

const { height } = Dimensions.get("window")
export default function CreateIssueModal({title}) {
    const { modalVisible, setModalVisible } = useModal()
    const [imageData, setImageData] = useState([])
    const [textInput, setTextInput] = useState("")
    const [snackBarVisible, setSnackBarVisible] = useState(false);

    const onDismissSnackBar = () => setSnackBarVisible(false);

    const openCamera = () => {
        if (imageData.length >= 4) {
            setSnackBarVisible(true)
            return
        }
        const options = {
            mediaType: "photo",
        }
        launchCamera(options, (response) => {
            if (response.didCancel) return
            else if (response.errorCode) return
            else {
                setImageData(prev => prev.concat(response.assets));
            }
        })
        Keyboard.isVisible() && Keyboard.dismiss()
    };

    const openGallery = () => {
        if (imageData.length >= 4) {
            setSnackBarVisible(true)
            return
        }
        const options = {
            mediaType: "photo",
            selectionLimit: 4 - imageData.length,
        }
        launchImageLibrary(options, (response) => {
            if (response.didCancel) return
            else if (response.errorCode) return
            else {
                setImageData(prev => prev.concat(response.assets.map(i => ({
                    fileName: i.fileName,
                    uri: i.uri,
                }))))
            }
        })
        Keyboard.isVisible() && Keyboard.dismiss()
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {
            // Alert.alert('Modal has been closed.');
            setModalVisible(false)
            }}>
            <View style={styles.modalView}>
                <View style={styles.header}>
                    <Mci name="window-close" size={26} color="#888" onPress={() => {setModalVisible(false); setImageData([])}}/>
                    <Button
                        icon={() => <Oct name="check" size={24} color="#444" style={{marginLeft: 20}}/>}
                        mode="contained"
                    />
                </View>
                <Divider/>
                <ScrollView>
                    <Text style={{paddingStart: 16}}>{title}</Text>
                    <TextInput
                        label={``}
                        placeholder='Write here'
                        value={textInput}
                        textColor="#000b"
                        mode="outlined"
                        maxLength={2000}
                        multiline={true}
                        // dense={true}
                        outlineStyle={styles.outlineStyle}
                        // style={[styles.textInputStyle]}
                        style={[styles.textInputStyle, { height: Keyboard.isVisible() ? 270 : height }]}
                        onChangeText={setTextInput}
                    />
                </ScrollView>
                <View style={styles.imgContainer}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={imageData}
                        keyExtractor={item => item.fileName + Math.random()}
                        renderItem={({item}) => (
                            <>
                                <Image style={styles.img} source={{uri: item.uri}} resizeMode="cover"/>
                                <Mci name="window-close" size={24} color="#444" style={styles.rmImg}
                                    onPress={() => {setImageData(prev => prev.filter(i => i.uri !== item.uri))}}
                                />
                            </>
                        )}
                    />
                </View>
            </View>
            <Snackbar
                visible={snackBarVisible}
                duration={1000}
                onDismiss={onDismissSnackBar}
                wrapperStyle={{width: "80%", alignSelf: "center", marginBottom: 50}}
                style={{backgroundColor: "#eeec", paddingStart: "23%"}}
            >
                Allows max. 4 pictures
            </Snackbar>
            <View style={styles.bottomView}>
                <Sli name="camera" size={28} onPress={openCamera}/>
                <Ant name="picture" size={29} onPress={openGallery}/>
            </View>
        </Modal>
        );
};

const styles = StyleSheet.create({
    bottomView: {
        width: "100%",
        height: 56,
        paddingStart: 12,
        columnGap: 32,
        borderTopWidth: 1,
        marginTop: 4,
        flexDirection: "row",
        alignItems: "center",
        borderTopColor: "#ccc",
    },
    header: {
        height: 56,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    img: {
        width: 130,
        height: 200,
        borderRadius: 16,
        marginHorizontal: 2
    },
    imgContainer: {
        marginTop: "auto",
        paddingHorizontal: 8,
    },
    modalView: {
        flex: 1,
        backgroundColor: "",
    },
    outlineStyle: {
        borderWidth: 0,
        backgroundColor: "",
        alignSelf: "center"
    },
    rmImg: {
        position: "absolute",
        right: 7,
        top: 5

    },
    textInputStyle: {
        // height: height,
        width: "94%",
        marginTop: 8,
        marginBottom: 200,
        alignSelf: "center",
        color: "blue",
    }
});
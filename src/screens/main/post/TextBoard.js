import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { Button, TextInput } from 'react-native-paper';
import Ant from "react-native-vector-icons/AntDesign";
import Mci from "react-native-vector-icons/MaterialCommunityIcons";
import Oct from "react-native-vector-icons/Octicons";
import Sli from "react-native-vector-icons/SimpleLineIcons";
import { useCreatePost } from "../../../../apis/post.api";
import showSnackBar from '../../../../utils/snackBar';

export default function TextBoard({ _id, navigation }) {
    const { mutate, isLoading, isSuccess, isError } = useCreatePost();
    const [imageData, setImageData] = useState([])
    const [textInput, setTextInput] = useState("")
    const inputRef = useRef(null);


    const cc = () => {
        if (!textInput.trim() && imageData.length === 0) return;

        if (!isLoading) {
            Keyboard.dismiss();
            mutate(
                { text: textInput, images: imageData },
                {
                    onSuccess: () => {
                        navigation.goBack();
                        showSnackBar('Post uploaded');
                    },
                    onError: () => {
                        showSnackBar('An error occurred');
                    },
                }
            );
        }
    };

    const openCamera = () => {
        if (imageData.length >= 4) {
            showSnackBar("Allows max. 4 pictures")
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
            showSnackBar("Allows max. 4 pictures")
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
                if (imageData.some(obj1 => response.assets.some(obj2 => obj2.fileName === obj1.fileName))) { //.uri gets updated
                    showSnackBar("Image already selected")
                    return
                }
                setImageData(prev => prev.concat(response.assets.map(i => ({
                    fileName: i.fileName,
                    uri: i.uri,
                    type: i.type
                }))))
            }
        })
        Keyboard.dismiss()
    };

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.header}>
                <Pressable hitSlop={4} onPress={() => { navigation.goBack() }} >
                    <Mci name="window-close" size={26} color="#888" />
                </Pressable>
                <Button
                    icon={() => <Oct name="check" size={24} color="#444" />}
                    mode="contained" loading={isLoading}
                    style={{ paddingStart: 20, backgroundColor: isLoading ? "#66d4" : "#66dc" }}
                    onPress={cc}
                />
            </View>
            <View style={{ flex: 1 }}>
                <TextInput
                    value={textInput}
                    placeholder='Write here'
                    mode="outlined"
                    multiline={true}
                    ref={inputRef}
                    textColor='#444'
                    onChangeText={(e) => setTextInput(e)}
                    outlineStyle={{ borderWidth: 0, borderRadius: 0 }}
                    style={{ backgroundColor: "#fff", paddingBottom: 14 }}
                />
            </View>
            <View style={styles.imgContainer}>
                <FlatList
                    horizontal
                    keyboardShouldPersistTaps="always"
                    showsHorizontalScrollIndicator={false}
                    data={imageData}
                    keyExtractor={item => item.fileName + Math.random()}
                    renderItem={({ item }) => (
                        <>
                            <Image style={styles.img} source={{ uri: item.uri }} resizeMode="cover" />
                            <Mci name="window-close" size={24} color="#444" style={styles.rmImg}
                                onPress={() => { setImageData(prev => prev.filter(i => i.uri !== item.uri)) }}
                            />
                        </>
                    )}
                />
                <View style={styles.bottomView}>
                    <Sli name="camera" size={28} onPress={openCamera} />
                    <Ant name="picture" size={28} color="#333" onPress={openGallery} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomView: {
        width: "100%",
        height: 56,
        paddingEnd: 14,
        columnGap: 32,
        flexDirection: "row-reverse",
        alignItems: "flex-end",
    },
    header: {
        height: 56,
        paddingHorizontal: 12,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    img: {
        width: 130,
        height: 200,
        borderRadius: 16,
        marginHorizontal: 2,
    },
    imgContainer: {
        paddingHorizontal: 8,
        marginTop: "auto",
        marginBottom: 8
    },
    rmImg: {
        position: "absolute",
        right: 7,
        top: 5
    },
});
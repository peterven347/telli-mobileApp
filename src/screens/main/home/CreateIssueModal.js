import React, { useState } from 'react';
import { Dimensions, Image, Keyboard, Modal, StyleSheet, Text, View, FlatList } from 'react-native';
import { Button, Divider, Snackbar, TextInput } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { useDomain, usePending, useToken } from "../../../../store/useStore";
import { refreshAccessToken } from '../../../../utils/refreshAccessToken';
import { url } from '../../../../utils/https';
import Ant from "react-native-vector-icons/AntDesign";
import Mci from "react-native-vector-icons/MaterialCommunityIcons";
import Oct from "react-native-vector-icons/Octicons";
import Sli from "react-native-vector-icons/SimpleLineIcons";
import showSnackBar from '../../../../utils/SnackBar';
import SnackBarView from '../../../components/SnackBarView';

const { height } = Dimensions.get("window")
export default function CreateIssueModal({ title, _id, sectorId, issueModalVisible, setIssueModalVisible }) {
    const { setDomains } = useDomain()
    const { pending, setPending } = usePending()
    const [imageData, setImageData] = useState([])
    const [textInput, setTextInput] = useState("")
    const [loading, setLoading] = useState(false)

    const createIssue = async () => {
        const formData = new FormData()
        formData.append("note", textInput)
        imageData.forEach((i) => {
            formData.append("files", {
                uri: i.uri,
                type: i.type,
                name: "_id" + "-" + i.fileName
            })
        })
        // imageData.forEach((i, index) => {
        //     if (i.uri && typeof i.uri === "string") {
        //         formData.append("files", {
        //             uri: i.uri,
        //             type: i.type || "application/octet-stream",
        //             name: `_id-${i.fileName || `photo-${index}.jpg`}`
        //         });
        //     } else {
        //         console.warn("Skipping invalid image:", i);
        //     }
        // });


        if (!textInput) {
            return showSnackBar("add note")
        }
        if (!loading) {
            setLoading(true)
            try {
                let accessToken = useToken.getState().accessToken
                const httpCall = await fetch(`${url}/issue/${sectorId}`, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                    },
                    method: "POST",
                    body: formData
                })
                const res = await httpCall.json()
                if (res.exp) {
                    let accessToken_ = await refreshAccessToken()
                    if (accessToken_) {
                        createIssue()
                    } else {
                        console.log("repeat")
                    }
                } else if (res.success === false) {
                    showSnackBar("an error occured")
                }
                // socket function (note) handling "true" case
            } catch (err) {
                console.log(err)
                if (err.message === "Network request failed") {
                    const genId = () => Math.random().toString()
                    const id = genId()
                    setPending({ id: id, domainId: _id, sectorId: sectorId, note: textInput, pictures: imageData })
                    setDomains(prev =>
                        prev.map(d => {
                            if (d._id !== _id) return d
                            return {
                                ...d,
                                sectors: d.sectors.map(s => {
                                    if (s._id !== sectorId) return s;
                                    return {
                                        ...s,
                                        time: Date.now(),
                                        data: [{ id: id, note: textInput, pictures: imageData.map(i => i.uri) }, ...(s.data || [])],
                                    };
                                }),
                            };
                        })
                    );
                }
            } finally {
                setLoading(false)
                setTextInput("")
                setIssueModalVisible(false)
                setImageData([])
            }
        }
    }

    const openCamera = () => {
        if (imageData.length >= 4) {
            // setSnackBarVisible(true)
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
            // setSnackBarVisible(true)
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
        Keyboard.isVisible() && Keyboard.dismiss()
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={issueModalVisible}
            onRequestClose={() => {
                setIssueModalVisible(false)
            }}
        >
            <View style={styles.header}>
                <Mci name="window-close" size={26} color="#888" onPress={() => { setIssueModalVisible(false); setImageData([]) }} />
                <Button
                    icon={() => <Oct name="check" size={24} color="#444" onPress={createIssue} />}
                    mode="contained" loading={loading}
                    style={{ paddingStart: 20, backgroundColor: loading ? "#66d4" : "#66dc" }}
                />
            </View>
            <Divider />
            <Text style={{ paddingStart: 16, fontWeight: "bold" }}>{title}</Text>
            <View style={{ maxHeight: height - 270 }}>
                <TextInput
                    value={textInput}
                    placeholder='Write here'
                    mode="outlined"
                    multiline={true}
                    textColor='#444'
                    onChangeText={(e) => setTextInput(e)}
                    outlineStyle={{ borderWidth: 0 }}
                    style={{ backgroundColor: "#fff", height: (height - 280) * 0.9, paddingTop: 8, borderWidth: 0 }}
                />
            </View>
            <FlatList
                removeClippedSubviews={false}
                style={styles.imgContainer}
                horizontal
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
            <View style={{ zIndex: 1, width: "70%", alignSelf: "center", }}>
                <SnackBarView />
            </View>
            <View style={styles.bottomView}>
                <Sli name="camera" size={28} onPress={openCamera} />
                <Ant name="picture" size={28} color="#333" onPress={openGallery} />
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
        paddingHorizontal: 8,
    },
    rmImg: {
        position: "absolute",
        right: 7,
        top: 5
    },
});
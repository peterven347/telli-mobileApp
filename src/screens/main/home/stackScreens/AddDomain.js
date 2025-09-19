import React, { useCallback, useEffect, useRef, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import Mci from 'react-native-vector-icons/MaterialCommunityIcons';
import Ion from 'react-native-vector-icons/Ionicons';
import { BackHandler, Image, Keyboard, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RadioButton, TextInput } from 'react-native-paper';
import { Easing } from 'react-native-reanimated';
import { useDelegateContact, useDomain, useDomainImg, useToken, useUser } from "../../../../../store/useStore";
import { refreshAccessToken, url } from "../../../../../utils/https"
import showSnackBar from '../../../../../utils/snackBar';
import BottomSheetForImg from '../BottomSheetForImg';
import SectorData from '../../../../components/SectorData';

const emailRegex = /^(?=.{1,256}$)(?=.{1,64}@.{1,255}$)(?=[^@]+@[^@]+\.[a-zA-Z]{2,63}$)^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function AddDomain({ navigation }) {
    const bottomSheetRef = useRef(null);
    const indexRef = useRef(null)
    const { domains, setDomains, setCurrDomainId } = useDomain()
    const { imageUri, setImageUri } = useDomainImg()
    const { accessToken } = useToken()
    const { user } = useUser()
    const { selected } = useDelegateContact()
    const [checked, setChecked] = useState("public")
    const [domainName, setDomainName] = useState("")
    const [sectorName, setSectorName] = useState("")

    const [delegates, setDelegates] = useState([{ id: 1, email: "", res: "" }]);

    useEffect(() => {
        const backAction = () => {
            if (indexRef.current == 1) {
                bottomSheetRef.current?.close();
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress', backAction
        );

        return () => backHandler.remove();
    }, []);

    const createDomain = async () => {
        Keyboard.dismiss()
        if (!domainName || ! sectorName) {
            showSnackBar("Incomplete Data")
            return
        }
        const formData = new FormData()
        formData.append("domainName", domainName)
        formData.append("status", checked)
        formData.append("title", sectorName)
        formData.append("delegates",
            [...new Set(delegates.map(i => i.email).filter(email => email && email !== user.email && emailRegex.test(email)))].join(",")
            + "," + [...new Set(selected.map(i => i.phoneNumbers).flat())].join(","))
        if (imageUri.uri) {
            formData.append("file", {
                uri: imageUri.uri,
                type: imageUri.type,
                name: domainName + "-" + imageUri.fileName
            })
        }
        const httpCall = await fetch(`${url}/domain`, {
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
                createDomain()
            }
        } else if (res.success === false) {
            showSnackBar(res.message)
        } else if (res.success === true) {
            setDomains(prev => [res.data, ...prev])
            setCurrDomainId(res.data._id)
            setDelegates([{ id: 1, email: "", res: "" }])
            setSectorName("")
            setDomainName("")
            setImageUri("")
            navigation.navigate("main")
        }
    }

    const handleSheetChanges = useCallback((index) => {
        indexRef.current = index;
    }, []);

    const showBottomSheet = () => {
        if (Keyboard.isVisible()) {
            Keyboard.dismiss()
            setTimeout(() => {
                bottomSheetRef
                    .current.snapToIndex(1, {
                        duration: 200,
                        easing: Easing.out(Easing.ease)
                    })
            }, 370)
        } else {
            bottomSheetRef
                .current.snapToIndex(1, {
                    duration: 200,
                    easing: Easing.out(Easing.ease)
                })
        }
    };

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
            />
        ), []);

    return (
        <View style={{ backgroundColor: "#fff", flex: 1 }}>
            <View style={styles.container}>
                <Mci
                    name="warehouse"
                    color='#339'
                    size={26}
                    marginTop={10}
                    marginStart={4}
                />
                <TextInput
                    placeholder="Domain Name"
                    value={domainName}
                    textColor="#000b"
                    mode="outlined"
                    maxLength={100}
                    multiline={false}
                    outlineStyle={{ borderWidth: 0, borderBottomWidth: 1, marginBottom: 10 }}
                    style={{ width: "80%", backgroundColor: "#fff", marginTop: 8 }}
                    onChangeText={setDomainName}
                />
            </View>
            <View style={{ flexDirection: "row", columnGap: 69, marginBottom: 18 }}>
                <RadioButton.Item
                    label="public"
                    value="public"
                    status={checked === "public" ? "checked" : "unchecked"}
                    color='#339'
                    rippleColor="#fff"
                    labelStyle={{ color: "#333" }}
                    position='leading'
                    onPress={() => setChecked("public")}
                />
                <RadioButton.Item
                    label="private"
                    value="private"
                    status={checked === "private" ? "checked" : "unchecked"}
                    color='#339'
                    rippleColor="#fff"
                    labelStyle={{ color: "#333" }}
                    position='leading'
                    onPress={() => setChecked("private")}
                />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", columnGap: 3 }}>
                <Pressable style={styles.imgView} onPress={() => showBottomSheet()}>
                    {
                        imageUri.uri ? <Image source={{ uri: imageUri.uri }} width={100} height={100} style={{ borderRadius: 4 }} /> :
                            <Mci name="plus" size={26} color="#666" />
                    }
                </Pressable>
                {
                    imageUri.uri ?
                        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => setImageUri("")}>
                            <Text style={{ fontWeight: "500", color: "#999" }}>delete image</Text>
                            <Mci name="delete-outline" size={22} color="#f009" />
                        </TouchableOpacity> :
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ fontWeight: "500", color: "#666" }}>upload image</Text>
                            <Ion name="image-outline" size={16} color="#66b" marginStart={2} />
                        </View>
                }
            </View>

            <SectorData
                comp={true}
                private_={checked === "private"}
                sectorName={sectorName}
                setSectorName={setSectorName}
                delegates={delegates}
                setDelegates={setDelegates}
                navigation={navigation}
                fn={createDomain}
            />
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                enablePanDownToClose={true}
                snapPoints={['55%']}
                handleIndicatorStyle={{ backgroundColor: "#66b" }}
                handleStyle={styles.handleStyle}
                enableOverDrag={false}
                backdropComponent={renderBackdrop}
                opacity={0.9}
                onChange={handleSheetChanges}
                backgroundStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            >
                <BottomSheetView style={styles.bottomSheetView}>
                    <BottomSheetForImg bottomSheetRef={bottomSheetRef} />
                </BottomSheetView>
            </BottomSheet>
        </View>
    )
}

const styles = StyleSheet.create({
    bottomSheetView: {
        flex: 1,
        paddingTop: 16,
        backgroundColor: "#fff4"
    },
    container: {
        width: "90%",
        paddingStart: 18,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center"
    },
    handleStyle: {
        backgroundColor: "#fff4",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    imgView: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 2,
        marginStart: 26,
        marginTop: 8,
        borderColor: "#ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
})

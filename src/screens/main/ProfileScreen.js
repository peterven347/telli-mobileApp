import React, { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { TextInput } from "react-native-paper"
import { useIsFocused } from "@react-navigation/native"
import { useToken, useUser } from "../../../store/useStore"
import Feather from "react-native-vector-icons/Feather"
import Ion from "react-native-vector-icons/Ionicons"
import Oct from "react-native-vector-icons/Octicons";

import Settings from "./profile/Settings"

function About() {
    return (
        <>
        </>
    )
}

export default function ProfileScreen() {
    const { user, setUser } = useUser()
    const { setAccessToken } = useToken()
    const [firstName, setFirstName] = useState(user?.first_name)
    const [lastName, setLasttName] = useState(user?.last_name)
    const [email, setEmail] = useState(user?.email + user?._id)
    const [phoneNum, setPhoneNum] = useState(user?.phone_number)
    const [password, setPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")

    const isFocused = useIsFocused()
    const nameInputRef = useRef(null)
    const [editable, setEditable] = useState(false)
    const [valChanged, setValChanged] = useState(false)
    const [loading, setLoading] = useState(null)
    const [secureTextEntry, setSecureTextEntry] = useState(true)
    const [secureTextEntryA, setSecureTextEntryA] = useState(true)
    useEffect(() => {
        if (!isFocused && !loading) {
            setEditable(false)
            setValChanged(false)
            setLoading(null)

            setFirstName(user?.name)
            setPhoneNum(user?.phoneNum)
        }
    }, [isFocused])

    // useEffect(() => {
    //     if (user?.first_name.toUpperCase() == firstName?.toUpperCase() && user?.last_name.toUpperCase() == lastName.toUpperCase() && user?.phoneNum == phoneNum) {
    //         setValChanged(false)
    //     } else {
    //         setValChanged(true)
    //     }
    // }, [firstName, lastName, phoneNum])

    const editDetail = async () => {
        setEditable(false)
        setValChanged(false)
        setLoading("1")
        const val = await fetch(`${url}/api/user/.....................................`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // first_name: firstName,
                // last_name: lastName,
                // email: email,
                // phone_number: phoneNum,
                // password: password,
            })
        })
        const res = await val.json()
        // console.log(res)
        setLoading(null)
        setEditable(true)
    }


    return (
        <KeyboardAvoidingView style={{ flex: 1, paddingTop: 16 }}>
            <View style={styles.topIconsView}>
                <Ion name="settings" size={20} color="#444" style={styles.topIcons} />
                <Feather name="edit" size={20} color="#444" style={styles.topIcons} onPress={() => { !loading && setEditable(true) }} />
            </View>
            <TextInput
                mode="outlined"
                inputMode="text"
                label="First name"
                textContentType="givenName"
                value={firstName}
                editable={editable}
                textColor={editable ? "#222" : "#999"}
                onChangeText={setFirstName}
                outlineStyle={{ borderWidth: 0.7 }}
                style={styles.textInput}
            />
            <TextInput
                mode="outlined"
                inputMode="text"
                label="Last name"
                textContentType="familyName"
                value={lastName}
                editable={editable}
                textColor={editable ? "#222" : "#999"}
                onChangeText={setLasttName}
                outlineStyle={{ borderWidth: 0.7 }}
                style={styles.textInput}
            />
            <TextInput
                mode="outlined"
                inputMode="tel"
                label="Phone number"
                textContentType="telephoneNumber"
                value={phoneNum}
                editable={editable}
                textColor={editable ? "#222" : "#999"}
                outlineStyle={{ borderWidth: 0.7 }}
                style={styles.textInput}
                onChangeText={setPhoneNum}
            />
            <TextInput
                mode="outlined"
                inputMode="email"
                label="Email"
                textContentType="emailAddress"
                value={email}
                editable={false}
                textColor={"#999"}
                outlineStyle={{ borderWidth: 0.7 }}
                style={styles.textInput}
            />

            <View style={styles.titleView}>
                <Text style={styles.title}>Change password</Text>
            </View>

            <TextInput
                mode="outlined"
                keyboardType="ascii-capable"
                label="current password"
                placeholder="********"
                textContentType="password"
                secureTextEntry={secureTextEntry}
                spellCheck={false}
                caretHidden={true}
                autoCompleteType={false}
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                textColor="#999"
                outlineStyle={{ borderWidth: 0.7 }}
                style={styles.textInput}
                right={<TextInput.Icon icon={secureTextEntry ? "eye-off" : "eye"} size={20} onPress={() => setSecureTextEntry(e => !e)} />}
            />
            <TextInput
                mode="outlined"
                keyboardType="ascii-capable"
                label="new password"
                textContentType="newPassword"
                secureTextEntry={secureTextEntryA}
                spellCheck={false}
                caretHidden={true}
                autoCompleteType={false}
                autoCorrect={false}
                value={newPassword}
                onChangeText={setNewPassword}
                textColor="#222"
                outlineStyle={{ borderWidth: 0.7 }}
                style={styles.textInput}
                right={<TextInput.Icon icon={secureTextEntryA ? "eye-off" : "eye"} size={20} onPress={() => setSecureTextEntryA(e => !e)} />}
            />
            {/* <TouchableOpacity style={[styles.save, {marginTop: 10}]} onPress={() => 
                { if (loading== "1"){
                    setLoading("0")
                }
                else{
                    setLoading("1")
                }}}
            >
            <Text style={[styles.text, {color: "#66b", marginStart: 0 }]}>Change password</Text>
            </TouchableOpacity>  */}
            <TouchableOpacity
                activeOpacity={valChanged ? 0.5 : 0.8}
                style={[styles.save, { backgroundColor: valChanged ? "" : "" }]}
                onPress={() => { valChanged && editDetail(); valChanged && Keyboard.isVisible() && Keyboard.dismiss() }}
            >
                <Text style={[styles.text, { color: "#66b" }]}>Save changes</Text>
                {
                    loading === "1" ? <ActivityIndicator animating={true} size={16} />
                        : loading === "0" ? <Oct name="check" size={20} color="#66b3b3" />
                            : <Oct name="check" size={20} color="transparent" />
                }
            </TouchableOpacity>
            <Feather name="more-horizontal" size={30} color="#66b" style={styles.more} onPress={() => setAccessToken("")} />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    more: {
        width: 64,
        height: 40,
        paddingTop: 5,
        textAlign: "center",
        alignSelf: "center"
    },
    save: {
        width: "90%",
        height: 50,
        marginVertical: 36,
        borderRadius: 10,
        columnGap: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    text: {
        fontSize: 16,
        marginStart: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    textInput: {
        width: "90%",
        // height: 40,
        marginBottom: 12,
        backgroundColor: "#fffd",
        alignSelf: "center"
    },
    title: {
        color: "#999",
        fontWeight: "500",
    },
    titleView: {
        width: "90%",
        marginTop: 36,
        marginStart: 4,
        alignSelf: "center"
    },
    topIcons: {
        width: 32,
        height: 32,
        paddingTop: 6,
        textAlign: "center",
        // backgroundColor: "red"
    },
    topIconsView: {
        width: "90%",
        paddingInline: 6,
        marginBottom: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignSelf: "center"
    }
})

// import React, { useRef, useState, useEffect } from 'react';
// import {
//     View,
//     Modal,
//     FlatList,
//     Image,
//     Dimensions,
//     StyleSheet,
//     TouchableOpacity,
//     Text,
// } from 'react-native';

// const images = [
//     'https://picsum.photos/id/1011/800/400',
//     'https://picsum.photos/id/1025/800/400',
//     'https://picsum.photos/id/1035/800/400',
//     'https://picsum.photos/id/1043/800/400',
// ];

// export default function ProfileScreen() {
//     const [modalVisible, setModalVisible] = useState(false);
//     const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
//     const flatListRef = useRef(null);
//     const currentIndexRef = useRef(0);

//     // 🔄 Update screen width on rotation
//     useEffect(() => {
//         const onChange = ({ window }) => {
//             setScreenWidth(window.width);
//         };
//         const subscription = Dimensions.addEventListener('change', onChange);

//         return () => subscription?.remove();
//     }, []);

//     // 🔁 Re-scroll to the correct index after rotation
//     useEffect(() => {
//         if (modalVisible && flatListRef.current) {
//             flatListRef.current.scrollToIndex({
//                 index: currentIndexRef.current,
//                 animated: false,
//             });
//         }
//     }, [screenWidth, modalVisible]);

//     // 👀 Track which image is currently visible
//     const onViewRef = useRef(({ viewableItems }) => {
//         if (viewableItems.length > 0) {
//             currentIndexRef.current = viewableItems[0].index;
//         }
//     });

//     return (
//         <>
//             <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.openButton}>
//                 <Text style={styles.buttonText}>Open Gallery</Text>
//             </TouchableOpacity>

//             <Modal visible={modalVisible} animationType="slide">
//                 <View style={styles.modalContainer}>
//                     <FlatList
//                         ref={flatListRef}
//                         data={images}
//                         horizontal
//                         pagingEnabled
//                         keyExtractor={(_, index) => index.toString()}
//                         showsHorizontalScrollIndicator={false}
//                         initialScrollIndex={1} // Start from 3rd image
//                         getItemLayout={(data, index) => ({
//                             length: screenWidth,
//                             offset: screenWidth * index,
//                             index,
//                         })}
//                         renderItem={({ item }) => (
//                             <Image
//                                 source={{ uri: item }}
//                                 style={{ width: screenWidth, height: 300 }}
//                                 resizeMode="cover"
//                             />
//                         )}
//                         onViewableItemsChanged={onViewRef.current}
//                         viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
//                     />

//                     <TouchableOpacity
//                         onPress={() => setModalVisible(false)}
//                         style={styles.closeButton}
//                     >
//                         <Text style={styles.buttonText}>Close</Text>
//                     </TouchableOpacity>
//                 </View>
//             </Modal>
//         </>
//     );
// }

// const styles = StyleSheet.create({
//     modalContainer: {
//         flex: 1,
//         backgroundColor: '#000',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     openButton: {
//         backgroundColor: '#1e90ff',
//         padding: 15,
//         borderRadius: 10,
//         alignSelf: 'center',
//         marginTop: 100,
//     },
//     closeButton: {
//         backgroundColor: '#dc143c',
//         padding: 15,
//         borderRadius: 10,
//         position: 'absolute',
//         bottom: 40,
//         alignSelf: 'center',
//     },
//     buttonText: {
//         color: 'white',
//         fontWeight: 'bold',
//     },
// });


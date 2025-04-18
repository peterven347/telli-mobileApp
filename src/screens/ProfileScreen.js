import React, { useEffect, useRef, useState } from "react"
import { useIsFocused } from "@react-navigation/native"
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Button, TextInput } from "react-native-paper"
import Feather from "react-native-vector-icons/Feather"
import Ion from "react-native-vector-icons/Ionicons"
import Oct from "react-native-vector-icons/Octicons";

import { useUser } from "../../store/useStore"
import Settings from "./Settings"
import More from "./More"

function About() {
    return(
        <>
        </>
    )
}

export default function ProfileScreen() {
    const { user, setUser } = useUser()
    const [firstName, setFirstName] = useState(user.name)
    const [lastName, setLasttName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    const [phoneNum, setPhoneNum] = useState(user.phoneNum)
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
        if(!isFocused && !loading) {
            setEditable(false)
            setValChanged(false)
            setLoading(null)

            setFirstName(user.name)
            setPhoneNum(user.phoneNum)
        }
    }, [isFocused])

    useEffect(() => {
        if (user?.first_name.toUpperCase() == firstName?.toUpperCase() && user?.last_name.toUpperCase() == lastName.toUpperCase() && user?.phoneNum == phoneNum) {
            setValChanged(false)
        } else {
            setValChanged(true)
        }
    }, [firstName, lastName, phoneNum])

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
        <KeyboardAvoidingView style={{flex: 1, paddingTop: 16}}>
            <View style={styles.topIconsView}>
                <Ion name="settings" size={20} color="#444" style={styles.topIcons}/>
                <Feather name="edit" size={20} color="#444" style={styles.topIcons} onPress={() => {!loading && setEditable(true)}}/>
            </View>
            <TextInput
                mode= "outlined"
                inputMode= "text"
                label= "First name"
                textContentType= "givenName"
                value= {firstName}
                editable={editable}
                textColor={editable ? "#222" : "#999"}
                onChangeText={setFirstName}
                outlineStyle={{borderWidth: 0.7}}
                style= {styles.textInput}
            />
            <TextInput
                mode= "outlined"
                inputMode= "text"
                label= "Last name"
                textContentType= "familyName"
                value= {lastName}
                editable={editable}
                textColor={editable ? "#222" : "#999"}
                onChangeText={setLasttName}
                outlineStyle={{borderWidth: 0.7}}
                style= {styles.textInput}
            />
            <TextInput
                mode="outlined"
                inputMode="tel"
                label="Phone number"
                textContentType= "telephoneNumber"
                value={phoneNum}
                editable={editable}
                textColor={editable ? "#222" : "#999"}
                outlineStyle={{borderWidth: 0.7}}
                style={styles.textInput}
                onChangeText={setPhoneNum}
            />
            <TextInput
                mode="outlined"
                inputMode="email"
                label="Email"
                textContentType= "emailAddress"
                value={email}
                editable={false}
                textColor={"#999"}
                outlineStyle={{borderWidth: 0.7}}
                style={styles.textInput}
            />

            <View style={styles.titleView}>
                <Text style={styles.title}>Change password</Text>
            </View>

            <TextInput
                mode= "outlined"
                keyboardType= "ascii-capable"
                label= "current password"
                placeholder="********"
                textContentType= "password"
                secureTextEntry= {secureTextEntry}
                spellCheck= {false}
                caretHidden= {true}
                autoCompleteType= {false}
                autoCorrect= {false}
                value= {password}
                onChangeText= {setPassword}
                textColor= "#999"
                outlineStyle={{borderWidth: 0.7}}
                style= {styles.textInput}
                right={<TextInput.Icon icon={secureTextEntry? "eye-off" : "eye"} size={20} onPress={() => setSecureTextEntry(e => !e)}/>}
            />
            <TextInput
                mode= "outlined"
                keyboardType= "ascii-capable"
                label= "new password"
                textContentType= "newPassword"
                secureTextEntry= {secureTextEntryA}
                spellCheck= {false}
                caretHidden= {true}
                autoCompleteType= {false}
                autoCorrect= {false}
                value= {newPassword}
                onChangeText= {setNewPassword}
                textColor= "#222"
                outlineStyle={{borderWidth: 0.7}}
                style= {styles.textInput}
                right={<TextInput.Icon icon={secureTextEntryA? "eye-off" : "eye"} size={20} onPress={() => setSecureTextEntryA(e => !e)}/>}
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
                activeOpacity={valChanged? 0.5 : 0.8}
                style={[styles.save, { backgroundColor: valChanged ? "" : "" }]}
                onPress={() => {valChanged && editDetail(); valChanged && Keyboard.isVisible() && Keyboard.dismiss()}}
                >
                <Text style={[styles.text, {color: "#66b" }]}>Save changes</Text>
                {
                loading === "1" ? <ActivityIndicator animating={true} size={16}/>
                : loading === "0" ? <Oct name="check" size={20} color="#66b3b3"/>
                : <Oct name="check" size={20} color="transparent"/>
                }
            </TouchableOpacity>
            <Feather name="more-horizontal" size={30} color="#66b" style={styles.more}/> 
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    more: {
        width: 64,
        height: 40,
        paddingTop: 5,
        textAlign:"center",
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
        textAlign:"center",
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
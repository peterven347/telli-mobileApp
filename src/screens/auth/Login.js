import * as Keychain from "react-native-keychain";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from "react"
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { TextInput } from "react-native-paper"
import { initSocket, url } from "../../../utils/https"
import { useUser, useToken, useDomain } from "../../../store/useStore";


export default function Login({ navigation }) {
    const messaging = getMessaging(getApp())
    const { setUser } = useUser()
    const { setDomains } = useDomain()
    const { setAccessToken } = useToken()
    const [message, setMessage] = useState(" ")
    const [email, setMail] = useState("petervenwest1@gmail.com")
    const [password, setPassword] = useState("12345")
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [btnActive, setBtnActive] = useState(true)

    const getDomain = async () => {
        try {
            let accessToken = useToken.getState().accessToken
            const httpCall = await fetch(`${url}/domain`, {
                headers: {
                    Authorization: "Bearer " + accessToken,
                }
            })
            const res = await httpCall.json()
            if (res.success === true) {
                setDomains(res.domain)
                await AsyncStorage.setItem("cacheDomain", JSON.stringify(res.domain))
            }
        } catch (err) {
            setMessage("an error occured")
        }
    }

    const login = async () => {
        setMessage("")
        setBtnActive(false)
        try {
            // const fcmToken = await getToken(messaging)
            const val = await fetch(`${url}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    fcmToken: "fcmToken"
                })
            })
            const res = await val.json()
            if (res.success === false) {
                setMessage(res.message)
                setBtnActive(true)
            } else if (res.success === true) {
                await setAccessToken(res.accessToken)
                async function connectSocket() {
                    const socket = await initSocket(res.accessToken);
                    if (!socket.connected) {
                        console.log("sc not connected on login")
                        socket.connect()
                    }
                }
                connectSocket()
                setUser(res.user)
                getDomain()
                await Keychain.setGenericPassword("refreshToken", res.refreshToken, { service: "refreshToken" });
            }
        } catch (err) {
            console.log(err)
            setMessage(err.message)
            setBtnActive(true)
        }
    }

    return (
        <View style={{ flex: 1, paddingTop: 50 }}>
            <TextInput
                mode="outlined"
                inputMode="email"
                label="e-mail"
                textContentType="emailAddress"
                value={email}
                onChangeText={setMail}
                textColor="#222"
                style={styles.textInput}
            />
            <TextInput
                mode="outlined"
                keyboardType="ascii-capable"
                label="password"
                textContentType="password"
                secureTextEntry={!passwordVisible}
                spellCheck={false}
                caretHidden={true}
                autoCompleteType={false}
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                textColor="#222"
                right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} color={passwordVisible ? "#888" : "#444"} size={20} onPress={() => setPasswordVisible(!passwordVisible)} />}
                style={styles.textInput}
            />
            <TouchableOpacity style={styles.forgotPass}>
                <Text style={{ fontSize: 14, color: "#66b" }}>Forgot password</Text>
            </TouchableOpacity>
            <View style={styles.login}>
                <Text>Don't have an account?  </Text>
                <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                    <Text style={styles.loginText}>Sign Up </Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.8} disabled={!btnActive} style={{ ...styles.loginBtn, backgroundColor: btnActive ? "#66b" : "#66ba" }} onPress={login}>
                <Text style={styles.text}>Login</Text>
            </TouchableOpacity>
            {message ?
                <Text style={styles.message}>
                    {message}
                </Text> :
                <ActivityIndicator color="#66b" />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    forgotPass: {
        width: '90%',
        height: 45,
        marginTop: 12,
        paddingStart: 2,
        justifyContent: "center",
        alignSelf: "center"
    },
    login: {
        width: '90%',
        height: 45,
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center"
    },
    loginBtn: {
        width: "90%",
        height: 50,
        marginTop: 60,
        marginBottom: 15,
        borderRadius: 10,
        columnGap: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    loginText: {
        fontSize: 16,
        color: "#66b",
    },
    message: {
        color: "#d00",
        textAlign: "center"
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    textInput: {
        width: "90%",
        marginBottom: 12,
        backgroundColor: "#fffd",
        alignSelf: "center"
    },
}) 
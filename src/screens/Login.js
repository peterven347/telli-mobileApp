import * as Keychain from "react-native-keychain";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from "react"
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { TextInput } from "react-native-paper"
import { useUrl, useUser, useToken } from "../../store/useStore";


export default function Login({navigation}) {
    const { url } = useUrl()
    const { setUser } = useUser()
    const { setAccessToken, setRefreshToken } = useToken()
    const [message, setMessage] = useState(" ")

    const [email, setMail] = useState("petervenwest1@gmail.com")
    const [password, setPassword] = useState("12345")

    const login = async() => {
        setMessage("")
        const val = await fetch(`${url}/api/user/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            })
        })

        const res = await val.json()
        if (res.message) {
            setMessage(res.message)
        } else {
            setAccessToken(res.accessToken)
            setRefreshToken(res.refreshToken)
            setUser(res.user)

            const _setUser = async () => {
                try {
                    const jsonValue = JSON.stringify(res.user);
                    await AsyncStorage.setItem("user", jsonValue);
                } catch (e) {
                  // saving error
                }
            };
            _setUser()
            
            await Keychain.setGenericPassword("accessToken", res.accessToken, {service: "accessToken"})
            await Keychain.setGenericPassword("refreshToken", res.refreshToken, {service: "refreshToken"})
        }
    }

    return(
        <View style={{flex: 1, paddingTop: 50}}>
            <TextInput
                mode="outlined"
                inputMode="email"
                label="e-mail"
                textContentType="emailAddress"
                value={email}
                onChangeText={setMail}
                textColor= "#222"
                style={styles.textInput}
            />
            <TextInput
                mode= "outlined"
                keyboardType= "ascii-capable"
                label= "password"
                textContentType= "password"
                secureTextEntry= {true}
                spellCheck= {false}
                caretHidden= {true}
                autoCompleteType= {false}
                autoCorrect= {false}
                value= {password}
                onChangeText= {setPassword}
                textColor= "#222"
                style= {styles.textInput}
            />
            <TouchableOpacity style={styles.forgotPass}>
                <Text style={{fontSize: 14, color: "#66b"}}>Forgot password</Text>
            </TouchableOpacity>
            <View style={styles.login}>
                <Text>Don't have an account?  </Text>
                <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                    <Text style={styles.loginText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={styles.loginBtn} onPress={login}>
                <Text style={styles.text}>Login</Text>
            </TouchableOpacity>
            { message ? 
                <Text style={styles.message}>
                    {message}
                </Text> :
                <ActivityIndicator color="#66b"/>
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
        // backgroundColor: 'blue',
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
        backgroundColor: "#66b",
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
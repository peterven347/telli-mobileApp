import { useState } from "react"
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { TextInput } from "react-native-paper"
import { url } from "../../../utils/https"

export default function SignUp({navigation}) {
    const [message, setMessage] = useState(" ")
    const [resMail, setResMail] = useState("")

    const [firstName, setFirstName] = useState("")
    const [lastName, setLasttName] = useState("")
    const [email, setEmail] = useState("")
    const [phoneNum, setPhoneNum] = useState("")
    const [password, setPassword] = useState("")
    const passwordRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const signup = async () => {
        setMessage("")
        const val = await fetch(`${url}/sign-up`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: phoneNum,
                password: password,
            })
        })
        const res = await val.json()
        // console.log(res)
        setMessage(res.message)
        setResMail(res.resMail)
        // await Keychain.setGenericPassword(firstName, token)
        // setToken(token)
        // setuserName(firstName)
    }
    return(
        <View style={{flex: 1, paddingTop: 50}}>
            <TextInput.Affix left={() => <Text>tyujikl</Text>}>
                fghj
            </TextInput.Affix>
            <TextInput
                mode= "outlined"
                inputMode= "text"
                label= "First name"
                textContentType= "givenName"
                value= {firstName}
                onChangeText={setFirstName}
                textColor= "#222"
                left={() => <Text>tyujikl</Text>}
                style= {styles.textInput}
            />
            <TextInput
                mode= "outlined"
                inputMode= "text"
                label= "Last name"
                textContentType= "familyName"
                value= {lastName}
                onChangeText={setLasttName}
                textColor= "#222"
                style= {styles.textInput}
            />
            <TextInput
                mode= "outlined"
                inputMode= "email"
                label= "Email"
                textContentType= "emailAddress"
                value= {email}
                onChangeText={setEmail}
                textColor= "#222"
                style= {styles.textInput}
            />
            <TextInput
                mode= "outlined"
                inputMode= "tel"
                label= "Phone number"
                textContentType= "telephoneNumber"
                value= {phoneNum}
                onChangeText={setPhoneNum}
                textColor= "#222"
                style= {styles.textInput}
            />
            <TextInput
                mode= "outlined"
                keyboardType= "ascii-capable"
                label= "Password"
                textContentType= "newPassword"
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
            <View style={styles.login}>
                <Text>Already have an account?  </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.loginText}>Sign In  </Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity= {0.8} style= {styles.signupBtn} onPress={signup}>
                <Text style= {styles.text}>Sign up</Text>
            </TouchableOpacity>
            { message ? 
                <Text style={styles.message}>
                    {message}{" "}
                    <Text style={{color: "#66b"}} onPress={() => Linking.openURL('https://gmail.app.goo.gl')}>
                        {resMail}
                    </Text>
                </Text> :
                <ActivityIndicator color="#66b"/>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    login: {
        width: '90%',
        height: 45,
        marginTop: 16,
        flexDirection: "row",
        // backgroundColor: "blue",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center"
    },
    loginText: {
        fontSize: 16,
        color: "#66b",
    },
    message: {
        textAlign: "center"
    },
    signupBtn: {
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
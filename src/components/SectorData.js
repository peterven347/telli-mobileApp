import React, { useEffect, useRef, useState } from "react"
import { Linking, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import { useDelegateContact, useToken, useUser } from "../../store/useStore";
import { url } from "../../apis/socket";
import Mci from 'react-native-vector-icons/MaterialCommunityIcons';

const emailRegex = /^(?=.{1,256}$)(?=.{1,64}@.{1,255}$)(?=[^@]+@[^@]+\.[a-zA-Z]{2,63}$)^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function SectorData({ private_, sectorName, setSectorName, delegates, setDelegates, fn, navigation, route, comp }) {
    const subject = "You're invited to join Proman";
    const body = 'This is a test message.';
    const isVerifiedEmail = {}
    const scrollRef = useRef(null)
    const inputRefs = useRef([]);
    const [loading, setLoading] = useState(false)
    const [delegateTrack, setdelegateTrack] = useState(false)
    const _id = route?.params?._id;
    const { user } = useUser()
    const { accessToken } = useToken()
    const { selected, setSelected } = useDelegateContact()

    useEffect(() => {
        if (inputRefs.current.length > 0) {
            const lastIndex = inputRefs.current.length - 1;
            inputRefs.current[lastIndex]?.focus();
        }
    }, [delegateTrack]);

    const addDelegate = () => {
        setDelegates(prev => [
            ...prev,
            { id: Math.random(), email: "", checked: false, res: "" }
        ]);
        setdelegateTrack(prev => !prev)
    };

    const removeDelegate = (id) => {
        setDelegates(prev =>
            prev.filter(i => i.id !== id)
        );
    };

    const editEmail = (id, e, checked = false, res = "") => {
        isVerifiedEmail[user?.email] = "exists"
        setDelegates((prev) =>
            prev.map((i) => {
                if (i.id == id) {
                    return {
                        ...i,
                        email: e.toLowerCase(),
                        checked: checked,
                        res: emailRegex.test(e) ? res : "invalid"
                    }
                };
                return i;
            })
        )
    };

    const verifyEmail = async (id, email) => {
        if (email === user.email) {
            editEmail(id, email, true, "exists")
            return;
        }
        if (isVerifiedEmail.hasOwnProperty(email)) {
            editEmail(id, email, true, isVerifiedEmail[email])
            return;
        }
        if (emailRegex.test(email)) {
            editEmail(id, email, false, "loading")
            const httpCall = await fetch(`${url}/user/verify-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                },
                body: JSON.stringify({
                    email: email
                })
            })
            const res = await httpCall.json()
            if (res.email) {
                editEmail(id, res.email, true, res.message)
            }
            if (res.message === "exists") {
                isVerifiedEmail[email] = "exists"
            } else if (res.message === "notExist") {
                isVerifiedEmail[email] = "notExist"
            }
        }
        else {
            // !checked && editEmail(id, email, checked)
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 40, paddingBottom: 35 }}>
            <ScrollView
                ref={scrollRef}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="always"
            >
                {comp &&
                    <>
                        <Text style={{ paddingStart: 25, color: "#444" }}>Add  sector</Text>
                        <TextInput
                            // label={`sectorName`}
                            value={sectorName}
                            textColor="#000b"
                            placeholder="sector name"
                            placeholderTextColor="#ccc"
                            mode="outlined"
                            maxLength={100}
                            multiline={false}
                            dense={true}
                            returnKeyType='next'
                            outlineStyle={{ borderWidth: 0, borderBottomWidth: 1 }}
                            style={{ width: "90%", backgroundColor: "#fff", marginBottom: 12, marginStart: 22 }}
                            onChangeText={setSectorName}
                        />
                    </>
                }
                { private_ && sectorName &&
                    <>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                            <Text style={{ paddingStart: 25, color: "#ccc" }}>add delgates (email/phone number)</Text>
                            <Pressable onPress={() => navigation.navigate("addContacts")}>
                                <Text style={{ backgroundColor: "#66b", borderRadius: 4, padding: 2, paddingHorizontal: 5, color: "#fff", marginStart: 16 }}>add from contacts</Text>
                            </Pressable>
                        </View>

                        {selected.map((i) => (
                            <Pressable key={i.recordID} style={[{ marginBottom: 8, gap: 16 }, styles.delegatesContainer]} onPress={() => setSelected(selected.filter(dc => dc.recordID !== i.recordID))}>
                                <Mci
                                    name="minus-circle"
                                    color='#f009'
                                    size={26}
                                    marginBottom={2}
                                    marginStart={4}
                                />
                                <Text>{i.displayName}</Text>
                            </Pressable>
                        ))}
                        {delegates.map((delegate, index) => (
                            <View key={index} style={styles.delegatesContainer}>
                                <Mci
                                    name={index === delegates.length - 1 ? "plus-circle" : "minus-circle"}
                                    color={index === delegates.length - 1 ? '#339' : '#f009'}
                                    size={26}
                                    marginBottom={2}
                                    marginStart={4}
                                    onPress={() => {
                                        if (index === delegates.length - 1) {
                                            addDelegate();
                                        } else {
                                            removeDelegate(delegate.id);
                                        }
                                    }}
                                />
                                <TextInput
                                    ref={ref => (inputRefs.current[index] = ref)}
                                    label={`delegate${selected.length + index + 1}`}
                                    value={delegate.email}
                                    textColor={delegates.slice(0, index).some(prev => prev.email === delegate.email) || delegate.email === user?.email ? "#bbb" : "#000b"}
                                    mode="outlined"
                                    maxLength={50}
                                    multiline={false}
                                    dense={true}
                                    returnKeyType='next'
                                    autoCorrect={false}
                                    right={
                                        delegate.res === "notExist" ?
                                            <TextInput.Affix text="invite" textStyle={styles.textAffix} onPress={() => Linking.openURL(`mailto:${delegate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)} />
                                            :
                                            <TextInput.Icon
                                                icon={delegate.res === "exists"
                                                    ? "check" : delegate.res === "invalid"
                                                        ? "exclamation" : delegate.res === "loading"
                                                            ? () => <ActivityIndicator size={10} /> : () => null}
                                                color={delegate.res === "exists"
                                                    ? "#77b3a2" : delegate.res === "invalid"
                                                        ? "#f009" : () => null}
                                                size={16}
                                            />
                                    }
                                    outlineStyle={{ borderWidth: 0, borderBottomWidth: 1 }}
                                    contentStyle={{ fontStyle: delegates.slice(0, index).some(prev => prev.email === delegate.email) || delegate.email === user?.email ? "italic" : "normal" }}
                                    style={{ width: "90%", backgroundColor: "#fff", marginBottom: 12 }}
                                    onChangeText={(e) => editEmail(delegate.id, e, false, "")}
                                    onBlur={() => { verifyEmail(delegate.id, delegate.email) }}
                                />
                            </View>
                        ))}
                    </>

                }
            </ScrollView>
            {/* {!comp && (
                loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} size={20} />
                ) : (
                    <Button
                        mode="contained"
                        style={{ width: "auto", alignSelf: "center", marginTop: 8 }}
                        onPress={fn} // <- not fn()
                    >
                        DONE
                    </Button>
                )
            )} */}
            {
                loading ? <ActivityIndicator marginTop={20} size={20} /> :
                <Button
                loading={loading}
                    mode='contained'
                    style={{ width: "auto", alignSelf: "center", marginTop: 8 }}
                    onPress={fn}
                >
                    DONE
                </Button>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    delegatesContainer: {
        width: "90%",
        paddingStart: 18,
        flexDirection: "row",
        alignItems: "center",
        // backgroundColor: "red"
    },
    textAffix: {
        fontSize: 12,
        borderRadius: 8,
        paddingHorizontal: 6,
        textAlign: "center",
        color: "#c00",
        backgroundColor: "#fdd",
    }
})
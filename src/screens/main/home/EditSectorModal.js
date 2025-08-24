import React, { useState, useMemo } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Fa5 from "react-native-vector-icons/FontAwesome5"
import Mci from "react-native-vector-icons/MaterialCommunityIcons"
import { useDelegateContact, useDomain, useToken } from "../../../../store/useStore"
import country_dial_codes from "../../../../utils/country-dial-codes"
import SectorData from "../../../components/SectorData"
import Overlay from "../../../components/Overlay"
import { refreshAccessToken } from '../../../../utils/refreshAccessToken'
import { url } from "../../../../utils/https"
import showSnackBar from "../../../../utils/SnackBar"

import { Divider, Portal } from "react-native-paper"

export default function EditsectorModal({ _id, title, editSectorModalVisible, setEditSectorModalVisible, navigation }) {
    const { accessToken } = useToken()
    const { contactList } = useDelegateContact()
    const { domains } = useDomain()
    const [delegate, setDelegate] = useState("")
    const [remDialogVisible, setRemDialogVisible] = useState(false)
    const [exitDialogVisible, setExitDialogVisible] = useState(false)
    const [loading, setLoading] = useState(false)

    let sector = domains?.find(i => i._id == _id)?.sectors?.find(j => j.title === title)
    let currDomain = domains.find(i => i._id === _id)
    const cleanPhoneNumber = (input) => {
        const number = input.trim();
        for (let i of country_dial_codes) {
            if (number.startsWith(i)) {
                return number.replace(i, '').replace(/\D/g, '')
            }
        }
        if (number.startsWith("0")) {
            return number.slice(1).replace(/\D/g, '');
        }
        return number.replace(/\D/g, '');
    };

    const findContactByPhoneNumber = useMemo(() => {
        const cache = {}

        return async (number) => {
            const key = number.trim();
            if (cache[key]) return cache[key];

            const match = contactList.find(contact =>
                contact.phoneNumbers?.some(i =>
                    cleanPhoneNumber(i) == (cleanPhoneNumber(number))
                )
            )
            // const result = number
            const result = match ? match.displayName : number
            // cache[key] = result
            return result
        }
    }, [contactList])

    const exitSector = async () => {
        setExitDialogVisible(false)
        setLoading(true)
        try {
            const httpCall = await fetch(`${url}/user/sector/${_id}`, {
                method: "PATCH",
                headers: {
                    Authorization: "Bearer " + accessToken.password,
                }
            })
            const res = await httpCall.json()
            console.log(res)
            if (res.exp) {
                console.log("exp token")
                let accessToken_ = await refreshAccessToken(url, accessToken)
                if (accessToken_) {
                    exitSector()
                } else {
                    console.log("repeat")
                }
            } else if (res.success === true) {
                console.log("done")
            }
        } catch (err) {
            console.log(err)
            showSnackBar("an error occured") // not working on modals
        } finally {
            setLoading(false)
        }
    }

    const removeDelegete = async () => {
        setRemDialogVisible(false)
        setLoading(true)
        try {
            const httpCall = await fetch(`${url}/remove-delegate/${_id}/${title}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken.password,
                },
                body: JSON.stringify({ delegate: 12345644949 })
            })
            const res = await httpCall.json()
            console.log(res)
            if (res.exp) {
                console.log("exp token")
                let accessToken_ = await refreshAccessToken()
                if (accessToken_) {
                    removeDelegete()
                } else {
                    console.log("repeat")
                }
            } else if (res.success === true) {
                console.log("done")
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={editSectorModalVisible}
            onRequestClose={() => { setEditSectorModalVisible(false) }}
        >
            {loading && <Overlay />}
            <Pressable style={styles.container} onPress={() => { setRemDialogVisible(false); setExitDialogVisible(false) }}>
                <Pressable style={{ ...styles.modalView, display: remDialogVisible ? "flex" : "none" }} onPress={() => { }}>
                    <Text style={{ fontWeight: "bold" }}>Remove {delegate}? </Text>
                    <View style={styles.dialog}>
                        <Text style={{ ...styles.dialogBtn, backgroundColor: "#f44" }} onPress={removeDelegete}>Yes</Text>
                        <Text style={styles.dialogBtn} onPress={() => setRemDialogVisible(false)}>No </Text>
                    </View>
                </Pressable>
                <Pressable style={{ ...styles.modalView, display: exitDialogVisible ? "flex" : "none" }} onPress={() => { }}>
                    <Text style={{ fontWeight: "bold" }}>Exit {title}? </Text>
                    <View style={styles.dialog}>
                        <Text style={{ ...styles.dialogBtn, color: "#fff", color: "#fff", backgroundColor: "#f44" }} onPress={exitSector}>Yes</Text>
                        <Text style={styles.dialogBtn} onPress={() => setExitDialogVisible(false)}>No </Text>
                    </View>
                </Pressable>
                <Text style={{ fontWeight: "bold", fontSize: 16, color: "#444" }}>{title}</Text>
                <Text>issues: {sector?.data.length}{"\n"}</Text>
                <Divider style={{ marginHorizontal: -16, marginBottom: 4, backgroundColor: "#66f" }} />
                {currDomain?.status === "private" &&
                    <>
                        <Pressable style={{ flexDirection: "row", height: 20, gap: 6, marginVertical: 10 }} onPress={() => { setEditSectorModalVisible(false); navigation.navigate("addSector", { comp: false, sectorName: title }) }}>
                            <Fa5 name="plus" color="#339" marginTop={3} />
                            <Text style={{ fontWeight: "bold", fontSize: 14, color: "#338" }}>add delegate</Text>
                        </Pressable>
                        <Text style={{ fontWeight: "bold", fontSize: 16, color: "#444" }}>Delegates</Text>
                    </>
                }
                <ScrollView>
                    {
                        sector?.delegates?.map(i =>
                            <TouchableOpacity activeOpacity={0.7} key={Object.values(i)[0]} style={styles.delegate} onLongPress={() => { setDelegate(Object.values(i)[0]); setRemDialogVisible(true) }}>
                                <Text style={{ fontSize: 15 }}>{findContactByPhoneNumber(Object.values(i)[0])}</Text>
                            </TouchableOpacity>
                        )
                    }
                    <Pressable style={{ flexDirection: "row", height: 20, gap: 6, marginTop: 40 }} onPress={() => setExitDialogVisible(true)}>
                        <Fa5 name="long-arrow-alt-left" color="#f00" marginTop={4} />
                        <Text style={{ fontWeight: "bold", fontSize: 14, color: "#f44" }}>exit sector</Text>
                        <Text style={{ fontWeight: "bold", fontSize: 14, color: "#f44" }}>{_id}</Text>
                    </Pressable>
                </ScrollView>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingStart: 6,
        paddingTop: 6
    },
    delegate: {
        marginBottom: 4
    },
    dialog: {
        width: "100%",
        paddingStart: "56%",
        columnGap: 24,
        flexDirection: "row",
        backgroundColor: "#fff",
    },
    dialogBtn: {
        padding: 6,
        paddingHorizontal: 12,
        borderRadius: 2,
        elevation: 2,
        backgroundColor: "#fff"
    },
    modalView: {
        width: "70%",
        padding: 16,
        borderRadius: 8,
        rowGap: 46,
        elevation: 6,
        alignSelf: "center",
        backgroundColor: "#fff",
        position: "absolute",
        top: "40%",
        zIndex: 2
    }
})
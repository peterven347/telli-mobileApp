import React, { useState } from "react"
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useDomain, useSnackBar, useToken } from "../../../../store/useStore"
import Overlay from "../../../components/Overlay"
import { refreshAccessToken } from '../../../../utils/refreshAccessToken'
import { url } from "../../../../utils/https"
import showSnackBar from "../../../../utils/SnackBar"

export default function ExitDomainModal({ _id, domain, exitDomainModalVisible, setExitDomainModalVisible }) {
    const { domains, setCurrDomainId, setDomains } = useDomain()
    const [loading, setLoading] = useState(false)

    const exitDomain = async () => {
        setLoading(true)
        try {
            let accessToken = useToken.getState().accessToken
            const httpCall = await fetch(`${url}/user/domain/${_id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                },
                method: "PATCH",
            })
            const res = await httpCall.json()
            console.log(res)
            if (res.exp) {
                console.log("exp token")
                let accessToken_ = await refreshAccessToken()
                if (accessToken_) {
                    exitDomain()
                } else {
                    console.log("repeat")
                }
            } else if (res.success === true) {
                setDomains(prev => prev.filter(i => i._id !== _id))
                setCurrDomainId(domains[1]?._id)
            } else if (res.message === "creator") {
                Alert.alert("You created the domain")
            }
        } catch (err) {
            console.log(err)
            showSnackBar("an error occured")
        } finally {
            setExitDomainModalVisible(false)
            setLoading(false)
        }
    }
    return (
        <Modal
            transparent={true}
            visible={exitDomainModalVisible}
            onRequestClose={() => { setExitDomainModalVisible(false) }}
        >
            {
                loading ?
                    <Overlay />
                    :
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <Text style={{ textAlign: "center", fontWeight: "bold" }}>{`Exit all sectors in ${domain} ?`}</Text>
                            <View style={styles.btnView}>
                                <TouchableOpacity activeOpacity={0.8} style={[styles.btn, { backgroundColor: '#f44' }]} onPress={exitDomain} >
                                    <Text style={{ color: "#fff" }}>Exit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.8} style={[styles.btn, { backgroundColor: '' }]} onPress={() => { setExitDomainModalVisible(false) }}>
                                    <Text style={{ color: "#444" }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
            }
        </Modal>
    )
}

const styles = StyleSheet.create({
    btn: {
        padding: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
    },
    btnView: {
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    modalContainer: {
        backgroundColor: "#0004",
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    modalView: {
        width: "70%",
        padding: 16,
        marginBottom: "5%",
        borderRadius: 8,
        rowGap: 46,
        elevation: 8,
        alignSelf: "center",
        backgroundColor: "#fff"
    }
})
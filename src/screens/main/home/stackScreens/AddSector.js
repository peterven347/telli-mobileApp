import React, { useState } from "react"
import { View } from "react-native"
import { RadioButton } from "react-native-paper"
import { useDelegateContact, useDomain, useToken, useUser } from "../../../../../store/useStore"
import { refreshAccessToken, url } from "../../../../../apis/chat.api"
import showSnackBar from "../../../../../utils/snackBar";
import SectorData from '../../../../components/SectorData';

const emailRegex = /^(?=.{1,256}$)(?=.{1,64}@.{1,255}$)(?=[^@]+@[^@]+\.[a-zA-Z]{2,63}$)^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function AddSector({ navigation, route }) {
    const { selected } = useDelegateContact()
    const { setDomains } = useDomain()
    const { user } = useUser()
    const [sectorName, setSectorName] = useState("")
    const [checked, setChecked] = useState("public")
    const [delegates, setDelegates] = useState([{ id: 1, email: "", res: "" }])

    const addSector = async () => {
        const formData = new FormData()
        formData.append("title", sectorName)
        formData.append("status", checked)
        formData.append("delegates",
            [...new Set(delegates.map(i => i.email).filter(email => email && email !== user.email && emailRegex.test(email)))].join(",")
            + "," + [...new Set(selected.map(i => i.phoneNumbers).flat())].join(","))
        let accessToken = useToken.getState().accessToken
        const httpCall = await fetch(`${url}/sector/${route.params._id}`, {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
            method: "POST",
            body: formData
        })
        const res = await httpCall.json()
        if (res.exp) {
            console.log("exp token")
            let accessToken_ = await refreshAccessToken()
            console.log("refreshed")
            if (accessToken_) {
                addSector()
            } else {
                console.log("repeat")
            }
        } else if (res.success === false) {
            showSnackBar(res.message)
        } else if (res.success === true) {
            showSnackBar("success")
            setDomains(prev =>
                prev.map(d => {
                    if (d._id !== res.data.domain_id) return d
                    return {
                        ...d,
                        sectors: [...d.sectors, {...res.data, data:[], time: Date.now()}]
                    }
                })
            )
            navigation.navigate("main")
            setSectorName("")
        }
    }
    return (
        <>
            <View style={{ flexDirection: "row", columnGap: 69, backgroundColor: "#fff" }}>
                <RadioButton.Item
                    label="public"
                    value="public"
                    status={checked === "public" ? "checked" : "unchecked"}
                    color='#339'
                    rippleColor="#fff"
                    position='leading'
                    onPress={() => setChecked("public")}
                />
                <RadioButton.Item
                    label="private"
                    value="private"
                    status={checked === "private" ? "checked" : "unchecked"}
                    color='#339'
                    rippleColor="#fff"
                    position='leading'
                    onPress={() => setChecked("private")}
                />
            </View>
            <SectorData
                private_={checked === "private"}
                // private_={route.params.status === "private" || false}
                comp={route.params.comp ?? true}
                sectorName={route.params.sectorName || sectorName}
                setSectorName={setSectorName}
                delegates={delegates}
                setDelegates={setDelegates}
                navigation={navigation}
                fn={addSector}
            />
        </>
    )
}


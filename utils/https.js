import * as Keychain from "react-native-keychain";
import { io } from "socket.io-client"
import { useDomain, usePending, useToken } from "../store/useStore"

let socket;
const { setDomains, setFetchedSectorIds } = useDomain.getState()
const { markSent } = usePending.getState()

export const url = "http://10.11.107.133:3030/api/user"

export const initSocket = async (accessToken) => {
    if (socket) return socket;
    await new Promise((resolve) => useToken.persist.onFinishHydration(resolve));
    console.log("token hydration")
    const token = accessToken || useToken.getState().accessToken;
    if (token) {
        socket = io(url, {
            auth: { token },
            autoConnect: false
        });
        return socket;
    }
};

export const refreshAccessToken = async () => {
    console.log("refreshing token")
    const { accessToken, setAccessToken } = useToken.getState()
    const refreshToken = await Keychain.getGenericPassword({ service: "refreshToken" });
    const token = await fetch(`${url}/refresh-access-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken
        },
        body: JSON.stringify({
            refreshToken: refreshToken.password,
        })
    })

    const res = await token.json()
    if (res.success === true) {
        await setAccessToken(res.accessToken)
        const socket = await initSocket(res.accessToken)
        socket.disconnect()
        socket.connect()
        return (res.accessToken)
    } else {
        if (res.message === "log in") {
            console.log("logged out")
            await setAccessToken("")
        }
        return null
    }
};

export const getIssue = async (domainId, sectorId, skip) => {
    const { accessToken } = useToken.getState()
    try {
        const httpCall = await fetch(`${url}/issue/${sectorId}/${skip}`, {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
            method: "GET",
        })
        const res = await httpCall.json()
        if (res.exp) {
            let accessToken_ = await refreshAccessToken()
            if (accessToken_) {
                getIssue(domainId, sectorId, skip)
            } else {
                console.log("repeat getIssue")
            }
        }
        if (res.success === true) {
            setFetchedSectorIds(prev => [...new Set([...prev, sectorId])])
        }
        if (res.success === true && res.data.length >= 1) {
            setDomains(prev =>
                prev.map(d => {
                    if (d._id !== domainId) return d
                    return {
                        ...d,
                        sectors: d.sectors.map(s => {
                            if (s._id !== sectorId) return s;
                            return {
                                ...s,
                                data: [...res.data, ...(s.data || [])]
                            };
                        }),
                    };
                })
            )
        };
    } catch (err) {
        console.log(err)
    }
}

export const sendPendingIssue = async (issue) => {
    const { accessToken } = useToken.getState()
    try {
        const formData = new FormData()
        formData.append("note", issue.note)
        issue.pictures.forEach((i, index) => {
            if (i.uri && typeof i.uri === "string") {
                formData.append("files", {
                    uri: i.uri,
                    type: i.type || "application/octet-stream",
                    name: `_id-${i.fileName || `photo-${index}.jpg`}`
                });
            } else {
                console.warn("Skipping invalid image:", i);
            }
        });

        console.log("start sending...")
        const httpCall = await fetch(`${url}/${issue.sectorId}`, {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
            method: "POST",
            body: formData
        })
        console.log("sending pending...", issue.id)
        const res = await httpCall.json()
        if (res.exp) {
            let accessToken_ = await refreshAccessToken()
            if (accessToken_) {
                sendPendingIssue(issue)
            } else {
                console.log("repeat sendPendingIssue")
            }
        } else if (res.success === false && res.message === 'sector not found') { //check the message
            await markSent(issue.id)
        } else if (res.success === true) {
            await markSent(issue.id)
            setDomains(prev =>
                prev.map(d => {
                    if (d._id !== issue.domainId) return d
                    return {
                        ...d,
                        sectors: d.sectors.map(s => {
                            if (s._id !== issue.sectorId) return s;
                            return {
                                ...s,
                                time: Date.now(),
                                data: [...(s.data.filter(np => np?.id !== issue.id) || [])]
                            };
                        }),
                    };
                })
            );
        }
    }
    catch (err) {
        console.log(err)
    }
}
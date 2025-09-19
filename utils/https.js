import * as Keychain from "react-native-keychain";
import { io } from "socket.io-client"
import { useDomain, useLastMessageTime, usePending, useToken, useUser } from "../store/useStore"
import { isSameDay } from "./isSameDay";
import showSnackBar from "./snackBar";

let socket;
const { setDomains, setFetchedSectorIds, domains } = useDomain.getState()
const { setPending } = usePending.getState()
const { markSent } = usePending.getState()
const { user } = useUser.getState()
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
function midnightTimestamp() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
}
const ts = midnightTimestamp()

export const url = "http://172.24.7.133:3030/api/user"

export const initSocket = async (accessToken) => {
    if (!useToken.persist.hasHydrated) {
        await new Promise((resolve) => useToken.persist.onFinishHydration(resolve));
    }
    console.log("token hydration completed")
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
        console.log("token refreshed")
        // socket = await initSocket(res.accessToken)
        socket.auth.token = res.accessToken
        socket.connect()
        console.log("retrying socket connection")
        await setAccessToken(res.accessToken)
        return (res.accessToken)
    } else {
        if (res.message === "log in") {
            socket.disconnect()
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
};

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
        const httpCall = await fetch(`${url}/issue/${issue.sectorId}`, {
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
                                data: [...(s.data.filter(np => np?.id !== issue.id) || []), res.data] /////////
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
};

export const sendPendingVotes = async (issuesId) => {
    const { accessToken } = useToken.getState()
    const { setPendingVotes } = usePending()
    try {
        const httpCall = fetch(`${url}/user/issue`, {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
            method: "PATCH",
            body: JSON.stringify({ data: [...new Set(issuesId)] })
        })
        const res = await httpCall.json()
        if (res.exp) {
            let accessToken_ = await refreshAccessToken()
            if (accessToken_) {
                sendPendingVotes(issuesId)
            }
        }
        if (res.success === true) {
            setPendingVotes([])
        }
    } catch (err) {
        console.log(err)
    }
}

// createIssue.js
export const createIssue = async (textInput, imageData, sectorId, _id) => {
    const formData = new FormData();
    formData.append("note", textInput);
    imageData.forEach((i) => {
        formData.append("files", {
            uri: i.uri,
            type: i.type,
            name: `_id-${i.fileName}`,
        });
    });

    try {
        // throw new Error("Network request failed");
        const { accessToken } = useToken.getState()
        const httpCall = await fetch(`${url}/issue/${sectorId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
            body: formData,
        });
        const res = await httpCall.json();

        if (res.exp) {
            const accessToken_ = await refreshAccessToken();
            if (accessToken_) {
                return createIssue({
                    textInput,
                    imageData,
                    sectorId,
                    _id,
                });
            } else {
                console.log("repeat");
            }
        } else if (res.success === false) {
            showSnackBar("an error occured");
        } else if (res.success === true) {
            setDomains((prev) =>
                prev.map((d) => {
                    if (d._id !== _id) return d;
                    return {
                        ...d,
                        time: Date.now(),
                        sectors: d.sectors.map((s) => {
                            if (s._id !== res.data.sector_id) return s;
                            return {
                                ...s,
                                time: Date.now(),
                                data: [
                                    ...(s.data || []),
                                    ...(!isSameDay(s.time) ?
                                        [{ _id: Date.now().toString(), creator_id: "user", note: new Date(Date.now()).toLocaleDateString(), createdAt: ts }] : []),
                                    { ...res.data, time: Date.now() },
                                ],
                            };
                        }),
                    };
                })
            );
        }
    } catch (err) {
        if (err.message === "Network request failed") {
            const id = genId();
            setPending({
                id: id,
                domainId: _id,
                sectorId: sectorId,
                note: textInput,
                pictures: imageData,
            });
            setDomains((prev) =>
                prev.map((d) => {
                    if (d._id !== _id) return d;
                    return {
                        ...d,
                        time: Date.now(),
                        sectors: d.sectors.map((s) => {
                            if (s._id !== sectorId) return s;
                            return {
                                ...s,
                                time: Date.now(),
                                data: [
                                    ...(s.data || []),
                                    ...(!isSameDay(s.time) ?
                                        [{ _id: Date.now().toString(), creator_id: "user", note: new Date(Date.now()).toLocaleDateString(), createdAt: ts }] : []),
                                    { id: id, creator_id: user._id, sector_id: sectorId, note: textInput, pictures: imageData.map((i) => i.uri), time: Date.now() },
                                ],
                            };
                        }),
                    };
                })
            );
        }
    }
}

export const chat = async (textInput, imageData, sectorId, _id) => {
    const formData = new FormData();
    formData.append("note", textInput);
    imageData.forEach((i) => {
        formData.append("files", {
            uri: i.uri,
            type: i.type,
            name: `${_id}-${i.fileName}`,
        });
    });
    try {
        const { accessToken } = useToken.getState()
        const httpCall = await fetch(`${url}/issue/${sectorId}/cc`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
            body: formData,
        });
        const res = await httpCall.json();
        if (res.exp) {
            const accessToken_ = await refreshAccessToken();
            if (accessToken_) {
                return chat({ textInput, imageData, sectorId, _id, });
            } else {
                console.log("repeat");
            }
        } else if (res.success === false) {
            showSnackBar("an error occured");
        } else if (res.success === true) {
            setDomains((prev) =>
                prev.map((d) => {
                    if (d._id !== "ccccccc") return d;
                    return {
                        ...d,
                        time: Date.now(),
                        sectors: d.sectors.map((s) => {
                            if (s._id !== sectorId) return s;
                            return {
                                ...s,
                                time: Date.now(),
                                data: [
                                    ...(s.data || []),
                                    ...(!isSameDay(s.time) ?
                                        [{ _id: Date.now().toString(), creator_id: "user", note: new Date(Date.now()).toLocaleDateString(), createdAt: ts }] : []),
                                    { ...res.data, time: Date.now() },
                                ],
                            };
                        }),
                    };
                })
            );
        }
    } catch (err) {
        console.log(err)
    }
}
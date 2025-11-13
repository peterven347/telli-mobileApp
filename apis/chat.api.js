import * as Keychain from "react-native-keychain";
import { useDomain, usePending, useToken, useUser } from "../store/useStore";
import { isSameDay } from "../utils/isSameDay";
import showSnackBar from "../utils/snackBar";
import { disconnectSocket, refreshSocketToken, socketEmit } from "./socket";
import { url } from "./socket";

const CHAT_URL = `${url}/chat`
const { setDomains, setFetchedSectorIds } = useDomain.getState()
const { user } = useUser.getState()
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
function midnightTimestamp() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
};

export const refreshAccessToken = async () => {
    console.log("refreshing token")
    const { accessToken, setAccessToken } = useToken.getState()
    const refreshToken = await Keychain.getGenericPassword({ service: "refreshToken" });
    const httpCall = await fetch(`${url}/user/refresh-access-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken
        },
        body: JSON.stringify({
            refreshToken: refreshToken.password,
        })
    })
    const res = await httpCall.json()
    if (res.success === true) {
        console.log("token refreshed")
        refreshSocketToken(res.accessToken)
        console.log("retrying socket connection")
        await setAccessToken(res.accessToken)
        return (res.accessToken)
    } else {
        if (res.message === "log in") {
            disconnectSocket()
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

// export const sendPendingIssue = async (issue) => {
//     const { accessToken } = useToken.getState()
//     try {
//         const formData = new FormData()
//         formData.append("note", issue.note)
//         issue.pictures.forEach((i, index) => {
//             if (i.uri && typeof i.uri === "string") {
//                 formData.append("files", {
//                     uri: i.uri,
//                     type: i.type || "application/octet-stream",
//                     name: `_id-${i.fileName || `photo-${index}.jpg`}`
//                 });
//             } else {
//                 console.warn("Skipping invalid image:", i);
//             }
//         });

//         console.log("start sending...")
//         const httpCall = await fetch(`${url}/issue/${issue.sectorId}`, {
//             headers: {
//                 Authorization: "Bearer " + accessToken,
//             },
//             method: "POST",
//             body: formData
//         })
//         console.log("sending pending...", issue.id)
//         const res = await httpCall.json()
//         if (res.exp) {
//             let accessToken_ = await refreshAccessToken()
//             if (accessToken_) {
//                 sendPendingIssue(issue)
//             } else {
//                 console.log("repeat sendPendingIssue")
//             }
//         } else if (res.success === false && res.message === 'sector not found') { //check the message
//             await markSent(issue.id)
//         } else if (res.success === true) {
//             await markSent(issue.id)
//             setDomains(prev =>
//                 prev.map(d => {
//                     if (d._id !== issue.domainId) return d
//                     return {
//                         ...d,
//                         sectors: d.sectors.map(s => {
//                             if (s._id !== issue.sectorId) return s;
//                             return {
//                                 ...s,
//                                 time: Date.now(),
//                                 data: [...(s.data.filter(np => np?.id !== issue.id) || []), res.data] /////////
//                             };
//                         }),
//                     };
//                 })
//             );
//         }
//     }
//     catch (err) {
//         console.log(err)
//     }
// };

export const sendPendingVotes = async (issuesId) => {
    const { accessToken } = useToken.getState()
    const { setPendingVotes } = usePending()
    try {
        const httpCall = fetch(`${url}/issue`, {
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
};

export const emitMessage = async (message) => {
    const sectorId = message.sector_id
    const { accessToken } = useToken.getState()
    try {
        if (message.hasOwnProperty("uri")) {

            const formData = new FormData();
            formData.append("file", {
                uri: message.uri,
                type: message.type,
                name: message.name,
                // name: `${user._id}-${sectorId}-${message.name}`,
            });
            const httpCall = await fetch(`${url}/chat/message/${sectorId}`, {
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
                    httpCall();
                } else {
                    console.log("repeat");
                }
            } else if (res.success === false) {
                showSnackBar("an error occured");
            } else if (res.success === true) {
                const { note, ...rest } = message
                socketEmit("message", { ...rest, })
                console.log("uploaded file")
            }
        } else {
            const { uri, type, size, ...rest } = message
            socketEmit("message", rest)
        }
    } catch (err) {
        console.log(err)
    }
};

export const appendMessage = async (data, sectorId, _id) => {
    const message = typeof data === "string" ?
        {
            id: genId(),
            domainId: _id,
            sector_id: sectorId,
            creator_id: user._id,
            createdAt: Date.now(),
            note: data.trim()
        }
        :
        {
            id: genId(),
            domainId: _id,
            sector_id: sectorId,
            creator_id: user._id,
            createdAt: Date.now(),
            sourceUri: data.sourceUri || `file://${data.path}`,
            uri: data.localUri || `file://${data.path}`,
            type: data.type,
            name: data.name ? `${Date.now()}-${data.name}` : `${Date.now()}-Telli-img.jpg`,
            size: data.size
        }
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
                        time: s.time ? Date.now() > s.time ? Date.now() : s.time : Date.now(),
                        data: [
                            { ...message, name: data.name },
                            ...(!isSameDay(s.time) ?
                                [{ _id: Date.now().toString(), dateInfo: new Date(Date.now()).toLocaleDateString(), createdAt: midnightTimestamp() }] : []),
                            ...(s.data || []),
                        ],
                    };
                }),
            };
        })
    );
    emitMessage(message)
};

// export const chatt = async (textInput, imageData, sectorId, _id) => {
//     const formData = new FormData();
//     formData.append("note", textInput);
//     imageData.forEach((i) => {
//         formData.append("files", {
//             uri: i.uri,
//             type: i.type,
//             name: `${_id}-${i.fileName}`,
//         });
//     });
//     try {
//         const { accessToken } = useToken.getState()
//         const httpCall = await fetch(`${url}/issue/${sectorId}/cc`, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             },
//             method: "POST",
//             body: formData,
//         });
//         const res = await httpCall.json();
//         if (res.exp) {
//             const accessToken_ = await refreshAccessToken();
//             if (accessToken_) {
//                 return chat({ textInput, imageData, sectorId, _id, });
//             } else {
//                 console.log("repeat");
//             }
//         } else if (res.success === false) {
//             showSnackBar("an error occured");
//         } else if (res.success === true) {
//             setDomains((prev) =>
//                 prev.map((d) => {
//                     if (d._id !== "ccccccc") return d;
//                     return {
//                         ...d,
//                         time: Date.now(),
//                         sectors: d.sectors.map((s) => {
//                             if (s._id !== sectorId) return s;
//                             return {
//                                 ...s,
//                                 time: Date.now(),
//                                 data: [
//                                     ...(s.data || []),
//                                     ...(!isSameDay(s.time) ?
//                                         [{ _id: Date.now().toString(), creator_id: "user", note: new Date(Date.now()).toLocaleDateString(), createdAt: midnightTimestamp() }] : []),
//                                     { ...res.data, time: Date.now() },
//                                 ],
//                             };
//                         }),
//                     };
//                 })
//             );
//         }
//     } catch (err) {
//         console.log(err)
//     }
// }



// try {
//     // throw new Error("Network request failed");
//     const { accessToken } = useToken.getState()
//     console.log(.connected)
//     const httpCall = await fetch(`${url}/issue/${sectorId}`, {
//         headers: {
//             Authorization: `Bearer ${accessToken}`,
//         },
//         method: "POST",
//         body: formData,
//     });
//     const res = await httpCall.json();

//     if (res.exp) {
//         const accessToken_ = await refreshAccessToken();
//         if (accessToken_) {
//             return createIssue({
//                 textInput,
//                 imageData,
//                 sectorId,
//                 _id,
//             });
//         } else {
//             console.log("repeat");
//         }
//     }
//     else if (res.success === false) {
//         showSnackBar("an error occured");
//     } else if (res.success === true) {
//         setDomains((prev) =>
//             prev.map((d) => {
//                 if (d._id !== _id) return d;
//                 return {
//                     ...d,
//                     time: Date.now(),
//                     sectors: d.sectors.map((s) => {
//                         if (s._id !== res.data.sector_id) return s;
//                         return {
//                             ...s,
//                             time: Date.now(),
//                             data: [
//                                 ...(s.data || []),
//                                 ...(!isSameDay(s.time) ?
//                                     [{ _id: Date.now().toString(), creator_id: "user", note: new Date(Date.now()).toLocaleDateString(), createdAt: ts }] : []),
//                                 { ...res.data, time: Date.now() },
//                             ],
//                         };
//                     }),
//                 };
//             })
//         );
//     }
// } catch (err) {
//     if (err.message === "Network request failed") {
//         const id = genId();
//         setPending({
//             id: id,
//             domainId: _id,
//             sectorId: sectorId,
//             note: textInput,
//             pictures: imageData,
//         });
//         setDomains((prev) =>
//             prev.map((d) => {
//                 if (d._id !== _id) return d;
//                 return {
//                     ...d,
//                     time: Date.now(),
//                     sectors: d.sectors.map((s) => {
//                         if (s._id !== sectorId) return s;
//                         return {
//                             ...s,
//                             time: Date.now(),
//                             data: [
//                                 ...(s.data || []),
//                                 ...(!isSameDay(s.time) ?
//                                     [{ _id: Date.now().toString(), creator_id: "user", note: new Date(Date.now()).toLocaleDateString(), createdAt: ts }] : []),
//                                 { id: id, creator_id: user._id, sector_id: sectorId, note: textInput, pictures: imageData.map((i) => i.uri), time: Date.now() },
//                             ],
//                         };
//                     }),
//                 };
//             })
//         );
//     }
// }


let delay = 125
let totalTimeout = 0

// useEffect(() => {
//     let timer;
//     const timeout = totalTimeout
//     // console.log(fetchedSectorIds)
//     if (!fetchedSectorIds.includes(chatBoxSectorId)) {
//         timer = setTimeout(() => {
//             getIssue(currDomainId, chatBoxSectorId, skip)
//         }, timeout);
//         delay += 125;
//         totalTimeout += delay
//     }
//     return () => clearTimeout(timer)
// }, [currDomainId])
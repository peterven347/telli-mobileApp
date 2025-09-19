import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import { Alert, Dimensions, FlatList, Image, Linking, Modal, PermissionsAndroid, Platform, Pressable, Share, SectionList, StyleSheet, Text, TouchableOpacity, View, Keyboard } from "react-native"
import { Badge, Divider, Menu } from "react-native-paper"
import { dateFormatter } from "../../../../../utils/dateFormatter"
import { chat, getIssue, refreshAccessToken, url } from "../../../../../utils/https";
import { useChatBoxSectorId, useDomain, useSnackBar, usePending, useToken, useUser } from "../../../../../store/useStore";
import showSnackBar from "../../../../../utils/snackBar";
import AsyncStorage from "@react-native-async-storage/async-storage"
import Fea from "react-native-vector-icons/Feather"
import Mci from "react-native-vector-icons/MaterialCommunityIcons";
import Mi from "react-native-vector-icons/MaterialIcons";
import RNFS from "react-native-fs";
import ExitDomainModal from "../ExitDomainModal";
import CreateIssueModal from "../../live/TextBoard"
// import EditsectorModal from "./stackScreens/SectorDetail"
import EditDomainModal from "../EditDomainModal"
import Dropdown from "../../../../components/DropDown"

const { width, height } = Dimensions.get("screen")
const timeCompare = (dateString) => {
    if (!dateString || dateString.length < 8) return null;
    const timestampHex = dateString.substring(0, 8)
    const timestamp = parseInt(timestampHex, 16)
    const milliTime = timestamp * 1000
    const date = new Date(timestamp * 1000)
    return milliTime
}

const onShare = async (data) => {
    try {
        const result = await Share.share({
            message: data,
        });
        if (result.action === Share.sharedAction) {
            if (result.activityType) {
                // shared with activity type of result.activityType
            } else {
                // shared
            }
        } else if (result.action === Share.dismissedAction) {
            // dismissed
        }
    } catch (error) {
        Alert.alert(error.message);
    }
}

const syncVote = async (issue_id) => {
    const { setPendingVotes } = usePending()
    try {
        let accessToken = useToken.getState().accessToken
        const httpCall = await fetch(`${url}/user/${issue_id}`, {
            method: "PATCH",
            headers: {
                Authorization: "Bearer " + accessToken
            }
        })
        const res = await httpCall.json()
        if (res.exp) {
            let accessToken_ = await refreshAccessToken()
            if (accessToken_) {
                syncVote(issue_id)
            }
        }
    } catch (err) {
        console.log(err)
        if (err.message === "Network request failed") {
            setPendingVotes(issue_id)
        }
    }
}

const vote = async (issue_id) => {
    const { user, setUser } = useUser.getState()
    if (user.issues_voted?.includes(issue_id)) {
        setUser(prev => ({
            ...prev,
            issues_voted: prev.issues_voted.filter(i => i !== issue_id)
        }))
    } else {
        setUser(prev => ({
            ...prev,
            issues_voted: [...prev?.issues_voted, issue_id]
        }))
    }
    syncVote(issue_id)
}

const downloadFileFromServer = async (i, callback) => {
    const fileUrl = i
    const folderPath = `${RNFS.PicturesDirectoryPath}/Telli`
    const fileName = `${Date.now()}.jpg`
    const downloadDest = Platform.OS === "android"
        ? `${RNFS.PicturesDirectoryPath}/Telli/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/Telli${fileName}`
    // const requestPermission = async () => {
    //     if (Platform.OS === "android") {
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, // android 13
    //             PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    //             {
    //                 title: "Storage Permission",
    //                 message: "Telli needs access to your storage to download the image.",
    //                 buttonNeutral: "Ask Me Later",
    //                 buttonNegative: "Cancel",
    //                 buttonPositive: "OK",
    //             }
    //         );
    //         return granted === PermissionsAndroid.RESULTS.GRANTED;
    //     }
    //     return true;
    // }


    // const hasPermission = await requestPermission()
    // if (!hasPermission) {
    //     Alert.alert(
    //         "Permission required",
    //         "Telli needs access to your storage to download the image.",
    //         [
    //             { text: "Cancel", style: "cancel" },
    //             { text: "Open Settings", onPress: () => Linking.openSettings() },
    //         ],
    //     )
    //     return
    // }

    try {
        const exists = await RNFS.exists(folderPath);
        if (!exists) {
            await RNFS.mkdir(folderPath);
        }
        const result = await RNFS.downloadFile({
            fromUrl: fileUrl,
            toFile: downloadDest,
        }).promise;

        if (result.statusCode === 200) {
            // Alert.alert("Success", `File saved to: ${downloadDest}`);
            callback("Image saved!")
        } else {
            throw new Error(`Download failed with status ${result.statusCode}`);
        }
    } catch (err) {
        Alert.alert("Error", "an error occured, try again later.");
    }
}

const MemoizedImage = memo(({ uri, index, len }) => {
    const { accessToken } = useToken()
    return (
        <View activeOpacity={0.7} style={{
            ...styles.img,
            borderEndStartRadius:
                len === 1 ? null :
                    len === 2 ? index === 0 ? 0 : null :
                        len === 3 ? index === 0 ? 0 : null :
                            len === 4 ? index === 0 || index === 2 ? 0 : null : null,
            borderEndEndRadius:
                len === 1 ? null :
                    len === 2 ? index === 0 ? 0 : null :
                        len === 3 ? index === 0 ? 0 : null :
                            len === 4 ? index === 0 || index === 2 ? 0 : null : null,
            borderStartEndRadius:
                len === 1 ? null :
                    len === 2 || len === 3 ? index === 1 ? 1 : null :
                        len === 4 ? index === 1 || index === 3 ? 0 : null : null,
            borderStartStartRadius:
                len === 1 ? null :
                    len === 2 || len === 3 ? index === 1 ? 0 : null :
                        len === 4 ? index === 1 || index === 3 ? 0 : null : null,
            borderBottomStartRadius:
                len === 3 || len === 4 ? index === 0 || index === 1 ? 0 : null : null,
            borderBottomEndRadius:
                len === 3 || len === 4 ? index === 0 || index === 1 ? 0 : null : null,
            borderTopStartRadius:
                len === 3 || len === 4 ? index === 2 || index === 3 ? 0 : null : null,
            borderTopEndRadius:
                len === 3 || len === 4 ? index === 2 || index === 3 ? 0 : null : null
        }}
        >
            <Image source={{ uri, headers: { Authorization: "Bearer " + accessToken } }} style={{ width: "100%", height: "100%" }} />
        </View>
    )
})

const CurrDomainHeader = memo(({ i }) => {
    const { domains, currDomainId } = useDomain()
    const currDomain = domains.find(i => i._id === currDomainId)
    return (
        <View key={i._id} style={styles.currDomainHeader}>
            <View style={{ width: "95%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>{currDomain.domain}</Text>
            </View>
            <Text>{(currDomain.sectors?.length)} sectors {"  "}
                {currDomain.sectors?.reduce?.((acc, i) => {
                    return (
                        acc + i.data?.length
                    )
                }, 0)} issues
            </Text>
            <Text style={{ fontSize: 10 }}>created {dateFormatter(currDomain?._id)}</Text>
            <Divider style={{ marginHorizontal: -50, backgroundColor: "#66f", marginBottom: 8 }} />
        </View>
    )
})

let delay = 125
let totalTimeout = 0
const RenderSectionHeader = memo(({ navigation, _id, title}) => {
    const { currDomainId, fetchedSectorIds } = useDomain.getState()
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
    // }, [currDomainId]) //currDomainId doesnt rerender when sector is switched with dropdown
    const handlePress = () => {
        if (currDomainId === "ccccccc" && title !== "AI") {
            navigation.navigate("live", { screen: "profile", params: { _id: _id, title: title, routeName: "main" } })
        } else if (currDomainId === "ccccccc" && title === "AI") {
        } else {
            navigation.navigate("sectorDetail", {})
            // setTitle(title);
            // setEditSectorModalVisible(true)
        }
    }
    return (
        <Pressable style={styles.sectionHeader} onPress={handlePress} >
            <Image source={require("../../../../assets/images/rrrrr.jpg")} style={styles.sectorLogo} />
            <Text numberOfLines={1} style={{ fontWeight: "600", backgroundColor: title === "AI" ? "#66b" : "transparent", marginStart: 4, borderRadius: 2 }}>{title}</Text>
        </Pressable>
    )
})

const RenderItem = ({ item, setChatBoxSectorId, setChatBoxVisible }) => {
    const { snackBar, setSnackBar } = useSnackBar();
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width)
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height)
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [layoutReady, setLayoutReady] = useState(false);
    const [showList, setShowList] = useState(false);
    const flatListRef = useRef(null);
    const currentIndexRef = useRef(0);
    const vote_percent = item.resolved

    const pictures = useMemo(
        () => item.pictures?.map((i) => (item._id ? `${url}/img-file/issuesImg/${i}` : i)) ?? [],
        [item]
    );

    useEffect(() => {
        setTimeout(() => setShowList(prev => !prev));
    }, [modalVisible]);

    useEffect(() => {
        if (modalVisible && layoutReady) {
            flatListRef.current?.scrollToIndex({
                index: selectedIndex,
                animated: false,
            });
        }
    }, [showList]);

    useEffect(() => {
        const onChange = ({ window }) => {
            setScreenWidth(window.width)
            setScreenHeight(window.height)
            // flatListRef.current.scrollToIndex({
            //     index: currentIndexRef.current,
            //     animated: false,
            // })
        }
        const subscription = Dimensions.addEventListener('change', onChange)
        return () => subscription?.remove()
    }, [])

    return (
        <View>
            <Modal
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                transparent={false}
            >
                <View style={styles.fullscreenContainer}>
                    <View style={styles.fullscreenIcons}>
                        <Fea name="download" size={28} color="#fff" onPress={() => { downloadFileFromServer(`${url}/img-file/issuesImg/${modalImgList[0]}`, showSnackBar("test", setSnackBar)) }} />
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={pictures}
                        horizontal
                        pagingEnabled
                        initialScrollIndex={currentIndexRef.current}
                        keyExtractor={(item, index) => item + index}
                        getItemLayout={(_, index) => ({
                            length: screenWidth,
                            offset: screenWidth * index,
                            index,
                        })}
                        onLayout={() => setLayoutReady(true)}
                        showsHorizontalScrollIndicator={false}
                        onViewableItemsChanged={({ viewableItems }) => {
                            if (viewableItems?.length > 0) {
                                currentIndexRef.current = viewableItems[0].index;
                            }
                        }}
                        renderItem={({ item }) => (
                            <Image
                                source={{ uri: item }}
                                resizeMode="contain"
                                style={{ width: screenWidth, height: screenHeight }}
                            />
                        )}
                    />
                </View>

                {snackBar && ( ///////////////////////////////
                    <View style={styles.snackBar}>
                        <Text style={{ textAlign: "center", color: "#fff" }}>
                            {snackBar.text}
                        </Text>
                    </View>
                )}
            </Modal>

            <Pressable hitSlop={2} onPress={() => { setChatBoxSectorId(item.sector_id); setChatBoxVisible(true) }}>
                <Text numberOfLines={6} style={styles.note}>{item.note}</Text>
                <View style={{ width: "82%", flexDirection: "row", flexWrap: "wrap" }}>
                    {pictures?.map((i, index) => (<MemoizedImage key={i} index={index} len={item.pictures?.length} uri={i} />))}
                </View>
                <View style={{ paddingStart: 4 }}>
                    {
                        item._id ? <Text style={{ fontSize: 10, color: "#000a", position: "relative", top: 16, start: 3 }}>{dateFormatter(item?._id)}</Text>
                            : <Mci name="timer-sand" size={13} color="#999" style={{ position: "relative", top: 15 }} />
                    }
                </View>
            </Pressable>
        </View>
    );
};

export default function SideComponent({ navigation, dropVisible, setDropVisible, chatBoxVisible, setChatBoxVisible }) {
    const { domains, setDomains, currDomainId, setCurrDomainId } = useDomain()
    const { chatBoxSectorId, setChatBoxSectorId } = useChatBoxSectorId()
    const [title, setTitle] = useState("")
    const [menuVisible, setMenuVisible] = useState(false)
    const [issueModalVisible, setIssueModalVisible] = useState(false)
    const [editDomainModalVisible, setEditDomainModalVisible] = useState(false)
    const [exitDomainModalVisible, setExitDomainModalVisible] = useState(false)
    const [editSectorModalVisible, setEditSectorModalVisible] = useState(false)

    let currDomain = domains.find(i => i._id === currDomainId)
    let pinnedCount = (Array.isArray(domains) ? domains : []).reduce((acc, i) => {
        return i.pinned ? acc + 1 : acc;
    }, 0)

    const hideMenu = () => {
        setTimeout(() => {
            setMenuVisible(false)
        }, 300)
    }
    const pinDomain = async (_id) => {
        setDomains((prev) => {
            const target = prev.find((item) => item._id === _id);
            if (pinnedCount >= 5 && target && !target.pinned) {
                showSnackBar("You can only pin up to 5 domains")
                return prev;
            }
            const updatedDomains = prev.map((item) => {
                if (item._id === _id) {
                    return {
                        ...item,
                        pinned: !item.pinned,
                    };
                }
                return item;
            });
            const updated = updatedDomains.find(i => i._id === currDomainId);
            if (updated) {
                setCurrDomainId(updated._id);
            }
            const pinned = updatedDomains.filter(i => i.pinned === true).map(j => j._id)
            AsyncStorage.setItem("pinned", JSON.stringify(pinned))
            return updatedDomains;
        });
        hideMenu()
    }

    const sections = currDomain?.sectors
        ?.filter(i => (chatBoxSectorId && !chatBoxVisible ? i._id === chatBoxSectorId : true))
        ?.sort((a, b) => (b.time || timeCompare(b._id)) - (a.time || timeCompare(a._id)))
        ?.map(sector => ({
            ...sector,
            title: sector.title,
            data: sector.data?.filter(i => i.creator_id !== "user").length ? [sector.data[0]] : [],
        })) ?? []

    return (
        <View style={{ width: "100%", marginStart: 75, flex: 1 }}>
            <View>
                {editDomainModalVisible && <EditDomainModal _id={currDomainId} editDomainModalVisible={editDomainModalVisible} setEditDomainModalVisible={setEditDomainModalVisible} />}
                {exitDomainModalVisible && <ExitDomainModal _id={currDomainId} domain={currDomain?.domain} exitDomainModalVisible={exitDomainModalVisible} setExitDomainModalVisible={setExitDomainModalVisible} />}
            </View>

            <View style={styles.menuBar}>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    contentStyle={{ backgroundColor: "#444" }}
                    style={{ backgroundColor: "transparent", width: 80, paddingStart: 34 }}
                    anchor={currDomain ?
                        <View style={{ flexDirection: "row", columnGap: 16 }}>
                            <Dropdown
                                dropVisible={dropVisible} setDropVisible={setDropVisible}
                                chatBoxSectorId={chatBoxSectorId} setChatBoxSectorId={setChatBoxSectorId}
                                data={currDomain?.sectors?.map(i => ({ _id: i._id, title: i.title }))}
                            />
                            <Pressable hitSlop={2}>
                                <Mci name="dots-vertical" size={24} color="#444" onPress={() => setMenuVisible(prev => !prev)} />
                            </Pressable>
                        </View>
                        : null
                    }
                >
                    <Menu.Item leadingIcon={() => <Mci name="plus" color="#eee" size={22} />} onPress={() => { navigation.navigate("addSector", { _id: currDomainId, status: currDomain.status }); hideMenu() }} />
                    <Menu.Item leadingIcon={() => <Mci name={currDomain?.pinned ? "pin-off" : "pin"} color="#eee" size={22} />} onPress={() => { pinDomain(currDomainId) }} />
                    <Menu.Item leadingIcon={() => <Mci name="share-variant-outline" size={18} color="#eee" />} onPress={() => { hideMenu(); onShare(currDomain.domain) }} />
                    <Menu.Item leadingIcon={() => <Mci name="square-edit-outline" color="#eee" size={22} />} onPress={() => { setEditDomainModalVisible(true); hideMenu() }} />
                    <Menu.Item leadingIcon={() => <Mci name="logout" color="#eee" size={22} />} onPress={() => { setExitDomainModalVisible(true); hideMenu() }} />
                </Menu>
            </View>

            {domains && currDomainId && (
                (() => {
                    const matchedDomain = Array.isArray(domains) && domains.find(i => i._id === currDomainId) // why domains...
                    return matchedDomain ? (<CurrDomainHeader key={matchedDomain._id} i={matchedDomain} />) : null;
                })()
            )}

            <Pressable style={{ flex: 1 }} onPress={() => { dropVisible && setDropVisible(false) }}>
                <SectionList
                    showsVerticalScrollIndicator={false}
                    sections={sections}
                    keyExtractor={(item) => item._id || item.id}
                    renderItem={({ item }) => (<>
                        <RenderItem item={item} setChatBoxSectorId={setChatBoxSectorId} setChatBoxVisible={setChatBoxVisible} />
                    </>)}

                    renderSectionHeader={({ section: { _id, title } }) => (<>
                        <RenderSectionHeader navigation={navigation} _id={_id} title={title} setTitle={setTitle} setEditSectorModalVisible={setEditSectorModalVisible} />
                    </>
                    )}

                    renderSectionFooter={({ section: { _id, unread, time } }) => (<>
                        <View style={styles.footer}>
                            <View>
                            </View>
                            <Pressable hitSlop={2} onPress={() => { setChatBoxSectorId(_id); setChatBoxVisible(true) }} style={styles.noteIcon}>
                                {unread >= 1 ? <Badge size={14} style={{ color: "#fff", backgroundColor: "#66b", marginTop: 3, marginBottom: 1, marginEnd: 4 }} >{unread}</Badge>
                                    :
                                    <Mi name="notes" size={16} color="#999" />
                                }
                            </Pressable>
                        </View>
                    </>)}

                    ListEmptyComponent={
                        <View style={{ flex: 1, marginEnd: "20%", marginTop: "18%" }}>
                            {/* <Image source={require("../../../assets/images/1749405736001.png")} style={styles.welcomeImg} /> */}
                            <Text style={{ textAlign: "center", fontWeight: 600, letterSpacing: 2 }}>
                                <Text style={{ color: "#66b" }}>hi</Text>
                                <Text style={{ color: "#6eafb2" }}>riis</Text>
                            </Text>
                        </View>
                    }
                    style={styles.sectionList}
                />
            </Pressable>
            {currDomainId === "ccccccc" &&
                <TouchableOpacity style={styles.addContact} onPress={() => { navigation.navigate("addContacts", { _id: "ccccccc" }) }}>
                    <Text style={{ fontSize: 20, width: "50%", height: "50%", textAlign: "center", textAlignVertical: "center" }}>💬</Text>
                </TouchableOpacity>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    addContact: {
        width: 50,
        height: 50,
        backgroundColor: "#00fa",
        borderRadius: 25,
        position: "absolute",
        bottom: 24,
        right: 114,
        justifyContent: "center",
        alignItems: "center"
    },
    currDomainHeader: {
        paddingStart: 4,
        paddingTop: 8,
        width: "100%",
        backgroundColor: "#fff",
    },
    footer: {
        width: width - 75,
        // height: "auto",
        // flex: 1,
        borderBottomWidth: 0.3,
        borderBottomColor: "#ddd",
        marginBottom: 6,
        paddingBottom: 2,
        paddingEnd: 12,
        // backgroundColor: "red",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end"
    },
    footerTime: {
        fontSize: 10,
        color: "#000a",
        // position: "relative",
        start: 7
        // bottom: 0,
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    fullscreenIcons: {
        position: "absolute",
        top: 30,
        start: 22,
        zIndex: 1,
        columnGap: 20,
        flexDirection: "row",
    },
    img: {
        width: "48%",
        height: 110,
        borderRadius: 4,
        marginRight: 2,
        marginBottom: 2,
        backgroundColor: "#ddd",
        flexGrow: 1,
    },
    menuBar: {
        width: "36%",
        marginTop: 6,
        position: "absolute",
        zIndex: 2,
        alignSelf: "flex-end"
    },
    note: {
        fontSize: 14,
        marginStart: 6,
        marginEnd: 88,
        fontWeight: '500',
        lineHeight: 20,
        color: '#0f1419',
        letterSpacing: 0.2,
        // backgroundColor: "red"
    },
    noteIcon: {
        width: 20,
        // flexDirection: "row",
        // paddingEnd: "5%",
        // marginEnd: "16%",
        // alignSelf: "flex-end",
        // justifyContent: "flex-end",
        // backgroundColor: "blue"
    },
    sectionList: {
        width: "100%",
        paddingStart: 4,
        backgroundColor: "#fff",
        paddingEnd: 6,
    },
    sectionHeader: {
        width: "70%",
        paddingEnd: 14,
        // backgroundColor: "#fff",
        flexDirection: "row",
        columnGap: 1,
        alignItems: "center",
    },
    sectorLogo: {
        width: 34,
        height: 34,
        borderRadius: 17
    },
    snackBar: {
        width: 150,
        alignSelf: "center",
        position: "absolute",
        bottom: 24
    },
    welcomeImg: {
        width: 120,
        height: 120,
        marginTop: height / 2.9,
        alignSelf: "center",
        opacity: 0.2
    },
})
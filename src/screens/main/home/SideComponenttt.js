import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import { Alert, Dimensions, FlatList, Image, Linking, Modal, PermissionsAndroid, Platform, Pressable, Share, SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Avatar, Divider, Menu } from "react-native-paper"
import { dateFormatter } from "../../../../utils/dateFormatter"
import { url } from "../../../../utils/https";
import { useDomain, useSnackBar, useToken, useUser } from "../../../../store/useStore";
import showSnackBar from "../../../../utils/SnackBar";
import AsyncStorage from "@react-native-async-storage/async-storage"
import Fea from "react-native-vector-icons/Feather"
import Mci from "react-native-vector-icons/MaterialCommunityIcons";
import Mi from "react-native-vector-icons/MaterialIcons";
import RNFS from "react-native-fs";
import ExitDomainModal from "./ExitDomainModal";
import CreateIssueModal from "./CreateIssueModal"
import EditsectorModal from "./EditSectorModal"
import EditDomainModal from "./EditDomainModal"
import Dropdown from "../../../components/DropDown";

const { width, height } = Dimensions.get("screen")

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

const vote = async (issues_id) => {
    const { user, setUser } = useUser.getState()
    if (user?.issues_voted?.includes(issues_id)) {
        setUser(prev => ({
            ...prev,
            issues_voted: prev.issues_voted.filter(i => i !== issues_id)
        }))
    } else {
        console.log(2)
        setUser(prev => ({
            ...prev,
            issues_voted: [...prev?.issues_voted, issues_id]
        }))
        console.log(3)
    }
    try {
        let accessToken = useToken.getState().accessToken
        const httpCall = await fetch(`${url}/user/${issues_id}`, {
            method: "PATCH",
            headers: {
                Authorization: "Bearer " + accessToken
            }
        })
        const res = await httpCall.json()
        if (res.exp) {
            let accessToken_ = await refreshAccessToken()
            if (accessToken_) {
                vote(issues_id)
            }
        }
    } catch (err) {
        console.log(err)
    }
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

const MemoizedImage = memo(({ uri, fn, index, len }) => {
    const { accessToken } = useToken()
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={fn} style={{
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
        </TouchableOpacity>
    )
})

const CurrDomainHeader = memo(({ i }) => {
    const { domains, currDomainId } = useDomain()
    const currDomain = domains.find(i => i._id === currDomainId)
    return (
        <>
            <View key={i._id} style={styles.sideComponent}>
                <View style={{ width: "95%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>{currDomain.domain}</Text>
                </View>
                <Text>{(currDomain.sectors?.length)} sectors {"  "}
                    {currDomain.sectors?.reduce((acc, i) => {
                        return (
                            acc + i.data?.length
                        )
                    }, 0)} issues
                </Text>
                <Text style={{ fontSize: 10 }}>created {dateFormatter(currDomain?._id)}</Text>
                <Divider style={{ marginHorizontal: -50, backgroundColor: "#66f", marginBottom: 8 }} />
            </View>
        </>
    )
})

const RenderItem = memo(({ item }) => {
    const { snackBar, setSnackBar } = useSnackBar()
    const { user } = useUser()
    const [modalImg, setModalImg] = useState("")
    const [modalImgList, setModalImgList] = useState([])
    const [noOfLines, setNoOfLines] = useState({})
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width)
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height)
    const vote_percent = item.resolved
    const currentIndexRef = useRef(0)
    const flatListRef = useRef(null)
    const onViewRef = useRef(({ viewableItems }) => {
        if (viewableItems?.length > 0) {
            currentIndexRef.current = viewableItems[0].index
            console.log(currentIndexRef.current)
        }
    })

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
        <>
            <Modal visible={!!modalImg} onRequestClose={() => setModalImg("")} transparent={false}>
                <View style={styles.fullscreenContainer}>
                    <View style={styles.fullscreenIcons}>
                        <Fea name="download" size={28} color="#fff" onPress={() => { downloadFileFromServer(`${url}/img-file/issuesImg/${modalImg}`, showSnackBar("test", setSnackBar)) }} />
                    </View>
                    <FlatList
                        ref={flatListRef}
                        // data={[modalImg, ...item.pictures.map(i => item._id ? `${url}/img-file/issuesImg/${i}` : i).filter( j => j !== modalImg)]}
                        data={[modalImg]}
                        // horizontal
                        pagingEnabled
                        keyExtractor={(_, index) => index.toString()}
                        // getItemLayout={(data, index) => ({ // variable dimension of image
                        //     length: screenWidth,
                        //     offset: screenWidth * index,
                        //     index
                        // })}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <Image key={item} source={{ uri: item }} resizeMode="contain" style={{ width: screenWidth, height: screenHeight, marginBottom: 4 }} />
                        )}
                        onViewableItemsChanged={onViewRef.current}
                    />
                </View>
                {snackBar && <View style={styles.snackBar}>
                    <Text style={{ textAlign: "center", color: "#fff" }}>{snackBar.text}</Text>
                </View>}
            </Modal>

            <Pressable onLongPress={() => { }} style={{ paddingEnd: 1 }}>
                <View style={styles.renderNote}>
                    <Avatar.Text size={4} label="" marginTop={7.5} marginRight={2} backgroundColor={
                        vote_percent < 25 ? "#FF0000" :
                            vote_percent >= 25 && vote_percent < 50 ? "#FF7F00" :
                                vote_percent >= 50 && vote_percent < 75 ? "#FFFF00" :
                                    vote_percent >= 75 && vote_percent < 90 ? "#7FFF00" :
                                        vote_percent >= 90 ? "#00FF00" : ""
                    } />
                    <Text
                        style={styles.note}
                        numberOfLines={
                            noOfLines[item._id] ? undefined : item.pictures?.length === 0 ? 10 : 6
                        }
                        onPress={() => {
                            setNoOfLines(prev => ({
                                ...prev,
                                [item._id]: !prev[item._id]
                            }));
                        }}
                    >
                        {item.note}
                        {/* {`${item.voters_count} / ${noOfDelegates}`} */}
                    </Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {item.pictures?.map((i, index) => (
                        <MemoizedImage key={i} index={index} len={item.pictures?.length} uri={item._id ? `${url}/img-file/issuesImg/${i}` : i} fn={() => { setModalImg(i) }} />
                    ))}
                </View>
                <View style={styles.shareView}>
                    {
                        item._id ? <Text style={{ fontSize: 10, minWidth: "20%", color: "#000a" }}>{dateFormatter(item?._id)}</Text>
                            : <Mci name="timer-sand" size={12} color="#999" onPress={() => console.log(item)} />
                    }
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {item._id &&
                            <>
                                <Mci name={user?.issues_voted?.includes(item._id) ? "checkbox-marked" : "checkbox-blank-outline"} size={28} color={user?.issues_voted?.includes(item._id) ? "#6eafb2" : "#888"} marginEnd={18} onPress={() => vote(item?._id)} />
                                <Mci name="share-variant-outline" size={18} color="#777" onPress={() => { onShare(item?.note) }} />
                            </>
                        }
                    </View>
                </View>
            </Pressable >
        </>
    )
})

export default function SideComponent({ navigation, dropVisible, setDropVisible }) {
    const { domains, setDomains, currDomainId, setCurrDomainId } = useDomain()
    const { setSnackBar } = useSnackBar()
    const [title, setTitle] = useState("")
    const [sectorId, setSectorId] = useState("")
    const [issueModalVisible, setIssueModalVisible] = useState(false)
    const [editDomainModalVisible, setEditDomainModalVisible] = useState(false)
    const [exitDomainModalVisible, setExitDomainModalVisible] = useState(false)
    const [editSectorModalVisible, setEditSectorModalVisible] = useState(false)
    const [menuVisible, setMenuVisible] = useState(false)
    const [clickedTitle, setClickedTitle] = useState("")

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
            if (pinnedCount >= 3 && target && !target.pinned) {
                showSnackBar("You can only pin up to 3 domains")
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

    useEffect(() => {
        setClickedTitle("")
    }, [currDomain])
    // console.log(domains[0].sectors)

    return (
        <>
            <View>
                <EditsectorModal _id={currDomainId} title={title} editSectorModalVisible={editSectorModalVisible} setEditSectorModalVisible={setEditSectorModalVisible} navigation={navigation} />
                <CreateIssueModal title={title} _id={currDomainId} sectorId={sectorId} issueModalVisible={issueModalVisible} setIssueModalVisible={setIssueModalVisible} />
                <EditDomainModal _id={currDomainId} editDomainModalVisible={editDomainModalVisible} setEditDomainModalVisible={setEditDomainModalVisible} />
                <ExitDomainModal _id={currDomainId} domain={currDomain?.domain} exitDomainModalVisible={exitDomainModalVisible} setExitDomainModalVisible={setExitDomainModalVisible} />
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
                                clickedTitle={clickedTitle} setClickedTitle={setClickedTitle}
                                data={currDomain?.sectors?.map(i => i.title)} />
                            <Mci name="dots-vertical" size={24} color="#444" onPress={() => setMenuVisible(prev => !prev)} />
                        </View> : null
                    }
                >
                    <Menu.Item leadingIcon={() => <Mci name="plus" color="#eee" size={22} />} onPress={() => { navigation.navigate("addSector", { _id: currDomainId, status: currDomain.status }); hideMenu() }} />
                    <Menu.Item leadingIcon={() => <Mci name="content-copy" color="#eee" size={22} />} onPress={() => { showSnackBar("link copied!", setSnackBar); hideMenu() }} />
                    <Menu.Item leadingIcon={() => <Mci name={currDomain?.pinned ? "pin-off" : "pin"} color="#eee" size={22} />} onPress={() => { pinDomain(currDomainId) }} />
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
            <SectionList
                sections={domains?.find(i => i._id === currDomainId)?.sectors?.filter(i => clickedTitle ? i.title === clickedTitle : true) ?? []}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item, section }) => <RenderItem item={item} />}
                renderSectionHeader={({ section: { title, _id } }) => (
                    <View style={styles.sectionHeader}>
                        <Pressable onPress={() => { setTitle(title); setSectorId(_id); setEditSectorModalVisible(true) }}>
                            <Text style={{ fontWeight: "600", backgroundColor: "#eee8", paddingHorizontal: 4, borderRadius: 2 }}>{title}</Text>
                        </Pressable>
                        <Pressable onPress={() => { setTitle(title); setSectorId(_id); setIssueModalVisible(true) }} style={{ paddingStart: "10%" }}>
                            <Mi name="notes" size={16} marginTop={3} />
                        </Pressable>
                    </View>
                )}
                renderSectionFooter={() => <Divider style={{ marginVertical: 16, backgroundColor: "#66f3" }} />}
                ListEmptyComponent={
                    <View style={{ marginEnd: 48 }}>
                        <Image source={require("../../../assets/images/1749405736001.png")} style={styles.welcomeImg} />
                        <Text style={{ textAlign: "center", fontWeight: 500 }}>
                            <Text style={{ color: "#66b" }}>Tell it,  </Text>
                            <Text style={{ color: "#6eafb2" }}>Fix it...</Text>
                        </Text>
                    </View>
                }
                stickySectionHeadersEnabled={true}
                style={styles.sectionList}
            />
        </>
    )
}

const styles = StyleSheet.create({
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
        height: 130,
        borderRadius: 4,
        marginRight: 2,
        marginBottom: 2,
        backgroundColor: "#ddd",
        flexGrow: 1,
    },
    menuBar: {
        width: "100%",
        paddingEnd: 14,
        marginTop: 6,
        position: "absolute",
        zIndex: 1,
        alignItems: "flex-end"
    },
    note: {
        width: "97%",
        marginBottom: 3,
        fontWeight: 400,
        color: "#333"
        // textAlign: "justify",
    },
    renderNote: {
        paddingRight: 8,
        flexDirection: "row",
    },
    sideComponent: {
        paddingStart: 80,
        paddingTop: 8,
        width: "100%",
        backgroundColor: "#fff",
    },
    sectionList: {
        width: "100%",
        paddingStart: 80,
        backgroundColor: "#fff",
        paddingEnd: 6,
    },
    sectionHeader: {
        width: "100%",
        paddingEnd: 14,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    shareView: {
        height: 30,
        paddingStart: 7,
        paddingEnd: 14,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

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
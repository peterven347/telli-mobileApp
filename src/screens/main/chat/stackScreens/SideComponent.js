import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import { Alert, Dimensions, FlatList, Image, Linking, Modal, PermissionsAndroid, Platform, Pressable, Share, SectionList, StyleSheet, Text, TouchableOpacity, View, Keyboard } from "react-native"
import { Badge, Divider, Menu } from "react-native-paper"
import { dateFormatter } from "../../../../../utils/dateFormatter"
import { refreshAccessToken } from "../../../../../apis/chat.api";
import { url } from "../../../../../apis/socket";
import { useChatBoxSectorId, useDomain, useSnackBar, usePending, useToken, useUser } from "../../../../../store/useStore";
import showSnackBar from "../../../../../utils/snackBar";
import AsyncStorage from "@react-native-async-storage/async-storage"
import Fea from "react-native-vector-icons/Feather"
import Mci from "react-native-vector-icons/MaterialCommunityIcons";
import Mi from "react-native-vector-icons/MaterialIcons";
import RNFS from "react-native-fs";
import ExitDomainModal from "../ExitDomainModal";
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

const RenderItem = ({ navigation, _id, title, currDomainId, logo, unread, item, setChatBoxSectorId, setChatBoxVisible, setFocusTextInput }) => {
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
        <View>
            <Pressable style={styles.sectionHeader} onPress={handlePress} >
                <Image source={{ uri: `${url}/files/domainLogo/${logo}`, headers: { Authorization: "Bearer " + "accessToken" } }} style={styles.sectorLogo} />
                <Text style={{ fontWeight: "600", backgroundColor: title === "AI" ? "#66b" : "transparent", marginStart: 4, borderRadius: 2 }}>{title}</Text>
            </Pressable>

            <Pressable style={{ paddingVertical: 6 }} hitSlop={2} onPress={() => { setChatBoxSectorId(_id); setChatBoxVisible(true) }}>
                <Text numberOfLines={6} style={styles.note}>
                    {item.note ? item.note
                        : item.type?.startsWith("image") ? '📷'
                            : item.type?.startsWith("audio") ? '⏺️'
                                : item.type?.startsWith("video") ? '🎞️'
                                    : '📄'
                    }
                </Text>
            </Pressable>

            <View style={styles.footer}>
                <View>
                    <Text style={{ fontSize: 10, color: "#000a" }}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
                    {/* <Text style={{ fontSize: 10, color: "#000a", position: "relative", top: 16, start: 3 }}>{item._id ? dateFormatter(item?.createdAt) || dateFormatter(item._id) : "--:--"}</Text> */}
                </View>

                <Pressable hitSlop={6} onPress={() => { setFocusTextInput(true); setChatBoxSectorId(_id); setChatBoxVisible(true) }} style={styles.noteIcon}>
                    {unread >= 1 ? <Badge size={14} style={{ color: "#fff", backgroundColor: "#66b", marginTop: 3, marginBottom: 1, marginEnd: 4 }} >{unread}</Badge>
                        :
                        <Mi name="notes" size={16} color="#999" />
                    }
                </Pressable>
            </View>
        </View>
    );
};

export default function SideComponent({ navigation, dropVisible, setDropVisible, chatBoxVisible, setChatBoxVisible, setFocusTextInput }) {
    const { domains, setDomains, currDomainId, setCurrDomainId } = useDomain()
    const { chatBoxSectorId, setChatBoxSectorId } = useChatBoxSectorId()
    const [menuVisible, setMenuVisible] = useState(false)
    const [editDomainModalVisible, setEditDomainModalVisible] = useState(false)
    const [exitDomainModalVisible, setExitDomainModalVisible] = useState(false)

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
                    <Menu.Item leadingIcon={() => <Mci name="plus" color="#eee" size={22} />} onPress={() => {
                        hideMenu();
                        currDomainId === "ccccccc" ?
                            navigation.navigate("addContacts", { _id: "ccccccc" })
                            :
                            navigation.navigate("addSector", { _id: currDomainId, status: currDomain.status });
                    }} />
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
                    renderItem={({ section: { _id, title, logo, unread }, item }) => (<>
                        <RenderItem
                            navigation={navigation}
                            _id={_id}
                            title={title}
                            logo={logo}
                            unread={unread}
                            item={item}
                            currDomainId={currDomainId}
                            setChatBoxSectorId={setChatBoxSectorId}
                            setChatBoxVisible={setChatBoxVisible}
                            setFocusTextInput={setFocusTextInput}
                        />
                    </>)}

                    ListEmptyComponent={
                        <View style={{ flex: 1, marginEnd: "20%", marginTop: "18%" }}>
                            <Text style={{ textAlign: "center", fontWeight: 600, letterSpacing: 2 }}>
                                <Text style={{ color: "#66b" }}>hi</Text>
                                <Text style={{ color: "#6eafb2" }}>riis</Text>
                            </Text>
                        </View>
                    }
                    style={styles.sectionList}
                />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    currDomainHeader: {
        paddingStart: 4,
        paddingTop: 8,
        width: "100%",
        backgroundColor: "#fff",
    },
    footer: {
        width: width - 75,
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
    fullscreenContainer: {
        flex: 1,
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
        marginStart: 2,
        marginEnd: 88,
        fontWeight: '500',
        lineHeight: 20,
        color: '#0f1419',
        letterSpacing: 0.2,
    },
    noteIcon: {
        width: 20,
    },
    sectionList: {
        width: "100%",
        paddingStart: 4,
        backgroundColor: "#fff",
        paddingEnd: 6,
    },
    sectionHeader: {
        maxWidth: "70%",
        paddingEnd: 14,
        backgroundColor: "#fff",
        flexDirection: "row",
        flexGrow: 1,
        columnGap: 1,
        alignSelf: 'flex-start',
        alignItems: "center",
    },
    sectorLogo: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#eee"
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
import React, { useRef } from "react"
import { Alert, Dimensions, Image, Pressable, Share, SectionList, StyleSheet, Text, View, Button } from "react-native"
import { Avatar, Divider, Menu } from "react-native-paper"
import Mci from "react-native-vector-icons/MaterialCommunityIcons";
import { dateFormatter } from "../../utils/dateFormatter"
import { useState } from "react";
import { useModal, useDomain } from "../../store/useStore";
import CreateIssueModal from "./CreateIssueModal"

const { width } = Dimensions.get("window");

export default function SideComponent() {
    const { currDomain } = useDomain()
    const { setModalVisible } = useModal()
    const [menuVisible, setMenuVisible] = useState(false)
    const [title, setTitle] = useState("")

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
        }catch (error) {
            Alert.alert(error.message);
        }
    };

    return(
    <>
        <View style={{}}>
            <CreateIssueModal title={title}/>
        </View>
        
        {currDomain.domain &&
        <View style={styles.sideComponent}>
            <View style={{width: "95%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{fontWeight: "bold", fontSize: 16}}>{currDomain.domain}</Text>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    contentStyle={{backgroundColor: "#333"}}
                    anchor={<Mci name="dots-vertical" size={24} color="#444" onPress={() => setMenuVisible(true)}/>}>
                    <Menu.Item onPress={() => {}} title="Edit" />
                    <Menu.Item onPress={() => {}} title="Add to favourite" />
                    <Menu.Item onPress={() => {}} title="Copy link" />
                    <Menu.Item onPress={() => {}} title="Add sector" />
                    <Menu.Item onPress={() => {}} title="Exit domain"/>
                </Menu>
            </View>
            <Text>{(currDomain.sectors?.length)} sectors {"  "}
                {currDomain.sectors?.reduce((acc,i) => {
                    return(
                        acc + i.data?.length
                    )
                }, 0)} issues
            </Text>
            <Text style={{fontSize: 10}}>created {dateFormatter(currDomain?.createdAt)}</Text>
            <Divider style={{width: width, position: "relative", left: -50, backgroundColor: "#66f", marginBottom: 8}}/>
        </View>}

        <SectionList
            sections={currDomain?.sectors || []}
            // extraData={currDomain?.sectors}
            keyExtractor={currDomain?.sectors?._id}
            renderItem={({item}) => {
                const vote_percent = item.resolved_votes?.length / currDomain.delegates?.length * 100
                return(
                    <Pressable onLongPress={() => {}} style={{ paddingEnd: 1 }}>
                        <View style={styles.renderNote}>
                            <Avatar.Text size={4} label="" marginTop={7.5} marginRight={2} backgroundColor={
                                vote_percent < 25 ? "#FF0000" :
                                vote_percent >= 25 && vote_percent < 50 ? "#FF7F00" :
                                vote_percent >= 50 && vote_percent < 75 ? "#FFFF00" :
                                vote_percent >= 75 && vote_percent < 90 ? "#7FFF00" :
                                "#00FF00"
                            }/>
                            <Text style={styles.note}>{item.note}</Text>
                        </View>
                        <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                            {item.pictures.map(i => 
                                <Image key={i + Math.random()} source={{uri: `${i+77}`}} style={styles.img}/>
                            )}
                        </View>
                        <View style={styles.shareView}>
                            <Text style={{fontSize: 10, minWidth: "20%", color: "#000a"}}>{dateFormatter(item?.date_created)}</Text>
                            <Mci name="menu-up" size={30} color="#ccc" style={styles.voteIcon} onPress={() => onShare(item?.note)}/>
                            <Mci name="share-variant-outline" size={18} onPress={() => onShare(item?.note)}/>
                        </View>
                    </Pressable>
            )}}
            renderSectionHeader={({section: {title}}) => (
                <Pressable style={styles.sectionHeader} onPress={() => {setTitle(title); setModalVisible(true)}}>
                    <Text style={{fontWeight: "500"}}>{title}</Text>
                    <Mci name="message-text-outline" size={16} marginTop={3}/>
                </Pressable>
            )}
            renderSectionFooter={() => <Divider style={{marginBottom: 8, marginTop: 6, backgroundColor:"#66f3"}}/>}
            ListEmptyComponent={<Text>ruteso</Text>}
            stickySectionHeadersEnabled={true}
            style={styles.sectionList}
        />
    </>
    )
}

const styles = StyleSheet.create({
    img: {
        width: "48%",
        height: 130,
        borderRadius: 8,
        marginRight: 2,
        marginTop: 3,
        marginBottom: 2,
        backgroundColor: "#ddd",
        flexGrow: 1,
    },
    note: {
        // fontSize: 16,
        // textAlign: "justify",
        lineHeight: 20
    },
    renderNote:{
        width: "99%",
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
        paddingEnd: 4,
        backgroundColor:"#fff",
        paddingEnd: 6,
    },
    sectionHeader:{
        width: "100%",
        paddingEnd: 14,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    shareView: {
        height: 30,
        marginBottom: 6,
        paddingStart: 7,
        paddingEnd: 14,
        flexDirection: "row",
        justifyContent:"space-between",
        alignItems: "center",
        // backgroundColor: "blue",
    },
    voteIcon: {
        width: 40,
        height: 30,
        marginEnd: 30,
        marginBottom: 3,
        // backgroundColor: "red"
    }
})
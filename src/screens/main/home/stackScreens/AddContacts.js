import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Dimensions, FlatList, Linking, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TouchableOpacity, ScrollView, View, } from 'react-native';
import { Avatar, Searchbar } from 'react-native-paper';
import { useChatBoxSectorId, useDelegateContact, useDomain, useToken } from '../../../../../store/useStore';
import { refreshAccessToken, url } from '../../../../../utils/https';
import { country_dial_codes } from '../../../../../utils/country-dial-codes';
import getContacts from '../../../../../utils/getContacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mci from "react-native-vector-icons/MaterialCommunityIcons"

const { height } = Dimensions.get("window")

//add selected contacts to delegates list
const selectContact = async (item, selected, setSelected, scrollRef) => {
    const check = await selected.filter(i => i.recordID == item.recordID)
    if (check.length === 0) {
        await setSelected(prev => [...prev, item])
        scrollRef?.current?.scrollToEnd({ animated: true })
    } else {
        setSelected(prev => prev.filter(i => i.recordID !== item.recordID))
    }
}

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

const RenderItem = memo((
    {
        navigation,
        item,
        scrollRef,
        isChat,
        sectorsInContacts,
        setDomains,
        selected,
        setSelected,
        setChatBoxSectorId,
        findContactByPhoneNumber
    }) => {
    const isSelected = useMemo(() => selected.some(i => i.recordID === item.recordID), [selected, item.recordID]);

    //create chat as sector with phone number
    const createChat = async (phoneNumber) => {
        const number = await cleanPhoneNumber(phoneNumber)
        const title = await findContactByPhoneNumber(number)
        setChatBoxSectorId(number)
        if (sectorsInContacts.includes(number)) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'main', params: { openChatBox: true } }],
            });
        } else {
            setDomains(prev =>
                prev.map(d =>
                    d._id === "ccccccc" ? {
                        ...d,
                        sectors: [...d.sectors, { _id: number, domain_id: "ccccccc", title: title, status: "private", data: [], time: Date.now() }]
                    }
                        : d
                ));
            navigation.reset({
                index: 0,
                routes: [{ name: 'main', params: { openChatBox: true } }],
            });
        }
    }

    return (
        <View>
            {item.phoneNumbers.map(i =>
                <TouchableOpacity activeOpacity={0.5} onPress={() => { isChat ? createChat(i) : selectContact(item, selected, setSelected, scrollRef) }} key={item.recordID} style={styles.contact}>
                    <Avatar.Text size={38} color={isSelected ? "#4CAF50" : ""} label={item.displayName.slice(0, 1).toUpperCase()} />
                    <View>
                        <Text style={{ color: isSelected ? "#81C784" : "" }}>{item.displayName}</Text>
                        <Text style={{ color: isSelected ? "#81C784" : "" }}>{i}</Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    )
})

const ListHeaderComponentx = memo(({ selected, setSelected, scrollRef }) => {
    return (
        <View style={{ width: "100%", backgroundColor: "#fff", flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start" }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                ref={scrollRef}
                onContentSizeChange={() => { }}
                contentContainerStyle={{ paddingHorizontal: 10, backgroundColor: "#fff" }}
                style={[{}, selected.length >= 1 && { borderBottomWidth: 0.5, borderBottomColor: "#ccc" }]}
            >
                {selected.map(item => (
                    <TouchableOpacity key={item.recordID} activeOpacity={0.6} style={{ paddingTop: 16 }} onPress={() => { selectContact(item, selected, setSelected) }}>
                        {item.phoneNumbers.map(i =>
                            <View key={item.recordID} style={{ justifyContent: "center", alignItems: "center", marginHorizontal: 16 }}>
                                <Avatar.Text size={52} label={item.displayName.slice(0, 1).toUpperCase()} />
                                <View>
                                    <Text> {item.displayName.length > 15
                                        ? item.displayName.substring(0, 9) + '...'
                                        : item.displayName}
                                    </Text>
                                </View>
                                <Avatar.Icon icon="close" color="#eee" size={20} style={styles.remContact} />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )
})

export default function AddContacts({ navigation, route }) {
    const isChat = route.params?._id === "ccccccc"
    const scrollRef = useRef(null)
    const appState = useRef(AppState.currentState);
    const { accessToken } = useToken()
    const { domains, setDomains } = useDomain()
    const { setChatBoxSectorId } = useChatBoxSectorId()
    const { contactHash, contactList, selected, setSelected } = useDelegateContact()
    const [searchQuery, setSearchQuery] = useState("")
    const [cacheContact, setCacheContact] = useState([])
    const [loading, setLoading] = useState(false)
    const [completed, setCompleted] = useState(false)
    const matchCheck = searchQuery.toUpperCase();

    const domain = domains.find(i => i._id === "ccccccc")
    const sectorsInContacts = domain.sectors.map(i => i._id)
    const verifyNumber = async () => {
        const prevRaw = await AsyncStorage.getItem("valid-contact");
        setLoading(true)
        try {
            const httpCall = await fetch(`${url}/verify-number`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                },
                body: JSON.stringify({
                    phoneNumber: [...new Set(contactList.map(i => i.phoneNumbers).flat())]
                })
            })
            const res = await httpCall.json()
            if (res.exp) {
                console.log("exp token")
                let accessToken_ = await refreshAccessToken(url, accessToken)
                if (accessToken_) {
                    verifyNumber()
                } else {
                    console.log("repeat addcontacts")
                }
            } else if (res.success === true) {
                const prev = prevRaw ? JSON.parse(prevRaw) : [];
                const merged = [...new Set([...prev, ...res.valid])];
                setCacheContact(merged)
                // setCacheContact([...new Set(contactList.map(i => i.phoneNumbers).flat())])
                const jsonValue = JSON.stringify(merged);
                await AsyncStorage.setItem("valid-contact", jsonValue)
                await AsyncStorage.setItem("contacts-hash", contactHash)
                setCompleted(true)
            }
        } catch (err) {
            console.log(err, "verify number")
        } finally {
            setLoading(false)
        }
    }

    const LoadContacts = async () => {
        try {
            const savedContactHash = await AsyncStorage.getItem("contacts-hash")
            const prevRaw = await AsyncStorage.getItem("valid-contact");
            setCacheContact(JSON.parse(prevRaw) || [])
            if (contactHash === "" && Platform.OS === "android") {
                const req = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
                if (req === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    Alert.alert(
                        'Permission required',
                        'Telli needs access to your contact to continue.',
                        [
                            { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ],
                    );
                } else {
                    console.log(1, "contact")
                    getContacts()
                }
            }
            if (contactHash !== "" && contactHash !== savedContactHash) {
                verifyNumber()
            } else {
                console.log(2, "contact")
                setCompleted(true)
            }
        } catch (err) {
            console.log(err)
        }
    }

    //checks for user leaving the app to grant permission on mount
    useEffect(() => {
        LoadContacts()
        const subscription = AppState.addEventListener('change', async nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                const granted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS
                );
                if (granted) {
                    await getContacts();
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);


    const findContactByPhoneNumber = useMemo(() => {
        const cache = {}
        return async (number) => {
            const key = number.trim();
            if (cache[key]) return cache[key];
            const match = contactList.find(contact =>
                contact.phoneNumbers?.some(i =>
                    cleanPhoneNumber(i) == number
                )
            )
            const result = match ? match.displayName : number
            cache[key] = result
            return result
        }
    }, [contactList])

    function ListEmptyComponentx() {
        return (
            <View style={{ height: height / 2.5, justifyContent: "flex-end", backgroundColor: "", }}>
                {
                    loading ? <ActivityIndicator size={46} /> :
                        !completed && cacheContact?.length === 0 ? <Text style={{ textAlign: "center" }}>An error occured, try again later.</Text> :
                            completed && cacheContact?.length === 0 ? <Text style={{ textAlign: "center" }}>No Contacts found</Text> :
                                cacheContact?.length >= 1 ? <Text style={{ textAlign: "center" }}>Not Found</Text> :
                                    null
                }
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Searchbar
                placeholder="Search"
                onChangeText={(e) => { setSearchQuery(e); }}
                value={searchQuery}
                inputStyle={{ paddingBottom: 24, color: "#444" }}
                style={styles.searchBarStyle}
            />
            <ListHeaderComponentx selected={selected} setSelected={setSelected} scrollRef={scrollRef} />
            <FlatList
                removeClippedSubviews={false}// remove
                extraData={cacheContact}
                data={
                    matchCheck == "" ?
                        contactList.filter(i => i.phoneNumbers.some(i => cacheContact?.includes(i))).sort((a, b) => a.displayName.localeCompare(b.name))
                        :
                        contactList.filter(i => i.phoneNumbers.some(i => cacheContact?.includes(i))).sort((a, b) => a.displayName.localeCompare(b.name))
                            .filter(i => i.displayName?.toUpperCase().substr(i.displayName.toUpperCase()
                                .indexOf(matchCheck), matchCheck.length) == matchCheck)
                }
                keyExtractor={(item) => item.recordID}
                initialNumToRender={50}
                renderItem={({ item }) => <RenderItem
                    navigation={navigation}
                    item={item}
                    scrollRef={scrollRef}
                    isChat={isChat}
                    sectorsInContacts={sectorsInContacts}
                    setDomains={setDomains}
                    selected={selected}
                    setSelected={setSelected}
                    setChatBoxSectorId={setChatBoxSectorId}
                    findContactByPhoneNumber={findContactByPhoneNumber}
                />}
                ListEmptyComponent={<ListEmptyComponentx scrollRef={scrollRef} />}
                getItemLayout={(data, index) => ({
                    length: 72,
                    offset: 72 * index,
                    index,
                })}
            />
            {cacheContact?.length > 0 && !isChat &&
                <Pressable style={styles.doneBtn} onPress={() => { navigation.goBack() }}>
                    <Mci name="check" color="#fff" size={24} style={{ alignSelf: "center", textAlign: "center" }} />
                </Pressable>}
        </View>
    );
};

const styles = StyleSheet.create({
    contact: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingStart: 12,
        marginBottom: 8,
        columnGap: 14,
    },
    doneBtn: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: "#66b",
        justifyContent: "center",
        position: "absolute",
        bottom: 34,
        right: 20
    },
    remContact: {
        borderWidth: 3,
        borderColor: "#fff",
        backgroundColor: "#a00",
        position: "relative",
        bottom: 32,
        left: 16
    },
    searchBarStyle: {
        width: "90%",
        height: 45,
        marginBottom: 8,
        marginTop: 6,
        backgroundColor: "#eee",
        alignSelf: "center"
    }
})
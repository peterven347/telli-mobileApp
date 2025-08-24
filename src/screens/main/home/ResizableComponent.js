import React, { useEffect, useRef, useState } from "react";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Dimensions, I18nManager, Keyboard, RefreshControl, Text, StyleSheet, View, Pressable, TouchableOpacity } from "react-native"
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import { Avatar, Searchbar, Tooltip } from "react-native-paper";
import { useDomain, useToken } from "../../../../store/useStore";
import { refreshAccessToken } from "../../../../utils/refreshAccessToken";
import { url } from "../../../../utils/https";
import Mci from "react-native-vector-icons/MaterialCommunityIcons";
import Mi from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import showSnackBar from "../../../../utils/SnackBar";


const { width, height } = Dimensions.get("screen");
const initialWidth = 75
const snapPoints = [initialWidth, width - 60];

export default function ResizableComponent({ navigation }) {
    const { domains, currDomainId, setCurrDomainId, setDomains } = useDomain()
    const { accessToken } = useToken()
    const [searchQuery, setSearchQuery] = useState("");
    const [searchRes, setSearchRes] = useState([])
    const [numberOfLines, setNumberOfLines] = useState(1)
    const [clearIcon, setClearIcon] = useState(true);
    const matchCheck = searchQuery.toUpperCase();
    const componentWidth = useSharedValue(initialWidth);
    const scale = useSharedValue(1);
    const dd = matchCheck == "" ? domains : domains?.filter(i => i.domain?.toUpperCase().substr(i.domain.toUpperCase().indexOf(matchCheck), matchCheck.length) == matchCheck)
    const textBar = useRef(null)

    const getClosestSnapPoint = (currentWidth) => {
        "worklet";
        let closest = snapPoints[0];
        let diff = Math.abs(currentWidth - snapPoints[0]);
        snapPoints.forEach((point) => {
            const newDiff = Math.abs(currentWidth - point);
            if (newDiff < diff) {
                closest = point;
                diff = newDiff;
            }
        });
        return closest;
    }

    const saveCurrDomain = async (id) => {
        await AsyncStorage.setItem("currDomain", id)
    }

    const dismissKeyboard = () => {
        Keyboard.dismiss()
    }

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            const translationX = I18nManager.isRTL ? -event.translationX : event.translationX;
            componentWidth.value = Math.max(translationX + initialWidth, initialWidth);
            scale.value = withSpring(componentWidth.value <= initialWidth ? 1 : componentWidth.value < width / 2 ? 1 : Math.min(1.2, scale.value + 0.04));
            runOnJS(setNumberOfLines)(componentWidth.value <= initialWidth ? 1 : componentWidth.value <= initialWidth * 2 ? numberOfLines + 1 : null);  //check
            runOnJS(setClearIcon)(componentWidth.value <= initialWidth * 2 ? false : true);
        })
        .onEnd(() => {
            const closestSnapPoint = getClosestSnapPoint(componentWidth.value);
            componentWidth.value = withSpring(closestSnapPoint, { damping: 20, stiffness: 100, overshootClamping: true });
            runOnJS(setNumberOfLines)(componentWidth.value <= initialWidth ? 1 : null);
            runOnJS(dismissKeyboard)();
        })

    const resizableStyle = useAnimatedStyle(() => {
        return {
            width: componentWidth.value,
            // gap: 14
        };
    });

    const avatarStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    })

    const [debounceTimer, setDebounceTimer] = useState(null);
    const webSearch = async () => {
        const httpCall = await fetch(`${url}/sector?q=${searchQuery}`, {
            headers: {
                Authorization: "Bearer " + accessToken,
            }
        })
        const res = await httpCall.json()
        if (res.success === true && res.data.length >= 1) {
            setSearchRes(prev => {
                const existingIds = new Set(prev.map(item => item?._id));
                const newItems = res.data.filter(item => !existingIds.has(item._id));
                return [...newItems, ...prev];
            })
        }
    }

    const addSectorDomain = async (sector) => {
        const httpCall = await fetch(`${url}/domain/${sector._id}`, {
            headers: {
                Authorization: "Bearer " + accessToken,
            }
        })
        const res = await httpCall.json()
        if (res.success === true) {
            if (res.data.length >= 1) {
                setSearchRes(prev => prev.filter(i => i._id !== sector._id))
                setDomains(prev => [...res.data, ...prev])
                showSnackBar(`You joined ${sector.title}`)
            } else {
                showSnackBar("can't join this sector")
            }
        }
    }

    const joinSector = async (sector) => {
        sector.data = []
        const httpCall = await fetch(`${url}/user/${sector._id}`, {
            method: "PATCH",
            headers: {
                Authorization: "Bearer " + accessToken,
            }
        })
        const res = await httpCall.json()
        if (res.success === true) {
            const foundDomain = domains.find(i => i._id === sector.domain_id)
            if (foundDomain) {
                setSearchRes(prev => prev.filter(i => i._id !== sector._id))
                setDomains(prev =>
                    prev.map(i => {
                        if (i._id === sector.domain_id) {
                            return {
                                ...i,
                                sectors: [sector, ...i.sectors]
                            };
                        } else {
                            return i;
                        }
                    })
                )
                setCurrDomainId(sector.domain_id)
                saveCurrDomain(sector.domain_id)
                showSnackBar(`You joined ${sector.title}`)
            } else {
                console.log("dommm")
                addSectorDomain(sector)
            }
        }
    }

    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSearchRes([])
            return
        }
        if (debounceTimer) clearTimeout(debounceTimer)
        const timer = setTimeout(() => {
            webSearch(searchQuery);
        }, 2750)
        setDebounceTimer(timer)
        return () => clearTimeout(timer)
    }, [searchQuery])

    return (
        <Animated.View style={[styles.resizableView, resizableStyle]}>
            <Searchbar
                ref={textBar}
                placeholder="Search"
                onChangeText={(e) => { setSearchQuery(e) }}
                value={searchQuery}
                onIconPress={() => {
                    componentWidth.value == initialWidth && (componentWidth.value = withSpring(width - 60, { damping: 110, overshootClamping: true }));
                    setNumberOfLines(4);
                    textBar.current.focus()
                }}
                clearIcon={clearIcon ? null : () => null}
                inputStyle={styles.searchBarInputStyle}
                style={styles.searchBarStyle}
            />

            <View style={{ marginBottom: 8 }}>
                <Mci name="plus" color="#fff" size={36} onPress={() => navigation.navigate("addDomain")} />
            </View>

            <ScrollView
                keyboardShouldPersistTaps="always"
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.domainView}>
                {
                    dd?.length >= 1 && dd.sort((a, b) => {
                        const query = searchQuery?.trim().toLowerCase();
                        if (query) {
                            const aVal = a.domain.toLowerCase();
                            const bVal = b.domain.toLowerCase();
                            const aIndex = aVal.indexOf(query);
                            const bIndex = bVal.indexOf(query);
                            if (aIndex === -1 && bIndex === -1) return 0;
                            if (aIndex === -1) return 1;
                            if (bIndex === -1) return -1;
                            return aIndex - bIndex;
                        }
                        const isPinnedA = a.pinned === true;
                        const isPinnedB = b.pinned === true;
                        if (isPinnedA && !isPinnedB) return -1;
                        if (!isPinnedA && isPinnedB) return 1;
                        return new Date(a.updatedAt) - new Date(b.updatedAt);
                    }).concat([{ id: 1 }, { id: 2 }, { id: 3 }])?.map((i, index) => {
                        return (
                            <Animated.View key={i._id || i.id} style={[{ alignItems: "center", maxWidth: 46 }, avatarStyle]}>
                                {i.pinned && <Mci name="pin" color="#fffe" size={16} style={{ zIndex: 2, position: "absolute", top: 2, left: 38 }} />}
                                {i._id ?
                                    <Tooltip title={
                                        `${i.sectors?.length}sectors ${i.sectors?.reduce((acc, i) => {
                                            return (
                                                acc + i.data?.length
                                            )
                                        }, 0)}issues`
                                    }>
                                        <Avatar.Image
                                            source={{ uri: `${url}/img-file/domainImg/${i.logo}`, headers: { Authorization: "Bearer " + accessToken } }}
                                            size={46} label={index}
                                            onPress={() => {
                                                if (currDomainId !== i._id) { //prevents unnecessary rerendering
                                                    setCurrDomainId(i._id); saveCurrDomain(i._id); dismissKeyboard(); componentWidth.value !== initialWidth && (componentWidth.value = initialWidth); setSearchQuery("")
                                                }
                                            }}
                                        />
                                    </Tooltip>
                                    : <View style={{ width: 46 }} />
                                }
                                <Text numberOfLines={numberOfLines} ellipsizeMode="tail" style={{ fontSize: 10, fontWeight: 600, textAlign: "center", color: "#fff" }}>{i.domain?.replaceAll(" ", "\n")}</Text>
                                <Avatar.Text label="" size={4} backgroundColor={i._id && i._id == currDomainId && "#fff"} style={styles.currDomainIndicator} />
                            </Animated.View>
                        );
                    })
                }

                <View style={[styles.domainView, searchRes.length > 3 && styles.searchRes]}>
                    {searchRes.concat([{ id: 11 }, { id: 22 }, { id: 33 }]).map((i) => (
                        <TouchableOpacity key={i._id || i.id} style={{ alignItems: "center", maxWidth: 46 }} onPress={() => { joinSector(i) }}>
                            {i._id ?
                                <Avatar.Image
                                    source={{ uri: `${url}/img-file/domainImg/${i.logo}`, headers: { Authorization: "Bearer " + accessToken } }}
                                    size={46}
                                />
                                : <View style={{ width: 46 }} />
                            }
                            <Text numberOfLines={3} ellipsizeMode="tail" style={{ fontSize: 10, fontWeight: 600, textAlign: "center", color: "#fff" }}>{i.title?.replaceAll(" ", "\n")}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <GestureDetector gesture={panGesture}>
                <View style={[styles.edge]}>
                    <Mci name="drag-vertical-variant" size={30} color="#fff" />
                </View>
            </GestureDetector>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    currDomainIndicator: {
        marginBottom: 2
    },
    domainView: {
        paddingBottom: 40,
        paddingTop: 16,
        paddingHorizontal: 8,
        flexDirection: "row",
        flexWrap: "wrap",
        numColumns: 4,
        columnGap: 46,
        rowGap: 18,
        justifyContent: "center",
    },
    edge: {
        position: "absolute",
        height: height - 40,
        right: -15,
        justifyContent: "center",
    },
    resizableView: {
        height: height,
        backgroundColor: "#449",
        padding: 10,
        paddingStart: 7,
        paddingBottom: 46,
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 1,
        alignItems: "center",
    },
    searchBarInputStyle: {
        height: 60,
        paddingBottom: 34,
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        color: "#444",
        flexDirection: "row-reversed"
    },
    searchBarStyle: {
        width: "90%",
        height: 35,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    searchRes: {
        display: "block",
        paddingTop: 16,
        borderTopWidth: 0.5,
        borderTopColor: "#66b"
    }
})
import React, { useEffect, useState } from "react"
import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native"
import Mci from "react-native-vector-icons/MaterialCommunityIcons"
import { TabBar, TabView } from "react-native-tab-view";
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// const Tab = createMaterialTopTabNavigator();

const A = () => {
    return (
        <Text>dfgg</Text>
    )
}
const B = () => {
    return (
        <Text>dfgdfghj</Text>
    )
}

const renderTabBar = props => (
    <TabBar
        {...props}
        activeColor="#000"
        inactiveColor="@000"
        pressColor="#fff"
        pressOpacity={0}
        indicatorStyle={{ backgroundColor: "#66b" }}
        style={{ backgroundColor: "#fff" }}
        tabStyle={{ paddingBottom: 0 }}
    // renderTabBarItem={({ route, focused, onPress }) => (
    //     <Pressable key={route.key} style={[styles.renderTabBarItem, {width: props.layout.width / 2}]} onPress={onPress}>
    //         <Text style={{ color: "#222" }}>{route.title}</Text>
    //     </Pressable>
    // )}
    />
);

function Tab() {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const routes = [
        { key: "second", title: "Posts" },
        { key: "first", title: "Highligh" },
    ];

    const renderScene = ({ route }) => {
        switch (route.key) {
            case "first":
                return <A />;
            case "second":
                return <B />;
            default:
                return null;
        }
    };

    return (
        <TabView
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
            renderTabBar={(props) => renderTabBar({ ...props, layout: layout })}
            initialLayout={{ width: layout.width }}
        />
    );
}


export default function Profile({ navigation, route }) {
    const { _id, userName, title, routeName } = route.params
    return (
        <>
            <TouchableOpacity onPress={() => { navigation.goBack(); }} style={styles.backBtn}>
                {/* <TouchableOpacity onPress={() => { routeName ? navigation.navigate("home", { screen: routeName }) : navigation.goBack() }} style={styles.backBtn}> */}
                <Mci name="arrow-left-thin" size={32} margin="auto" color="#fff" />
            </TouchableOpacity>
            <Image source={require("../../../assets/images/rrrrr.jpg")} style={styles.backdrop} />
            <View style={styles.profileImgView}>
                <Image source={require("../../../assets/images/rrrrr.jpg")} style={styles.profileImg} />
            </View>
            <Text style={styles.userName}>{userName ?? "..."}
                {title && <Text style={{ fontWeight: 16 }}> ({title})</Text>}
            </Text>
            <View style={{ marginHorizontal: 8 }}>
                <Text style={styles.bio}>a powerful and flexible low-level interface for streaming arbitrary application
                    data between two peers, all in real time
                </Text>
                <View style={{ width: "50%", flexDirection: "row", justifyContent: "space-between" }}>

                    <Text>
                        <Text style={{ fontWeight: 600 }}>2k </Text>
                        <Text>followers</Text>
                    </Text>
                    <Text>
                        <Text style={{ fontWeight: 600 }}>2k </Text>
                        <Text>followers</Text>
                    </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 28, marginBottom: 8 }}>
                    <View style={styles.actions}></View>
                    <View style={styles.actions}></View>
                    <View style={styles.actions}></View>
                </View>
            </View>
            <Tab />
            {/* <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#000',
                    tabBarInactiveTintColor: '#888',
                    tabBarIndicatorStyle: { backgroundColor: '#66b' },
                    tabBarStyle: { backgroundColor: '#fff' },
                    tabBarLabelStyle: {
                        fontWeight: 'bold',
                        textTransform: 'none',
                    },
                    swipeEnabled: true, // set to false if you want to disable gestures
                }}
            >
                <Tab.Screen name="Post" component={A} />
                <Tab.Screen name="Highlights" component={B} />
            </Tab.Navigator> */}
        </>
    )
}

const styles = StyleSheet.create({
    actions: {
        height: 12,
        borderRadius: 4,
        width: "25%",
        backgroundColor: "#66bc"
    },
    backdrop: {
        width: "100%",
        height: "20%"
    },
    bio: {
        marginVertical: 10
    },
    backBtn: {
        width: 32,
        height: 32,
        marginStart: 10,
        position: "absolute",
        top: 10,
        zIndex: 1,
        borderRadius: 16,
        backgroundColor: "#eee6"
    },
    profileImg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        margin: "auto"
    },
    profileImgView: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: "#fff",
        alignSelf: "center",
        marginTop: -41
    },
    renderTabBarItem: {
        flex: 1,
        margin: 1,
        alignItems: "center",
        paddingVertical: 6
    },
    userName: {
        fontWeight: 600,
        fontSize: 16,
        textAlign: "center"
    },
})
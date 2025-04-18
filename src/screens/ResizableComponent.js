import React, { useCallback, useEffect, useRef, useState } from "react";
import {ActivityIndicator, Dimensions, I18nManager, Keyboard, RefreshControl, Text, StyleSheet, View } from "react-native"
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native';
import { Avatar, Searchbar, Tooltip } from "react-native-paper";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Mci from "react-native-vector-icons/MaterialCommunityIcons";
import { useDomain } from "../../store/useStore";


const { width, height } = Dimensions.get("screen");
const initialWidth = 75
const snapPoints = [initialWidth, width - 60];

export default function ResizableComponent() {
const navigation = useNavigation();
// export default function ResizableComponent({bottomSheetRef}) {
    const { domains, currDomain, setCurrDomain } = useDomain()
    const [searchQuery, setSearchQuery] = useState("");
    const [numberOfLines, setNumberOfLines] = useState(1)
    const [KeyboardState, setKeyboardState] = useState(false);
    const [clearIcon, setClearIcon] = useState(() => null);
    const matchCheck = searchQuery.toUpperCase();
    const componentWidth = useSharedValue(initialWidth);
    const scale = useSharedValue(1);
    const dd = matchCheck == "" ? domains.concat([{},{},{}]) : domains.filter(i => i.domain?.toUpperCase().substr(i.domain.toUpperCase().indexOf(matchCheck), matchCheck.length) == matchCheck).concat([{}, {}, {}])
    const [refreshing, setRefreshing] =useState(false);

    const onRefresh = () => {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 59000)};
    useEffect(() => {
        Keyboard.isVisible() && Keyboard.dismiss()
    }, [KeyboardState])

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
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            componentWidth.value = Math.max(event.translationX + initialWidth, initialWidth);
            scale.value = withSpring(componentWidth.value <= initialWidth ? 1 : componentWidth.value < width/2 ? 1 : Math.min(1.2, scale.value + 0.04));
            runOnJS(setNumberOfLines)(componentWidth.value <= initialWidth ? 1 : componentWidth.value <= initialWidth*2 ? numberOfLines + 1 : null);  //check
        })
        .onEnd(() => {
            // Calculate and snap to the closest snap point directly on the UI thread
            const closestSnapPoint = getClosestSnapPoint(componentWidth.value);
            componentWidth.value = withSpring(closestSnapPoint, { damping: 20, stiffness: 100, overshootClamping: true });
            runOnJS(setClearIcon)(componentWidth.value <= initialWidth ? () => null : null);
            runOnJS(setNumberOfLines)(componentWidth.value <= initialWidth ? 1 : null);
            runOnJS(setKeyboardState)(!KeyboardState)
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
    });

    const textBar = useRef(null)
    return (
		<Animated.View style={[styles.resizableView, resizableStyle]}>
			<Searchbar
                ref = {textBar}
				placeholder="Search"
				onChangeText={(e) => {setSearchQuery(e);}}
				value={searchQuery}
				onIconPress={() => {
                    componentWidth.value == initialWidth && (componentWidth.value = withSpring(width - 60, {damping: 10, overshootClamping: true}));
                    // scale.value = withSpring(1.2, {mass: 20})
                    setNumberOfLines(4);
                    textBar.current.focus()
                }}
				clearIcon={ clearIcon }
				inputStyle={styles.searchBarInputStyle}
				style={styles.searchBarStyle}
			/>

			<View style={{ marginBottom: 8}}>
				<Mci name="plus" color="#fff" size={36} onPress={() => navigation.navigate("addDomain")}/>
			</View>

			<ScrollView
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} marginVertical={4} progressViewOffset={-40} colors={["#eee", '#ccd9ff', '#99bbff', '#5577cc', '#aaccee']}
                // progressBackgroundColor="#449"/>}
                contentContainerStyle={{paddingHorizontal: 8, paddingBottom: 40, paddingTop: 14}}>
				<View style={styles.domainView}>
					{
						dd.map((i, index) => {
							return (
								<Animated.View key={index} style={[{ alignItems: "center", maxWidth: 46}, avatarStyle]}>
									{/* maxWidth is the same as Avatar size */}
									{i._id ?
										<Tooltip title={
											`${i.sectors.length}sectors ${i.sectors.reduce((acc,i) => {
											return(
												acc + i.domains?.length
											)
                							}, 0)}issues`
											} color="red" theme={{ colors: { primary: "green" } }}>
											<Avatar.Image source={{ uri: `${i.logo}` }} size={46} label={index} onPress={() => {setCurrDomain(i); componentWidth.value !== initialWidth && (componentWidth.value = initialWidth)} }/>
										</Tooltip>
									: <View style={{width: 46}}/>}
									<Text numberOfLines={numberOfLines} ellipsizeMode="tail" style={{fontSize: 10, textAlign: "center", color: "#fff"}}>{i.domain?.replaceAll(" ", "\n")}</Text>
									<Avatar.Text label="" size={4} backgroundColor={i._id && i._id == currDomain._id && "#fff"} style={styles.currDomainIndicator}/>
								</Animated.View>
							);
						})
					}
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
		flexDirection: "row",
		flexWrap: "wrap",
		columnGap: 46,
		rowGap: 18,
		// justifyContent: "center",
        // backgroundColor: 'blue'
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
		borderTopStartRadius: I18nManager.isRTL ? 20 : 0,
		borderTopEndRadius: I18nManager.isRTL ? 0 : 20,
		padding: 10,
        paddingStart: 7,
		position: "absolute",
		left: 0,
		top: 0,
		alignItems: "center",
   },
   searchBarInputStyle: {
        height:60,
        paddingBottom: 34,
        alignItems: "center",
        justifyContent:"center",
        flexWrap: "wrap",
        color: "#444"
    },
    searchBarStyle: {
        width:"90%",
        height: 35,
        marginBottom: 16,
        marginTop: 4,
        backgroundColor:"#fff"
    },
})
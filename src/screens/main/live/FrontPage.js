import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, BackHandler, Dimensions, FlatList, Image, Pressable, Keyboard, ScrollView } from 'react-native';
import { Easing } from 'react-native-reanimated';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import Mci from "react-native-vector-icons/MaterialCommunityIcons"

const { width } = Dimensions.get("window")

const reels = [{
	_id: 1, userName: "Peterven", note: `With your development environment set up and tested out, Chapter 2 dives right into the only necessary server component of WebRTC apps: a signaling channel. As part of working with the signaling channel, you’ll start to build
the basic interface of your first WebRTC app, which provides peer-to-peer
video calls.`, time: "2 days ago", pictures: ["../../../assets/images/rrrrr.jpg", "../../../assets/images/rrrrr.jpg", "../../../assets/images/rrrrr.jpg", "../../../assets/images/rrrrr.jpg"]
}, {
	_id: 2, userName: "Peterven", note: `With your development environment set up and tested out, Chapter 2 dives right into the only necessary server component of WebRTC apps: a signaling channel. As part of working with the signaling channel, you’ll start to build
the basic interface of your first WebRTC app, which provides peer-to-peer
video calls.`, time: "3 days ago", h: "highlight"
}, {
	_id: 3, userName: "Peterven", note: `With your development environment set up and tested out, Chapter 2 dives right into the only necessary server component of WebRTC apps: a signaling channel. As part of working with the signaling channel, you’ll start to build
the basic interface of your first WebRTC app, which provides peer-to-peer
video calls.`, time: "4 days ago"
}, {
	_id: 4, userName: "Peterven", note: `With your development environment set up and tested out, Chapter 2 dives right into the only necessary server component of WebRTC apps: a signaling channel. As part of working with the signaling channel, you’ll start to build
the basic interface of your first WebRTC app, which provides peer-to-peer
video calls.`, time: "5 days ago"
}, {
	_id: 5, userName: "Peterven", note: `With your development environment set up and tested out, Chapter 2 dives right into the only necessary server component of WebRTC apps: a signaling channel. As part of working with the signaling channel, you’ll start to build
the basic interface of your first WebRTC app, which provides peer-to-peer
video calls.`, time: "6 days ago"
}]

const MemoizedImage = memo(({ uri, index, len }) => {
	// const { accessToken } = useToken()
	return (
		<Image style={[styles.noteImg,
		{
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
		}]}
			source={require("../../../assets/images/rrrrr.jpg")}
		/>
	)
})

const RenderItem = ({ item, index, navigation, handlePress, itemRefs }) => {
	return (
		<View style={styles.renderItem} ref={(ref) => (itemRefs.current[index] = ref)}>
			<View style={styles.reelHeader}>
				<TouchableOpacity activeOpacity={0.7} onPress={() => { navigation.navigate("profile", { _id: 1, userName: item.userName }) }} >
					<Image source={require("../../../assets/images/rrrrr.jpg")} style={styles.profileImg} />
				</TouchableOpacity>
				<View style={styles.userNameView}>
					<Text style={styles.userName}>{item.userName}</Text>
					<Text style={{ fontSize: 12 }}>{item.time} <Text style={{color: "#6eafb2", fontStyle: "italic"}}>{item.h}</Text></Text>
				</View>
				<TouchableOpacity style={{ marginEnd: 4 }} onPress={() => { handlePress(item, index); }}>
					<Text style={styles.tripleDots}>...</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.noteView}>
				<Text style={styles.note}>{item.note}{item.note}</Text>
			</View>
			<View style={{ flexDirection: "row", flexWrap: "wrap", marginStart: 25, gap: 2 }}>
				{item.pictures?.map((i, index) => (
					<MemoizedImage key={i + Math.random()} index={index} len={item.pictures?.length} uri={i} /> ///
				))}
			</View>
			<View style={styles.footer}>
				<Pressable style={styles.footerIcon}>
					<TouchableOpacity>
						<Mci name="heart-outline" size={20} color="#ccc" />
					</TouchableOpacity>
					<Text style={{ fontSize: 12 }}>800</Text>
				</Pressable>
				<Pressable style={styles.footerIcon} onPress={() => { navigation.navigate("textBoard") }}>
					<TouchableOpacity>
						<Mci name="chat-outline" size={20} color="#ccc" />
					</TouchableOpacity>
					<Text style={{ fontSize: 12 }}>2.8K</Text>
				</Pressable>
				<Pressable style={styles.footerIcon}>
					<TouchableOpacity>
						<Mci name="share-outline" size={20} color="#ccc" />
					</TouchableOpacity>
					<Text style={{ fontSize: 12 }}>1M</Text>
				</Pressable>
				<Pressable style={styles.footerIcon}>
					<TouchableOpacity>
						<Mci name="book-outline" size={20} color="#ccc" />
					</TouchableOpacity>
					<Text style={{ fontSize: 12 }}>2.8k</Text>
				</Pressable>
			</View>
		</View>
	)
}


export default function FrontPage({ navigation }) {
	const bottomSheetRef = useRef(null);
	const indexRef = useRef(null)

	const handleSheetChanges = useCallback((index) => {
		indexRef.current = index;
	}, []);
	const showBottomSheet = () => {
		bottomSheetRef.current.snapToIndex(1, {
			duration: 200,
			easing: Easing.out(Easing.ease)
		})
	};
	const renderBackdrop = useCallback(
		(props) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				opacity={0.1}
			/>
		), []);

	useEffect(() => {
		const backAction = () => {
			if (indexRef.current == 1) {
				bottomSheetRef.current?.close();
				return true;
			}
			return false;
		};

		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress', backAction
		);

		return () => backHandler.remove();
	}, []);


	const flatListRef = useRef(null);
	const itemRefs = useRef({});

	const handlePress = (item, index) => {
		itemRefs.current[index].measure((x, y, width, height, pageX, pageY) => {
			const offset = pageY - 60;
			flatListRef.current.scrollToOffset({ offset, animated: true });
		});
		showBottomSheet()
	};

	return (
		<>
			<View style={styles.top}>
				<View style={styles.topIcons}>
					<Mci name="chat" size={24} color="#66b" />
					<Mci name="text" size={24} color="#66b" />
					<Mci name="pen" size={24} color="#66b" />
				</View>
				<TouchableOpacity onPress={() => { navigation.navigate("textBoard") }} style={styles.sendButton}>
					<Mci name="plus" size={36} color="#fff" />
				</TouchableOpacity>
			</View>
			<FlatList
				ref={flatListRef}
				removeClippedSubviews={false} ///remove
				data={reels}
				keyExtractor={(item) => item._id || item.id}
				renderItem={({ item, index }) => <RenderItem item={item} index={index} navigation={navigation} handlePress={handlePress} itemRefs={itemRefs} />}
			/>
			<BottomSheet
				ref={bottomSheetRef}
				index={-1}
				enablePanDownToClose={true}
				// enableContentPanningGesture={false}
				snapPoints={['55%']}
				handleIndicatorStyle={{ backgroundColor: "#66b" }}
				enableOverDrag={false}
				backdropComponent={renderBackdrop}
				opacity={0.2} ///
				onChange={handleSheetChanges}
				backgroundStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, }}
			>
				<BottomSheetView style={styles.bottomSheetView}>
					{/* <BottomSheetForImg bottomSheetRef={bottomSheetRef} /> */}
				</BottomSheetView>
			</BottomSheet>
		</>
	);
}

const styles = StyleSheet.create({
	footer: {
		width: '100%',
		marginHorizontal: 25,
		paddingVertical: 12,
		paddingHorizontal: 25,
		columnGap: 40,
		flexDirection: "row",
		alignSelf: "center",
	},
	footerIcon: {
		alignItems: "center",
	},
	note: {
		fontSize: 14,
		fontWeight: 700,
		lineHeight: 18,
		letterSpacing: 0.2,
		marginTop: 2,
		color: "#222",
	},
	noteImg: {
		width: "48%",
		height: 130,
		borderRadius: 4,
		flexGrow: 1,
		borderBottomEndRadius: 43,
		borderEndStartRadius: 13,
	},
	noteView: {
		paddingStart: 25,
		paddingEnd: 10
	},
	profileImg: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginEnd: 6
	},
	reelHeader: {
		flexDirection: "row",
		width: "100%",
	},
	renderItem: {
		width: width,
		paddingHorizontal: 8,
		marginTop: 1,
		paddingTop: 6,
		backgroundColor: "#fff"
	},
	sendButton: {
		marginLeft: 8,
		borderRadius: 24,
		paddingHorizontal: 26,
		paddingVertical: 1,
		backgroundColor: '#66b',
		justifyContent: 'center',
	},
	top: {
		flexDirection: 'row',
		padding: 8,
		alignItems: 'flex-end',
		backgroundColor: '#fff',
	},
	topIcons: {
		flex: 1,
		paddingStart: 18,
		paddingVertical: 8,
		fontSize: 16,
		columnGap: 44,
		flexDirection: "row"
	},
	tripleDots: {
		fontSize: 26,
		fontWeight: "bold",
		marginStart: 14,
		marginTop: -10
	},
	userName: {
		fontWeight: 600,
		fontSize: 16
	},
	userNameView: {
		marginTop: 4,
		marginEnd: "auto",
		flexDirection: "column",
		// backgroundColor: "blue"
	}
});

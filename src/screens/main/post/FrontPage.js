import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View, TextInput, TouchableOpacity, Text, StyleSheet, BackHandler, Dimensions, FlatList, Image, Pressable, Keyboard, ScrollView } from 'react-native';
import { Easing } from 'react-native-reanimated';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import Mci from "react-native-vector-icons/MaterialCommunityIcons"
import Mi from "react-native-vector-icons/MaterialIcons"
import { useInfiniteScroll } from "../../../../apis/post.api";
import { url } from '../../../../apis/socket';
const { width } = Dimensions.get("window")
import { dateFormatter } from '../../../../utils/dateFormatter';

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
			source={{ uri: `${url}/files/post/${uri}` }} />

	)
})

const RenderItem = ({ item, index, navigation, handlePress }) => {
	return (
		<View style={styles.renderItem}>
			<View style={styles.reelHeader}>
				<TouchableOpacity activeOpacity={0.7} onPress={() => { navigation.navigate("profile", { _id: 1, userName: item._id }) }} >
					<Image source={{ uri: `${url}/files/domainLogo/${item.creator?.logo}` }} style={styles.profileImg} />
				</TouchableOpacity>
				<View style={styles.userNameView}>
					<Text style={styles.userName}>{item.creator?.first_name}</Text>
					<Text style={{ fontSize: 12 }}>{dateFormatter(item._id)} <Text style={{ color: "#6eafb2", fontStyle: "italic" }}>{item?.h}</Text></Text>
				</View>
				<TouchableOpacity style={{ marginEnd: 4 }} onPress={() => { handlePress(item, index); }}>
					<Text style={styles.tripleDots}>...</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.noteView}>
				<Text style={styles.note}>{item.text}</Text>
			</View>
			<View style={{ flexDirection: "row", flexWrap: "wrap", marginStart: 25, gap: 2 }}>
				{item.pictureFile?.map((i, index) => (
					<MemoizedImage key={i} index={index} len={item.pictureFile?.length} uri={i} /> ///
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
	const indexRef = useRef(null);
	const flatListRef = useRef(null);
	const itemRefs = useRef({});
	const { data, error, fetchNextPage, status, hasNextPage, isFetchingNextPage } = useInfiniteScroll()

	const debounce = (func, delay) => {
		let timeoutId = null;
		return function (...args) {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				func(...args);
			}, delay);
		};
	}

	const loadMore = useCallback(
		debounce(() => {
			if (hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		}, 300),
		[hasNextPage, isFetchingNextPage, fetchNextPage]
	);

	// const syncVote = async (issue_id) => {
	// 	const { setPendingVotes } = usePending()
	// 	try {
	// 		let accessToken = useToken.getState().accessToken
	// 		const httpCall = await fetch(`${url}/user/${issue_id}`, {
	// 			method: "PATCH",
	// 			headers: {
	// 				Authorization: "Bearer " + accessToken
	// 			}
	// 		})
	// 		const res = await httpCall.json()
	// 		if (res.exp) {
	// 			let accessToken_ = await refreshAccessToken()
	// 			if (accessToken_) {
	// 				syncVote(issue_id)
	// 			}
	// 		}
	// 	} catch (err) {
	// 		console.log(err)
	// 		if (err.message === "Network request failed") {
	// 			setPendingVotes(issue_id)
	// 		}
	// 	}
	// }

	// const like = async (issue_id) => {
	// 	const { user, setUser } = useUser.getState()
	// 	if (user.issues_voted?.includes(issue_id)) {
	// 		setUser(prev => ({
	// 			...prev,
	// 			issues_voted: prev.issues_voted.filter(i => i !== issue_id)
	// 		}))
	// 	} else {
	// 		setUser(prev => ({
	// 			...prev,
	// 			issues_voted: [...prev?.issues_voted, issue_id]
	// 		}))
	// 	}
	// 	syncVote(issue_id)
	// }

	// const loadMore = () => {
	// 	if (hasNextPage && !isFetchingNextPage) {
	// 		fetchNextPage();
	// 	}
	// };

	const handleSheetChanges = useCallback((index) => {
		indexRef.current = index;
	}, []);

	const showBottomSheet = () => {
		bottomSheetRef.current.snapToIndex(1, {
			duration: 200,
			easing: Easing.out(Easing.ease)
		})
	};

	const handlePress = (item, index) => {
		flatListRef.current.scrollToIndex({ index, animated: true });
		showBottomSheet()
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
		console.log(data)
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

	return (
		<>
			<View style={styles.top}>
				<View style={styles.topIcons}>
					<Mi name="live-tv" size={24} color="#66b" onPress={() => navigation.navigate("tv")}/>
				</View>
				<TouchableOpacity onPress={() => { navigation.navigate("textBoard") }} style={styles.sendButton}>
					<Mci name="plus" size={36} color="#fff" />
				</TouchableOpacity>
			</View>
			<FlatList
				ref={flatListRef}
				data={data?.pages.flatMap(page => page.posts) ?? []}
				keyExtractor={(item) => item._id}
				renderItem={({ item, index }) => <RenderItem item={item} index={index} navigation={navigation} handlePress={handlePress} itemRefs={itemRefs} />}
				onEndReached={loadMore}
				onEndReachedThreshold={0.5}
				ListFooterComponent={() =>
					isFetchingNextPage ? <ActivityIndicator size="small" /> : null
				}
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
		fontWeight: 500,
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
		backgroundColor: "#ccc",
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
		backgroundColor: '#fff',
	},
	topIcons: {
		flex: 1,
		paddingStart: 18,
		columnGap: 44,
		flexDirection: "row",
		alignItems: "center",
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

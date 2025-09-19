import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Dimensions, Image, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Pressable } from 'react-native';
import { useChatBoxSectorId, useDomain, useToken, useUser } from '../../../../store/useStore';
import { chat, createIssue } from '../../../../utils/https';
import Fa from "react-native-vector-icons/FontAwesome"
import Mci from "react-native-vector-icons/MaterialCommunityIcons"
import { dateFormatter } from '../../../../utils/dateFormatter';

const { width } = Dimensions.get('window');

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

const RenderItem = memo(({ item, messageId, hideMessageTools, handleLongPress }) => {
	const { user } = useUser.getState()
	const [noOfLines, setNoOfLines] = useState({})
	const isMine = item.creator_id === user._id;
	const pictures = useMemo(
		() => item.pictures?.map((i) => (item._id ? `${url}/img-file/issuesImg/${i}` : i)) ?? [],
		[item]
	);
	return (
		item.creator_id !== "user" ?
			<View style={
				[styles.messageContainer,
				{
					backgroundColor: item._id === messageId ? "#b4c6a766" : null,
					alignItems: isMine ? 'flex-end' : 'flex-start',
				}]}
				onStartShouldSetResponder={() => { hideMessageTools() }}>
				<Pressable
					style={[styles.bubble,
					{
						backgroundColor: isMine ? '#DCF8C6' : '#E5E5EA',
						borderTopLeftRadius: isMine ? 8 : 0,
						borderTopRightRadius: isMine ? 0 : 8,
					},]}>
					<>
						<Text style={styles.messageText}
							numberOfLines={noOfLines[item._id] ? undefined : item.pictures?.length === 0 ? 20 : 6}
							onPress={() => { setNoOfLines(prev => ({ ...prev, [item._id]: !prev[item._id] })); }}
							onLongPress={handleLongPress}>
							{item.note}
						</Text>
						<Text style={styles.timestamp}>
							{
								item._id ?
									new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
									: <Mci name="timer-sand" size={13} color="#999" />
							}
						</Text>
					</>
				</Pressable>
				{item.pictures?.length >= 1 && <View style={{ width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 6 }}>
					{pictures?.map((i, index) => (
						<MemoizedImage key={i} index={index} len={item.pictures?.length} uri={i} fn={() => {
						}} />
					))}
				</View>}
			</View>
			:
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					marginVertical: 10,
				}}
			>
				<View
					style={{
						flex: 1,
						height: 0.5,
						backgroundColor: '#eee6',
						marginRight: 0,
					}}
				/>
				<View
					style={{
						backgroundColor: '#eee',
						paddingHorizontal: 12,
						// paddingVertical: 4,
						borderRadius: 12,
					}}
				>
					<Text style={{ color: '#555', fontSize: 12, fontWeight: '600' }}>
						{item.note}
					</Text>
				</View>
				<View
					style={{
						flex: 1,
						height: 0.5,
						backgroundColor: '#eee6',
						marginLeft: 0,
					}}
				/>
			</View>
	);
});

export default function SectorView({ navigation, visible, onClose }) {
	const { currDomainId, domains, setDomains } = useDomain()
	const { chatBoxSectorId } = useChatBoxSectorId()
	const [imageData, setImageData] = useState([])
	const [textInput, setTextInput] = useState('');
	const [showMessageTools, setShowMessageTools] = useState(false);
	const [messageId, setMessageId] = useState("");
	const [y, setY] = useState(0);
	const translateX = useRef(new Animated.Value(width)).current;
	const domain = domains.find(i => i._id === currDomainId)
	const sector = domain?.sectors?.find(j => j._id === chatBoxSectorId)

	const handleSend = async () => {
		try {
			if (!textInput.trim()) {
				return
			}
			if (currDomainId === "ccccccc") {
				chat(textInput, imageData, chatBoxSectorId, currDomainId)
			} else {
				createIssue(textInput, imageData, chatBoxSectorId, currDomainId)
			}
			setTextInput("");
			setImageData([]);
		} catch (err) {
			console.log(err)
		}
	}

	const handlePress = () => {
		if (currDomainId === "ccccccc" && sector.title !== "AI") {
			navigation.navigate("live", { screen: "profile", params: { _id: sector._id, title: sector.title, routeName: "main" } })
		} else if (currDomainId === "ccccccc" && sector.title === "AI") {
		} else {
			navigation.navigate("sectorDetail", {})
			// setTitle(title);
			// setEditSectorModalVisible(true)
		}
	}

	const handleLongPress = (event) => {
		const { nativeEvent } = event;
		const { locationY } = nativeEvent;
		setY(locationY + 150);
		setShowMessageTools(true)
	};

	const delMessage = (_id) => {
		setShowMessageTools(false)
		setDomains(prev =>
			prev.map(d => {
				if (d._id !== currDomainId) return d
				return {
					...d,
					sectors: d.sectors.map(s => {
						if (s._id !== chatBoxSectorId) return s;
						return {
							...s,
							data: [...(s.data.filter(i => i._id !== _id) || [])]
						};
					}),
				};
			})
		);
	}

	useEffect(() => {
		Animated.timing(translateX, {
			toValue: visible ? 0 : width,
			duration: 300,
			useNativeDriver: true,
		}).start();
	}, [visible, translateX]);

	useEffect(() => {
		if (visible && Platform.OS === 'android') {
			const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
				if (showMessageTools) {
					setMessageId("")
					setShowMessageTools(false)
				} else {
					onClose?.();
				}
				return true;
			});

			return () => { backHandler.remove() };
		}
	}, [visible, onClose, showMessageTools]);

	if (!visible && translateX.__getValue() === width) {
		return null;
	}

	return sector?._id ? (
		<Animated.View style={[styles.container, { transform: [{ translateX }] }]} >
			<View style={styles.sectionHeader} >
				<Mci name="arrow-left-thin" size={26} onPress={() => onClose()} />
				<Image source={require("../../../assets/images/rrrrr.jpg")} style={styles.sectorLogo} />
				<Text numberOfLines={1} style={[styles.title, { backgroundColor: sector.title === "AI" ? "#66b" : "transparent" }]} onPress={handlePress}>
					{sector.title}
				</Text>
				<Mci name="video-outline" size={24} onPress={() => { }} style={{ marginStart: "auto", marginEnd: 18 }} />
				<Mci name="phone-outline" size={24} onPress={() => { }} style={{ transform: [{ scaleX: -1 }] }} />
			</View>
			{showMessageTools &&
				<View style={[styles.popup, { top: y }]}>
					<Mci name="delete-outline" size={28} color="#fff" onPress={() => delMessage(messageId)} />
				</View>
			}
			<FlatList
				inverted
				data={sector.data.sort((a, b) => { return new Date(b.createdAt || b.time).getTime() - new Date(a.createdAt || a.time).getTime() })}
				keyExtractor={(item) => item._id || item.id}
				renderItem={({ item }) => <RenderItem item={item} messageId={messageId} hideMessageTools={() => { setShowMessageTools(false); setMessageId("") }} handleLongPress={(e) => { setMessageId(item._id); handleLongPress(e) }} />}
				contentContainerStyle={{
					flexGrow: 1,
					justifyContent: 'flex-end',
				}}
				ListEmptyComponent={<Text style={{ textAlign: "center", color: "#bbb" }}>Type to send your first message</Text>}
				removeClippedSubviews={false}
			/>
			<TouchableOpacity hitSlop={10} style={styles.mediaIcon}>
				<Mci name="dots-vertical-circle-outline" size={26} color="grey" />
			</TouchableOpacity>
			<View style={styles.textBox}>
				<TextInput
					style={styles.input}
					placeholder="Type a textInput..."
					placeholderTextColor="#ccc"
					value={textInput}
					onChangeText={setTextInput}
					multiline
				/>
				<TouchableOpacity onPress={handleSend} style={styles.sendButton}>
					<Fa name="long-arrow-right" size={28} color="#af7" />
				</TouchableOpacity>
			</View>
		</Animated.View>
	) : null;
}

const styles = StyleSheet.create({
	bubble: {
		paddingHorizontal: 10,
		borderRadius: 8,
		borderBottomEndRadius: 0,
		maxWidth: '90%',
	},
	container: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		width: width - 75,
		flex: 1,
		marginStart: 75,
		marginTop: "15%",
		paddingHorizontal: 4,
		backgroundColor: '#fff',
	},
	mediaIcon: {
		backgroundColor: "#fafafa",
		borderRadius: "50%",
		justifyContent: "center",
		alignItems: "center",
		height: 30,
		width: "9%",
		position: "absolute",
		bottom: 7,
		start: 6,
		zIndex: 1
	},
	messageContainer: {
		marginVertical: 4,
		marginStart: 2,
		marginEnd: 6,
	},
	messageText: {
		fontSize: 14,
		fontWeight: 500,
	},
	img: {
		// width: "50%",
		height: 130,
		marginVertical: 1,
		paddingHorizontal: 2,
		flexGrow: 1
	},
	input: {
		width: "86%",
		maxHeight: 120,
		paddingHorizontal: 34,
		paddingVertical: 8,
		fontSize: 16,
		backgroundColor: '#f2f2f2',
		borderRadius: 20,
	},
	popup: {
		padding: 10,
		width: 250,
		// height: 50,
		borderRadius: 8,
		zIndex: 1,
		position: 'absolute',
		alignSelf: "center",
		backgroundColor: "#aad",
	},
	sectionHeader: {
		paddingEnd: 10,
		marginTop: 6,
		marginBottom: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	sectorLogo: {
		width: 34,
		height: 34,
		marginStart: 6,
		borderRadius: 17
	},
	sendButton: {
		backgroundColor: "#f2f2f2",
		width: "12%",
		borderRadius: "50%",
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	textBox: {
		flexDirection: 'row',
		alignItems: "flex-end",
		justifyContent: "space-between",
		paddingTop: 14,
		paddingBottom: 4,
	},
	timestamp: {
		fontSize: 10,
		color: '#555',
		marginTop: 4,
		textAlign: 'right',
	},
	title: {
		width: "54%",
		marginStart: 4,
		borderRadius: 2,
		fontWeight: "600"
	}
});

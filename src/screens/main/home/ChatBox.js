import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Dimensions, Image, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback } from 'react-native';
import Animated, { Easing, interpolate, LinearTransition, useAnimatedKeyboard, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import RNFS from "react-native-fs"
import Mci from "react-native-vector-icons/MaterialCommunityIcons"
import Share from 'react-native-share';
import { useChatBoxSectorId, useDomain, useUser } from '../../../../store/useStore';
import { dateFormatter } from '../../../../utils/dateFormatter';
import { appendMessage } from '../../../../apis/chat.api';
import { url } from '../../../../apis/socket';
import ExpandableInput from './ExpandableInput';
import CameraView from './stackScreens/CameraView';
import Audio from "./mediaTypes/Audio"
import Doc from "./mediaTypes/Doc"
import Picture from "./mediaTypes/Picture"
import Video from "./mediaTypes/Video"
const { width } = Dimensions.get('window');
// _q78mtgTgccT2a

const shareFile = async (fileUri) => {
	try {
		const path = Platform.OS === 'android' ? decodeURIComponent(fileUri.replace('file://', '')) : fileUri;
		const exists = await RNFS.exists(path);
		if (!exists) {
			console.log('File does not exist');
			return;
		}
		const filename = path.split('/').pop();
		const cachePath = `${RNFS.CachesDirectoryPath}/${filename}`;
		await RNFS.copyFile(path, cachePath);
		await Share.open({
			url: `file://${cachePath}`,
		});
	} catch (error) {
		console.log('Error sharing file:', error);
	}
};

function DateInfo({ info }) {
	return (
		<View style={{ marginVertical: 10 }}>
			<View style={{ backgroundColor: '#eee3', paddingHorizontal: 12, borderRadius: 12 }}>
				<Text style={{ color: '#555', fontSize: 12, fontWeight: '600' }}>{info.dateInfo}</Text>
			</View>
		</View>
	)
};

function Note({ isMine, item, handlePress, handleLongPress }) {
	const [noOfLines, setNoOfLines] = useState({})
	return (
		<Pressable
			numberOfLines={noOfLines[item._id] ? undefined : item.pictures?.length === 0 ? 20 : 6}
			onPress={() => { handlePress(item) && setNoOfLines(prev => ({ ...prev, [item._id]: !prev[item._id] })) }}
			onLongPress={() => { handleLongPress(item) }}
			style={
				[styles.bubble,
				{ backgroundColor: isMine ? '#DCF8C6' : '#E5E5EA', borderTopLeftRadius: isMine ? 8 : 0, borderTopRightRadius: isMine ? 0 : 8 }]}
		>
			<Text style={styles.messageText}>{item?.note}</Text>
			<Text style={[styles.timestamp, { color: item.read ? "rgba(31, 138, 239, 1)" : item._id ? "#111" : "#999" }]}>
				{new Date(item.createdAt || item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
			</Text>
		</Pressable>
	)
};

function FileThumbnail({ item, icon, bgColor, deleteFile }) {
	return (
		<View style={[styles.thumbContainer, { backgroundColor: bgColor }]}>
			<Mci name={icon} size={40} color="#fff" />
			<Text style={styles.fileName} numberOfLines={1}>
				{item.name}
			</Text>
			<RemoveButton deleteFile={deleteFile} />
		</View>
	);
};

function RemoveButton({ deleteFile }) {
	return (
		<Mci name="window-close" size={24} color="#444" style={styles.rmFile}
			onPress={deleteFile}
		/>
	)
};

const RenderThumbNail = ({ item, deleteFile }) => {
	if (item.type.startsWith("image/") || item.path)
		return (
			<View style={styles.thumbContainer}>
				<Image source={{ uri: item.localUri || `file://${item.path}` }} style={{ width: 150, height: 100, borderRadius: 8 }} />
				<RemoveButton deleteFile={deleteFile} />
			</View>
		)
	if (item.type.startsWith("audio/")) {
		return <FileThumbnail item={item} icon="music" bgColor="#6C63FF" deleteFile={deleteFile} />;
	} else if (item.type === "application/pdf") {
		return <FileThumbnail item={item} icon="file-pdf-box" bgColor="#d32f2f" deleteFile={deleteFile} />;
	} else if (item.type === "application/vnd.ms-excel" || item.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
		return <FileThumbnail item={item} icon="file-excel-box" bgColor="#1D6F42" deleteFile={deleteFile} />;
	} else if (item.type === "application/msword" || item.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
		return <FileThumbnail item={item} icon="file-word-box" bgColor="#2B579A" deleteFile={deleteFile} />;
	} else if (item.type === "application/vnd.ms-powerpoint" || item.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
		return <FileThumbnail item={item} icon="file-powerpoint-box" bgColor="#FF4B4B" deleteFile={deleteFile} />;
	} else {
		return <FileThumbnail item={item} icon="file" bgColor="#aaa" deleteFile={deleteFile} />;
	}

};

const RenderItem = memo(({ item, selectedMessagesId, hideMessageTools, handlePress, handleLongPress, currAudioId, setCurrAudioId, currAudio, setCurrAudio, allSliders, setAllSliders }) => {
	const { user } = useUser.getState();
	const isMine = item.creator_id === user._id;
	let content;
	const itemRef = useRef(null);

	const getItemY = () => {
		return 0
	};
	// const getItemY = () =>
	// 	new Promise((resolve) => {
	// 		itemRef.current?.measureInWindow((x, y) => resolve(y));
	// 	});

	if (item.note) {
		content = <Note isMine={isMine} item={item} handlePress={handlePress} handleLongPress={handleLongPress} />;
	} else if (item.dateInfo) {
		content = <DateInfo info={item} />;
	} else {
		switch (true) {
			case item.type?.startsWith('image/'):
				content = <Picture item={item} handlePress={handlePress} handleLongPress={handleLongPress} />;
				break;
			case item.type?.startsWith('audio/'):
				content = <Audio
					isMine={isMine}
					item={item}
					currAudioId={currAudioId}
					setCurrAudioId={(id) => setCurrAudioId(id)}
					currAudio={currAudio}
					setCurrAudio={(i) => setCurrAudio(i)}
					allSliders={allSliders}
					setAllSliders={setAllSliders}
					handlePress={handlePress}
					handleLongPress={handleLongPress}
				/>;
				break;
			case item.type?.startsWith('video/'):
				content = <Video item={item} handlePress={handlePress} handleLongPress={handleLongPress} />;
				break;
			case item.type === 'application/pdf':
				content = <Doc isMine={isMine} item={item} icon="file-pdf-box" bgColor="#d32f2f" handlePress={handlePress} handleLongPress={handleLongPress} />;
				break;
			case item.type === 'application/msword':
			case item.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				content = <Doc isMine={isMine} item={item} icon="file-word-box" bgColor="#2B579A" handlePress={handlePress} handleLongPress={handleLongPress} />;
				break;
			case item.type === 'application/vnd.ms-excel':
			case item.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
				content = <Doc isMine={isMine} item={item} icon="file-excel-box" bgColor="#1D6F42" handlePress={handlePress} handleLongPress={handleLongPress} />;
				break;
			case item.type === 'application/vnd.ms-powerpoint':
			case item.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
				content = <Doc isMine={isMine} item={item} icon="file-powerpoint-box" bgColor="#FF4B4B" handlePress={handlePress} handleLongPress={handleLongPress} />;
				break;
			case item.type === 'text/plain':
				content = <Doc isMine={isMine} item={item} icon="file-document-box" bgColor="#ccc" handlePress={handlePress} handleLongPress={handleLongPress} />;
				break;
			default:
				content = <Doc isMine={isMine} item={item} bgColor="#ccc" handlePress={handlePress} handleLongPress={handleLongPress} />;
		}
	}

	return (
		<Pressable style={
			[styles.messageContainer,
			{
				backgroundColor: selectedMessagesId.includes(item._id) ? "#b4c6a766" : null,
				alignItems: item.dateInfo ? "center" : isMine ? 'flex-end' : 'flex-start',
			}]}
			onPress={() => {
				handlePress(item);
				if ((item._id || item.id) === currAudioId) {
					setCurrAudioId("")
					currAudio?.pausePlayer()
				};
			}}
			onLongPress={async () => {
				handleLongPress({ nativeEvent: { pageY: await getItemY() } }, item);
				if ((item._id || item.id) === currAudioId) {
					setCurrAudioId("")
					currAudio?.pausePlayer()
				};
			}}
			onStartShouldSetResponder={() => { hideMessageTools() }}
			ref={itemRef}
		>
			{content}
			{selectedMessagesId.includes(item._id) && (
				<View
					pointerEvents="auto"
					style={{
						...StyleSheet.absoluteFillObject,
						backgroundColor: 'rgba(255,255,255,0.2)',
					}}
				/>
			)}
		</Pressable>
	);
});

export default function ChatBox({ navigation, visible, focusTextInput, onClose, currAudio, setCurrAudio, currAudioId, setCurrAudioId, allSliders, setAllSliders }) {
	const translateX = useSharedValue(width)
	const { currDomainId, domains, setDomains } = useDomain()
	const { chatBoxSectorId } = useChatBoxSectorId()
	const [files, setFiles] = useState([])
	const [textInput, setTextInput] = useState('');
	const [callModalVisible, setCallModalVisible] = useState(false)
	const [selectedMessagesId, setSelectedMessagesId] = useState([]);
	const [y, setY] = useState(0);
	const [cameraOn, setCameraOn] = useState(false)
	const domain = domains.find(i => i._id === currDomainId)
	const sector = domain?.sectors?.find(j => j._id === chatBoxSectorId)

	const keyboard = useAnimatedKeyboard({
		isStatusBarTranslucentAndroid: true,
	})
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }, { translateY: -keyboard.height.value }],
	}));

	const handleSendMessage = async () => {
		try {
			if (!textInput.trim() && files.length === 0) {
				return
			}
			if (textInput) {
				appendMessage(textInput, chatBoxSectorId, currDomainId)
			} else {
				for (let i of files) {
					appendMessage(i, chatBoxSectorId, currDomainId)
				}
			}
			setTextInput("");
			setFiles([]);
		} catch (err) {
			console.log(err)
		}
	};

	const handleNavigate = () => {
		if (currDomainId === "ccccccc" && sector.title !== "AI") {
			navigation.navigate("post", { screen: "profile", params: { _id: sector._id, title: sector.title, routeName: "main" } })
		} else if (currDomainId === "ccccccc" && sector.title === "AI") {
		} else {
			navigation.navigate("sectorDetail", {})
		}
	};

	const handlePress = (item) => {
		if (selectedMessagesId.length === 0) {
			return true
		} else {
			if (selectedMessagesId.includes(item._id)) {
				setSelectedMessagesId(prev => prev.filter(i => i !== item._id));
			} else {
				setSelectedMessagesId(prev => [...prev, item._id]);
			}
			return false
		}
	};

	const handleLongPress = (event = {}, item) => {
		// const { nativeEvent } = event;
		// const { pageY } = nativeEvent;
		// setY(pageY)
		setSelectedMessagesId(prev => [...prev, item._id]);
	};

	const delMessage = (_ids) => {
		setDomains(prev =>
			prev.map(d => {
				if (d._id !== currDomainId) return d;
				return {
					...d,
					sectors: d.sectors.map(s => {
						if (s._id !== chatBoxSectorId) return s;
						return {
							...s,
							data: s.data.filter(i => !_ids.includes(i._id))
						};
					}),
				};
			})
		);
		setSelectedMessagesId([])
	};
	useEffect(() => {
		translateX.value = withTiming(
			visible ? 0 : width - 75,
			{
				duration: 450,
				easing: Easing.out(Easing.exp),
			}
		);
	}, [visible]);

	useEffect(() => {
		setDomains(prev =>
			prev.map(d => {
				if (d._id !== currDomainId) return d;
				return {
					...d,
					sectors: d.sectors.map(s => {
						if (s._id !== chatBoxSectorId) return s;
						return {
							...s,
							unread: 0,
						};
					}),
				};
			})
		);
	}, []);

	useEffect(() => {
		if (Platform.OS === 'android') {
			const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
				if (selectedMessagesId.length >= 1) {
					setSelectedMessagesId([])
				} else {
					onClose?.();
				}
				return true;
			});
			return () => { backHandler.remove() };
		}
	}, []);

	return (
		<Animated.View style={[styles.container, animatedStyle]}>
			<Modal visible={cameraOn} onRequestClose={() => setCameraOn(false)}>
				<CameraView setFiles={setFiles} close={() => { setCameraOn(false) }} />
			</Modal>
			{selectedMessagesId.length >= 1 &&
				<View style={[styles.popup]}>
					<Mci name="close" size={28} color="#fff" onPress={() => setSelectedMessagesId([])} />
					<Mci name="delete-outline" size={28} color="#fff" onPress={() => delMessage(selectedMessagesId)} />
					<Mci name="share-variant" size={26} color="#fff" onPress={() => shareFile(item.uri)} />
					<Mci name="share" size={26} color="#fff" onPress={() => shareFile(item.uri)} />
				</View>
			}
			<View style={styles.sectionHeader} >
				<Mci name="arrow-left-thin" size={26} onPress={() => {
					if (selectedMessagesId.length >= 1) {
						setSelectedMessagesId([])
					} else {
						onClose();
					}
				}} />
				<Image source={{ uri: `${url}/files/domainLogo/${sector.logo}`, headers: { Authorization: "Bearer " + "accessToken" } }} style={styles.sectorLogo} />
				<Text numberOfLines={1} style={[styles.title, {}]} onPress={handleNavigate}>
					{sector.title}
				</Text>
				<Mci name="phone-outline" size={24} onPress={() => { setCallModalVisible(true) }} style={{ marginStart: "auto", marginEnd: 18 }} />
				<Mci name="video-outline" size={24} onPress={() => { setCallModalVisible(true) }} />
			</View>
			<Animated.FlatList
				inverted
				data={sector.data}
				initialNumToRender={15}
				removeClippedSubviews
				maxToRenderPerBatch={50}
				keyExtractor={(item) => item._id || item.id}
				itemLayoutAnimation={LinearTransition}
				renderItem={({ item }) => <RenderItem
					item={item}
					selectedMessagesId={selectedMessagesId}
					hideMessageTools={() => { setSelectedMessagesId([]) }}
					handlePress={(e) => {
						if (!item.dateInfo && item._id) {
							return handlePress(item);
						}
					}}
					handleLongPress={(e) => {
						if (!item.dateInfo && item._id) {
							handleLongPress(e, item);
						}
					}}
					currAudio={currAudio}
					setCurrAudio={setCurrAudio}
					currAudioId={currAudioId}
					setCurrAudioId={setCurrAudioId}
					allSliders={allSliders}
					setAllSliders={setAllSliders}
				/>}
				style={{ marginBottom: 8 }}
				contentContainerStyle={{
					flexGrow: 1,
					justifyContent: 'flex-end',
				}}
				ListEmptyComponent={<Text style={{ textAlign: "center", color: "#bbb" }}>Type to send your first message</Text>}
			/>
			<FlatList
				horizontal
				keyboardShouldPersistTaps="always"
				showsHorizontalScrollIndicator={false}
				data={files}
				keyExtractor={item => item.sourceUri || item.path}
				contentContainerStyle={{ columnGap: 4, alignItems: "center", paddingStart: 4 }}
				renderItem={({ item }) =>
					<RenderThumbNail
						item={item}
						deleteFile={() => setFiles(prev => prev.filter(i => (i.sourceUri || i.path) !== (item.sourceUri || item.path)))}
					/>}
			/>
			<View style={[styles.textBox]}>
				<ExpandableInput
					navigation={navigation}
					textInput={textInput}
					focusTextInput={focusTextInput}
					setTextInput={setTextInput}
					setFiles={setFiles}
					setCameraOn={() => setCameraOn(true)}
				/>
				<TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
					<Mci name={textInput || files.length > 0 ? "send" : "microphone-outline"} size={28} color="#af7" />
				</TouchableOpacity>
			</View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	bubble: {
		paddingHorizontal: 10,
		borderRadius: 8,
		borderBottomEndRadius: 0,
		maxWidth: '90%',
	},
	container: {
		flex: 1,
		position: 'absolute',
		top: 0,
		bottom: 0,
		width: width - 75,
		alignSelf: "flex-end",
		paddingTop: 8,
		backgroundColor: '#fff',
		// paddingHorizontal: 4,
		zIndex: 2
	},
	cont: {
		width: "100%",
		height: "100%",
	},
	extraIcons: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		marginBottom: 4,
	},
	fileName: {
		fontSize: 11,
		color: "#fff",
		marginTop: 2,
		paddingHorizontal: 4,
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
		paddingStart: 39,
		fontSize: 16,
		backgroundColor: '#f2f2f2',
		borderRadius: 20,
	},
	mediaIcon: {
		backgroundColor: "#fafafa",
		borderRadius: "50%",
		justifyContent: "center",
		alignItems: "center",
		height: 30,
		width: "9%",
		position: "absolute",
		bottom: 6,
		start: 6,
		zIndex: 1,
	},
	messageContainer: {
		marginVertical: 4,
		marginStart: 2,
		marginEnd: 4,
	},
	messageText: {
		fontSize: 14,
		fontWeight: 500,
	},
	popup: {
		padding: 4,
		height: 38, // cover sector pic
		width: "100%",
		borderRadius: 2,
		zIndex: 1,
		position: 'absolute',
		alignSelf: "center",
		flexDirection: "row",
		alignItems: "center",
		columnGap: 24,
		backgroundColor: "#aad",
	},
	rmFile: {
		position: "absolute",
		right: 2,
		top: 2
	},
	sectionHeader: {
		paddingEnd: 10,
		marginTop: 4,
		marginBottom: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	sectorLogo: {
		width: 34,
		height: 34,
		marginStart: 6,
		borderRadius: 17,
		backgroundColor: "#ccc"
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
		paddingHorizontal: 4,
		// backgroundColor: "grey"
	},
	thumbContainer: {
		width: 160,
		height: 100,
		marginVertical: 20,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#f2f2f2",
	},
	timestamp: {
		fontSize: 10,
		textAlign: 'right',
	},
	title: {
		width: "54%",
		marginStart: 4,
		borderRadius: 2,
		fontWeight: "600",
	},
});

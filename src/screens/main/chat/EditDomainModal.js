import React, { useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import Mci from "react-native-vector-icons/MaterialCommunityIcons"
import { Animated, Easing, ActivityIndicator, Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { RadioButton } from "react-native-paper";
import { launchImageLibrary } from 'react-native-image-picker';
import { useDomain, useToken } from '../../../../store/useStore';
import { refreshAccessToken, url } from '../../../../apis/chat.api';
import showSnackBar from '../../../../utils/snackBar';
import SnackBarView from '../../../components/SnackBarView';


export default function EditDomainModal({ _id, editDomainModalVisible, setEditDomainModalVisible }) {
	const { domains, setDomains } = useDomain()
	const { accessToken } = useToken()
	let currDomain = domains?.find(i => i._id === _id)
	const [name, setName] = useState(currDomain?.domain);
	const [image, setImage] = useState({});
	const [loading, setLoading] = useState(false)
	const [rLoading, setRLoading] = useState(false)
	const [editPermission, setEditPermission] = useState("owner");
	const [addSectorsPermission, setAddSectorsPermission] = useState("owner");
	const loopRef = useRef(null)
	const spinAnim = useRef(new Animated.Value(0)).current;
	const spinInterpolate = spinAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg'],
	});

	const changeImage = async (i) => {
		const formData = new FormData()
		if (!i) {
			return
		}
		formData.append("file", {
			uri: i.uri,
			type: i.type,
			name: currDomain.domain + "-" + i.fileName
		})
		try {
			const httpCall = await fetch(`${url}/domain/${_id}/logo`, {
				headers: {
					Authorization: "Bearer " + accessToken,
				},
				method: "PATCH",
				body: formData
			})
			const res = await httpCall.json()
			if (res.exp) {
				let accessToken_ = await refreshAccessToken()
				if (accessToken_) {
					changeImage()
				}
			} else if (res.success === false) {
				showSnackBar(res.message)
			} else if (res.success === true) {
				// setDomains(prev =>
				// 	prev.map(d => {
				// 		if (d._id !== _id) return d
				// 		return {
				// 			...d,
				// 			logo: res.data
				// 		};
				// 	})
				// );
				showSnackBar("picture updated")
			}
		} catch (err) {
			console.log(err)
		}
	}

	const handleImagePick = () => {
		launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => { ////////////////////////////////////////
			if (response.assets && response.assets.length > 0) {
				setImage(response.assets[0]);
				changeImage(response.assets[0])
			}
		})
	}

	const resetLink = async () => {
		setRLoading(true)
		try {
			let accessToken = useToken.getState().accessToken
			const httpCall = await fetch(`${url}/reset-link/${currDomain._id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + accessToken

				},
			})
			const res = await httpCall.json()
			if (res.exp) {
				let accessToken_ = await refreshAccessToken(url, accessToken)
				if (accessToken_) {
					resetLink()
				}
			} else if (res.success === true) {
				showSnackBar("Link has been reset")
			}
		} catch (err) {
			showSnackBar("an error occured")
		} finally {
			setRLoading(false)
		}
	}

	const saveChanges = async () => {
		const formData = new FormData()
		formData.append("name", name)
		if (image.uri) {
			formData.append("file", {
				uri: image.uri,
				type: image.type,
				name: domainName + "-" + image.fileName
			})
		}
		try {
			let accessToken = useToken.getState().accessToken
			const httpCall = await fetch(`${url}/edit-domain/${_id}`, {
				method: "POST",
				headers: {
					Authorization: "Bearer " + accessToken
				},
				body: formData
			})
			const res = await httpCall.json()
			if (res.exp) {
				let accessToken_ = await refreshAccessToken()
				if (accessToken_) {
					saveChanges()
				}
			} else if (res.success === true) {
			}
		} catch (err) {
			showSnackBar("an error occured")
		} finally {
		}
	}

	const allowEdit = async (value) => {
		setEditPermission(value)
		try {
			const httpCall = await fetch(`${url}/domain/${_id}/q?setting=allow-edit`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + accessToken
				},
				body: JSON.stringify({ holder: value })
			})
			const res = await httpCall.json()
			if (res.exp) {
				let accessToken_ = await refreshAccessToken()
				if (accessToken_) {
					saveChanges()
				}
			} else if (res.success === true) {
			}
		} catch (err) {
			showSnackBar("an error occured")
		} finally {
		}
	}

	const allowAddSector = async (value) => {
		setAddSectorsPermission(value)
		try {
			const httpCall = await fetch(`${url}/domain/${_id}/q?setting=allow-add-sector`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + accessToken
				},
				body: JSON.stringify({ holder: value })
			})
			const res = await httpCall.json()
			if (res.exp) {
				let accessToken_ = await refreshAccessToken()
				if (accessToken_) {
					saveChanges()
				}
			} else if (res.success === true) {
			}
		} catch (err) {
			showSnackBar("an error occured")
		} finally {
		}
	}

	useEffect(() => {
		if (rLoading) {
			loopRef.current = Animated.loop(
				Animated.timing(spinAnim, {
					toValue: 1,
					duration: 1500,
					easing: Easing.linear,
					useNativeDriver: true,
				})
			);
			loopRef.current.start();
		} else {
			if (loopRef.current) {
				loopRef.current.stop()
				spinAnim.setValue(0)
			}
		}

		return () => {
			if (loopRef.current) loopRef.current.stop()
		};
	}, [rLoading]);

	return (
		<Modal
			visible={editDomainModalVisible}
			animationType="fade"
			onRequestClose={() => { setEditDomainModalVisible(false); setName(""); setImage({}) }}
		>
			<ScrollView showsVerticalScrollIndicator={false} style={styles.modalContainer}>
				<Text style={styles.modalText}>{currDomain?.domain}</Text>
				<TouchableOpacity activeOpacity={0.7} style={styles.imgView} onPress={handleImagePick}>
					<Image source={{ uri: image.uri ? image.uri : `${url}/img-file/domainImg/${currDomain?.logo}` }} style={styles.imagePreview} />
				</TouchableOpacity>

				<View style={styles.copy}>
					<TouchableOpacity style={{flexDirection: "row", columnGap: 6, marginBottom: 4}} onPress={() => {showSnackBar("link copied!")}}>
						<Text style={{ color: "#66bd", fontWeight: 500 }}>rp://fghjlkjhgfdsdfghjkiuytrty</Text>
						<Mci name="content-copy" color="#ccc" size={16} />
					</TouchableOpacity>
					{
						rLoading ?
							<Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
								<Mci name="autorenew" color="#ccc" size={24} />
							</Animated.View>
							:
							<Mci name="refresh" color="#888" size={24} onPress={() => resetLink()} />
					}
				</View>

				<View>
					<Text style={{ fontSize: 15 }}>Who can edit domain?</Text>
					<RadioButton.Group
						onValueChange={value => allowEdit(value)}
						value={editPermission}
					>
						<RadioButton.Item label="Owner" value="owner" labelStyle={{ fontSize: 14 }} style={{ paddingVertical: 1 }} />
						<RadioButton.Item label="Private members" value="admin" labelStyle={{ fontSize: 14 }} style={{ paddingVertical: 1 }} />
						<RadioButton.Item label="Everybody" value="everybody" labelStyle={{ fontSize: 14 }} style={{ paddingVertical: 1 }} />
					</RadioButton.Group>

					<Text style={{ fontSize: 15, marginTop: 26 }}>Who can add sectors?</Text>
					<RadioButton.Group
						onValueChange={value => allowAddSector(value)}
						value={addSectorsPermission}
					>
						<RadioButton.Item label="Owner" value="owner" labelStyle={{ fontSize: 14 }} style={{ paddingVertical: 1 }} />
						<RadioButton.Item label="Private members" value="admin" labelStyle={{ fontSize: 14 }} style={{ paddingVertical: 1 }} />
						<RadioButton.Item label="Everybody" value="everybody" labelStyle={{ fontSize: 14 }} style={{ paddingVertical: 1 }} />
					</RadioButton.Group>
				</View>

				<View style={{ marginTop: "20%", rowGap: 18 }}>
					<TouchableOpacity activeOpacity={0.8} style={[styles.btn, { backgroundColor: '#cccd' }]} onPress={() => { setEditDomainModalVisible(false) }}>
						<Text style={{ color: "#222" }}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
			<View style={{ zIndex: 1, width: "70%", alignSelf: "center", }}>
				<SnackBarView />
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	btn: {
		width: "100%",
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "center",
		height: 50,
	},
	copy: {
		marginVertical: "8%",
		// marginEnd: 16,
		// flexDirection: "row",
		// justifyContent: "space-around",
		alignItems: "center"
	},
	imagePreview: {
		width: 110,
		height: 110,
		borderRadius: 75
	},
	imgView: {
		width: 110,
		height: 110,
		borderRadius: "50%",
		marginTop: 20,
		backgroundColor: 'white',
		alignSelf: 'center',
		shadowColor: '#66b',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 5,
	},
	input: {
		borderBottomWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 10,
		marginTop: 20,
		marginBottom: 20,
		fontSize: 16,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "#fff",
		borderRadius: 10,
		margin: 20,
	},
	modalText: {
		fontSize: 14,
		fontWeight: 600,
		marginBottom: 10,
		textAlign: 'center',
		color: '#333',
	},
	resetView: {
		backgroundColor: '#40ffb4033',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: "10%"
	},
	resetText: {
		fontSize: 16,
		fontWeight: 500,
		color: "#66b" //'#0fcc',
	}
});

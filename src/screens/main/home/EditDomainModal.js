import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDomain, useToken } from '../../../../store/useStore';
import { refreshAccessToken } from '../../../../utils/refreshAccessToken';
import { url } from '../../../../utils/https';
import showSnackBar from '../../../../utils/SnackBar';


export default function EditDomainModal({ _id, editDomainModalVisible, setEditDomainModalVisible }) {
	const { domains } = useDomain()
	let currDomain = domains?.find(i => i._id === _id)
	const [name, setName] = useState(currDomain?.domain);
	const [imageUri, setImageUri] = useState("");
	const [loading, setLoading] = useState(false)
	const [rLoading, setRLoading] = useState(false)

	const handleImagePick = () => {
		launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => { ////////////////////////////////////////
			if (response.assets && response.assets.length > 0) {
				console.log(response.assets[0].uri);
				setImageUri(response.assets[0].uri);
			}
		})
	}

	const resetLink = async () => {
		setRLoading(true)
		try {
			let accessToken = useToken.getState().accessToken
			const httpCall = await fetch(`${url}/reset-link/${currDomain._id}`, {
				method: "PATCH", ////////////////////////////////
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + accessToken

				},
			})
			const res = await httpCall.json()
			console.log(res)
			if (res.exp) {
				console.log("exp token")
				let accessToken_ = await refreshAccessToken(url, accessToken)
				if (accessToken_) {
					resetLink()
				} else {
					console.log("repeat")
				}
			} else if (res.success === true) {
				setRLoading(false)
				showSnackBar("Link has been reset")
			}
		} catch (err) {
			showSnackBar("an error occured")
		} finally {
			setRLoading(false)
		}
	}

	const saveChanges = async () => {
		setLoading(true)
		const formData = new FormData()
		formData.append("name", name)
		if (imageUri.uri) { /////////////////////////////////////////////////
			formData.append("file", {
				uri: imageUri.uri,
				type: imageUri.type,
				name: domainName + "-" + imageUri.fileName
			})
		}
		try {
			let accessToken = useToken.getState().accessToken
			const httpCall = await fetch(`${url}/edit-domain/${currDomainId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + accessToken
				},
				body: formData
			})
			const res = await httpCall.json()
			console.log(res)
			if (res.exp) {
				console.log("exp token")
				let accessToken_ = await refreshAccessToken()
				if (accessToken_) {
					saveChanges()
				} else {
					console.log("repeat")
				}
			} else if (res.success === true) {
			}
		} catch (err) {
			showSnackBar("an error occured")
		} finally {
			setLoading(false)
		} //${url}/img-file/domainImg/${i.logo}
	}

	return (
		<Modal
			visible={editDomainModalVisible}
			animationType="fade"
			onRequestClose={() => {setEditDomainModalVisible(false); setName(""); setImageUri("")}}
		>
			<View style={styles.modalContainer}>
				<Text style={styles.modalTitle}>{currDomain?.domain}</Text>
				<TouchableOpacity activeOpacity={0.7} style={styles.imgView} onPress={handleImagePick}>
					<Image source={{ uri: imageUri ? imageUri : `${url}/img-file/domainImg/${currDomain?.logo}` }} style={styles.imagePreview} /> 
				</TouchableOpacity>

				<View style={styles.copy}>
					<Text style={{ color: "#66bd", marginStart: 15, fontWeight: 500 }}>rp://fghjlkjhgfdsdfghjkiuytrty</Text>
					<Icon name="copy-outline" color="#ccc" size={20} onPress={() => { showSnackBar("link coied!") }} />
				</View>
				<TextInput
					value={name}
					defaultValue={currDomain?.domain}
					onChangeText={setName}
					placeholder="Enter new domain name"
					placeholderTextColor="#ddd"
					style={styles.input}
				/>
				{rLoading ? <ActivityIndicator marginBottom={24} marginTop={"10%"} /> :
					<TouchableOpacity style={styles.resetView} onPress={() => resetLink()}>
						<Text style={styles.resetText}>Reset Link</Text>
					</TouchableOpacity>
				}

				<View style={{ marginTop: "20%", rowGap: 18 }}>
					<TouchableOpacity activeOpacity={0.8} style={[styles.btn, { backgroundColor: loading ? "#66b8" : "#66bd" }]} onPress={() => !loading && saveChanges()}>
						{loading ? <ActivityIndicator /> : <Text style={{ color: "#fff" }}>Save Changes</Text>}
					</TouchableOpacity>
					<TouchableOpacity activeOpacity={0.8} style={[styles.btn, { backgroundColor: '#cccd' }]} onPress={() => { setEditDomainModalVisible(false) }}>
						<Text style={{ color: "#222" }}>Cancel</Text>
					</TouchableOpacity>
				</View>
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
		marginTop: "20%",
		marginEnd: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center"
	},
	imagePreview: {
		width: 150,
		height: 150,
		borderRadius: 75
	},
	imgView: {
		width: 150,
		height: 150,
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
	modalTitle: {
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

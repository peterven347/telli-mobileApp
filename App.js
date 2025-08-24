import React, { useEffect, useRef, useState } from "react"
import * as Keychain from "react-native-keychain"
import AsyncStorage from '@react-native-async-storage/async-storage'
import Ion from "react-native-vector-icons/Ionicons"
import Mci from 'react-native-vector-icons/MaterialCommunityIcons'
import PushNotification from 'react-native-push-notification'
import SplashScreen from 'react-native-splash-screen'
import { ActivityIndicator, AppState, Button, I18nManager, Linking, PermissionsAndroid, Pressable, StatusBar, View } from "react-native"
import { getApp } from '@react-native-firebase/app'
import { getMessaging, onMessage, requestPermission } from '@react-native-firebase/messaging'
import { Modal, PaperProvider, Portal } from "react-native-paper"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useDomain, useModal, usePending, useSnackBar, useToken, useUrl, useUser } from "./store/useStore"
import getContacts from "./utils/getContacts"
import linking from "./utils/linking"
import SignUp from "./src/screens/auth/SignUp"
import Login from "./src/screens/auth/Login"
import ProfileScreen from "./src/screens/main/profile/ProfileScreen"
import Settings from "./src/screens/main/profile/Settings"
import ResizableComponent from "./src/screens/main/home/ResizableComponent"
import SideComponent from "./src/screens/main/home/SideComponent"
import AddDomain from "./src/screens/main/home/AddDomain"
import AddSector from "./src/screens/main/home/AddSector"
import AddContacts from "./src/screens/main/home/AddContacts"
import showSnackBar from "./utils/SnackBar"
import SnackBarView from "./src/components/SnackBarView"
import { refreshAccessToken, sendPendingIssue, initSocket, url } from "./utils/https"

I18nManager.allowRTL(true)
const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const requestPermissions = async () => {
	if (Platform.OS === 'android') {
		const notificationsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
		if (!notificationsGranted) {
			await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
				// {
				// 	title: 'Notification Permission',
				// 	message: 'Allow Telli send you notifications',
				// 	buttonNeutral: 'Ask Me Later',
				// 	buttonNegative: 'Cancel',
				// 	buttonPositive: 'OK',
				// },
			)
		}
		const contactsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
		if (!contactsGranted) {
			// await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS) // check in the app later when needed
		}
	}
}

const getDomain = async () => {
	const { domains, setCurrDomainId, setDomains } = useDomain.getState()
	try {
		const c = await AsyncStorage.getItem("currDomain")
		const p = await AsyncStorage.getItem("pinned")
		const pinned = JSON.parse(p)

		let accessToken = useToken.getState().accessToken

		const httpCall = await fetch(`${url}/domain`, {
			headers: {
				Authorization: "Bearer " + accessToken,
			}
		})

		const res = await httpCall.json()
		if (res.exp) {
			let accessToken_ = await refreshAccessToken()
			if (accessToken_) {
				getDomain()
			}
		} else if (res.success === true) {
			res.domain?.forEach(i => {
				if (pinned?.includes(i._id)) {
					i.pinned = true
				}
			})
			const updatedDomains = await res.domain.map(newDomain => {
				const existingDomain = domains.find(d => d._id === newDomain._id);
				if (!existingDomain) return newDomain
				const existingSectorMap = new Map(existingDomain.sectors.map(sector => [sector._id, sector]));
				const mergedSectors = newDomain.sectors.map(sector => {
					return existingSectorMap.get(sector._id) || sector;
				});

				return {
					...existingDomain,
					sectors: mergedSectors
				};
			});
			setDomains(updatedDomains);

			const foundDomain = res.domain.find(i => i._id === c)
			if (foundDomain) {
				setCurrDomainId(foundDomain._id)
			} else {
				setCurrDomainId(res.domain[0]._id)
			}
			await AsyncStorage.setItem("cacheDomain", JSON.stringify(updatedDomains))
		}
	} catch (err) {
		console.log((new Date()).toLocaleTimeString(), err)
		showSnackBar("an error occured")
	}
}

const getIssuesVoted = async () => {
	const { setUser } = useUser.getState()
	try {
		let accessToken = useToken.getState().accessToken
		const httpCall = await fetch(`${url}/api/user/issues-voted`, {
			headers: {
				Authorization: "Bearer " + accessToken,
			}
		})
		const res = await httpCall.json()
		if (res.exp) {
			let accessToken_ = await refreshAccessToken()
			if (accessToken_) {
				getIssuesVoted()
			}
		} else if (res.success === true) {
			setUser(prev => ({
				...prev,
				issues_voted: res.issues_voted
			}))
		}
	} catch (err) {

	}
}

const sync = async () => {
	try {
		const pending = await AsyncStorage.getItem("pending")
		const parsed = JSON.parse(pending)
		if (parsed !== null && parsed.state.pending.length >= 1) {
			// await Promise.all(parsed.state.pending.map(i => sendPendingIssue(i))) //if order does not matter
			for (const i of parsed.state.pending) {
				await sendPendingIssue(i)
			}
		}
	} catch (err) {
		console.log(err)
	}
}

function Main({ navigation }) {
	const [dropVisible, setDropVisible] = useState(false)
	return (
		<Pressable style={{ flex: 1 }} onPress={() => { setDropVisible(false) }}>
			<SideComponent navigation={navigation} dropVisible={dropVisible} setDropVisible={setDropVisible} />
			<ResizableComponent navigation={navigation} />
		</Pressable>
	)
}

function HomeScreen() {
	return (
		<>
			{/* <Button title={"kk".toString()} onPress={getDomain} style={{ marginTop: 64 }} /> */}
			<Stack.Navigator screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}>
				<Stack.Screen name="main" component={Main} />
				<Stack.Screen name="addDomain" component={AddDomain} />
				<Stack.Screen name="addSector" component={AddSector} />
				<Stack.Screen name="addContacts" component={AddContacts} />
			</Stack.Navigator>
		</>
	)
}

export default function App() {
	const messaging = getMessaging(getApp())
	const appState = useRef(AppState.currentState);
	const [initialRoute, setInitialRoute] = useState(false)
	const { accessToken } = useToken()
	const { modal } = useModal()
	const { setCurrDomainId, setDomains, setFetchedSectorIds } = useDomain()

	const getToken = async () => {
		const refreshToken = await Keychain.getGenericPassword({ service: "refreshToken" })
		if (refreshToken) {
			setInitialRoute(true)
		}
		SplashScreen.hide()
	}

	useEffect(() => {
		async function connect() {
			if (accessToken) {
				console.log("access token available")
				const socket = await initSocket(accessToken);
				socket.connect()
				socket.on("connect", () => {
					console.log("socket connected")
					sync()
					getIssuesVoted()
					getDomain()
					socket.emit("joinSectors")
				})
				socket.on("note", ({ data, domainId }) => {
					setDomains(prev =>
						prev.map(d => {
							if (d._id !== domainId) return d
							return {
								...d,
								sectors: d.sectors.map(s => {
									if (s._id !== data.sector_id) return s;
									return {
										...s,
										time: Date.now(),
										data: [data, ...(s.data || [])]
									};
								}),
							};
						})
					);
				})
				socket.on("connect_error", (err) => {
					if (err.message === "invalid") {
						console.log("Token expired or missing");
						(async () => {
							await refreshAccessToken();
						})();
					}
					else {
						console.log(err);
						console.log("socket error");
					}
				});
				socket.on("disconnect", () => {
					console.log("ds")
					setFetchedSectorIds([])
				})
			} else {
				console.log("no access token on start")
			}
		}
		connect();
		return () => {
			console.log("unmounted")
		}
	}, [accessToken])

	useEffect(() => {
		getToken();
		(async () => {
			const req = await requestPermission(messaging)
			// console.log(req, "req")
			// const token = await getToken(messaging)
			// console.log('FCM Token:', token)
		})()

		PushNotification.createChannel({
			channelId: 'tells',
			channelName: 'Tells',
			// channelDescription: 'A channel to categorize your notifications',
			soundName: 'default',
			importance: 4,
			vibrate: true,
		})
		PushNotification.createChannel({
			channelId: 'other',
			channelName: 'Other',
			soundName: 'default',
			importance: 4,
			vibrate: true,
		})

		requestPermissions()
		onMessage(messaging, async remoteMessage => {
			if (remoteMessage.data.domain) {
				const newDomain = JSON.parse(remoteMessage.data.domain)  /////check backend
				setDomains(prev => [...prev, newDomain])
			}
		})
	}, [])

	useEffect(() => {
		(async () => {
			console.log("getting cached domain")
			const c = await AsyncStorage.getItem("currDomain")
			let cacheDomain = await AsyncStorage.getItem("cacheDomain")
			let domains = useDomain.getState().domains
			if (cacheDomain && domains.length === 0) {
				cacheDomain = JSON.parse(cacheDomain)
				setDomains(cacheDomain)
				const foundDomain = cacheDomain.find(i => i._id === c)
				if (foundDomain) {
					setCurrDomainId(foundDomain._id)
				}
			}
		})()

		const subscription = AppState.addEventListener('change', async nextAppState => {
			let domains = useDomain.getState().domains
			if (appState.current.match(/active/) && nextAppState.match(/inactive|background/) && domains.length >= 1) {
				console.log("saving cached domain")
				await AsyncStorage.setItem("cacheDomain", JSON.stringify(domains))
			}
			appState.current = nextAppState
		})
		return () => subscription.remove()
	}, [])

	useEffect(() => {
		(async () => {
			const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
			if (granted) {
				getContacts()
			}
		})()
	}, [])

	useEffect(() => {
		const handleDeepLink = (event) => {
			console.log('Received URL:', event.url)
		}
		const subscription = Linking.addEventListener('url', handleDeepLink)
		return () => {
			subscription.remove()
		}
	}, [])

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<PaperProvider>
				<Portal>
					<Modal visible={modal} transparent={true} >
						<View style={{ flex: 1, backgroundColor: "#0004", justifyContent: "center" }}>
							<ActivityIndicator size="large" color="#66b" style={{ alignSelf: "center" }} />
							<ActivityIndicator size="small" color="#88b" style={{ alignSelf: "center" }} />
						</View>
					</Modal>
				</Portal>
				<NavigationContainer linking={linking}>
					<StatusBar animated={true} backgroundColor="#3399" />
					{/* <Button title={initialRoute.toString()} onPress={ttt} style={{ marginTop: 64 }} /> */}
					{
						accessToken ?
							<Tab.Navigator
								screenOptions={({ route }) => ({
									headerShown: false,
									tabBarHideOnKeyboard: true,
									tabBarShowLabel: false,
									tabBarIcon: ({ focused }) => {
										let Icon
										let colorx
										let iconx
										let sizex
										colorx = focused ? "#117" : "#fffc"
										switch (route.name) {
											case "Home":
												Icon = Mci
												iconx = "home"
												sizex = 34
												break
											case "Profile":
												Icon = Ion
												iconx = "person-sharp"
												sizex = 28
												break
										}
										return (
											<Icon name={iconx} color={colorx} size={sizex} style={{
												width: 100,
												height: 34,
												borderRadius: 50,
												textAlign: "center",
												backgroundColor: focused ? "#44b6" : "#ddd",
												// transform: focused ? [{ scale: 1.2 }] : [{ scale: 1 }],
											}} />
										)
									},
									tabBarIconStyle: { marginTop: 6 },
									tabBarStyle: {
										// position: 'absolute',
										elevation: 0,
										borderTopWidth: 0,
										zIndex: 1
									},
									tabBarBackground: () => ( // this removes the grey opacity when I click tab icon
										<View
											style={{
												backgroundColor: "#fdfdfd",
												height: '100%',
												width: '100%',
												borderWidth: 0
											}}
										/>
									),
								})}
							>
								{/* <Tab.Screen name="Profile" component={Settings} /> */}
								<Tab.Screen name="Home" component={HomeScreen} />
								<Tab.Screen name="Profile" component={ProfileScreen} />
							</Tab.Navigator>
							:
							<Stack.Navigator
								initialRouteName={initialRoute ? "Login" : "SignUp"}
								screenOptions={{
									headerShown: false,
									animation:"slide_from_right",
									presentation: "modal"
								}}
							>
								<Stack.Screen name="Login" component={Login}/>
								<Stack.Screen name="SignUp" component={SignUp} />
							</Stack.Navigator>
					}
					<SnackBarView />
				</NavigationContainer>
			</PaperProvider>
		</GestureHandlerRootView>
	)
}
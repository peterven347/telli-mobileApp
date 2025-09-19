import React, { useEffect, useMemo, useRef, useState } from "react"
import * as Keychain from "react-native-keychain"
import AsyncStorage from '@react-native-async-storage/async-storage'
import Ion from "react-native-vector-icons/Ionicons"
import Mci from 'react-native-vector-icons/MaterialCommunityIcons'
import PushNotification from 'react-native-push-notification'
import SplashScreen from 'react-native-splash-screen'
import { ActivityIndicator, AppState, Button, I18nManager, Linking, PermissionsAndroid, Pressable, StatusBar, Text, View } from "react-native"
import { getApp } from '@react-native-firebase/app'
import { getMessaging, onMessage, requestPermission } from '@react-native-firebase/messaging'
import { Modal, PaperProvider, Portal } from "react-native-paper"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from "react-native-safe-area-context"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useChatBoxSectorId, useDomain, useModal, usePending, useSnackBar, useToken, useUser } from "./store/useStore"
import { refreshAccessToken, sendPendingIssue, sendPendingVotes, initSocket, url } from "./utils/https"
import { isSameDay } from "./utils/isSameDay"
import { createChat } from "./utils/createChat"
import getContacts from "./utils/getContacts"
import showSnackBar from "./utils/snackBar"
import linking from "./utils/linking"
import SnackBarView from "./src/components/SnackBarView"

import Login from "./src/screens/auth/Login"
import SignUp from "./src/screens/auth/SignUp"
import AddContacts from "./src/screens/main/home/stackScreens/AddContacts"
import AddDomain from "./src/screens/main/home/stackScreens/AddDomain"
import AddSector from "./src/screens/main/home/stackScreens/AddSector"
import SectorDetail from "./src/screens/main/home/stackScreens/SectorDetail"
import SectorView from "./src/screens/main/home/SectorView"
import ResizableComponent from "./src/screens/main/home/stackScreens/ResizableComponent"
import SideComponent from "./src/screens/main/home/stackScreens/SideComponent"
import Live from "./src/screens/main/LiveScreen"
import ProfileScreen from "./src/screens/main/ProfileScreen"
import HomeScreen from "./src/screens/main/HomeScreen"

I18nManager.allowRTL(true)
const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const userContacts = {
	_id: "ccccccc",
	domain: "Contacts",
	pinned: true,
	settings: {},
	sectors: [
		{
			_id: "ai",
			domain_id: "ccccccc",
			title: "AI",
			status: "private",
			time: Date.now(),
			data: []
		}
	]
}

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
			const existingUserContacts = domains.find(d => d._id === "ccccccc");
			const updatedDomains = await res.domain.map(newDomain => {
				const existingDomain = domains.find(d => d._id === newDomain._id);
				if (!existingDomain) return newDomain
				const existingSectorMap = new Map(existingDomain.sectors.map(sector => [sector._id, sector]));
				const mergedSectors = newDomain.sectors.map(sector => {
					return existingSectorMap.get(sector._id) || sector;
				});

				return {
					...existingDomain,
					sectors: mergedSectors,
					logo: newDomain.logo,
					Settings: newDomain.Settings,
					link: newDomain.link
				};
			});
			setDomains([...updatedDomains, existingUserContacts ? existingUserContacts : userContacts]);
			const foundDomain = res.domain.find(i => i._id === c)
			if (foundDomain) {
				setCurrDomainId(foundDomain._id)
			}
			await AsyncStorage.setItem("cacheDomain", JSON.stringify(updatedDomains))
		}
	} catch (err) {
		console.log((new Date()).toLocaleTimeString())
	}
}

const getIssuesVoted = async () => {
	const { setUser } = useUser.getState()
	try {
		let accessToken = useToken.getState().accessToken
		const httpCall = await fetch(`${url}/user/issues-voted`, {
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
				issues_voted: res.data
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

const addSectorDomain = async (sector) => {
	const setDomains = useDomain.getState().setDomains
	const httpCall = await fetch(`${url}/domain/${sector._id}`, {
		headers: {
			Authorization: "Bearer " + accessToken,
		}
	})
	const res = await httpCall.json()
	if (res.success === true) {
		if (res.data.length >= 1) {
			setDomains(prev => [...res.data, ...prev])
			showSnackBar(`You joined ${sector.title}`)
		} else {
			showSnackBar("can't join this sector")
		}
	}
}

function midnightTimestamp() {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
}
const ts = midnightTimestamp()


export default function App() {
	const messaging = getMessaging(getApp())
	const appState = useRef(AppState.currentState);
	const [initialRoute, setInitialRoute] = useState(false)
	const { accessToken } = useToken()
	const { modal } = useModal()
	const { domains, setDomains } = useDomain()

	useEffect(() => {
		console.log("mounted");
		(async () => {
			await requestPermission(messaging)
			const refreshToken = await Keychain.getGenericPassword({ service: "refreshToken" })
			if (refreshToken) {
				setInitialRoute(true)
			}
			SplashScreen.hide()
		})();

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

		setTimeout(() => {
			requestPermissions()
		}, 500)
		onMessage(messaging, async remoteMessage => {
			if (remoteMessage.data.domain) {
				const newDomain = JSON.parse(remoteMessage.data.domain)  /////check backend
				setDomains(prev => [...prev, newDomain])
			}
		})
	}, [])

	useEffect(() => {
		(async () => {
			const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
			if (granted) {
				getContacts()
			}
		})();
	}, [])

	useEffect(() => {
		const subscription = AppState.addEventListener('change', async nextAppState => {
			if (appState.current.match(/active/) && nextAppState.match(/inactive|background/) && domains.length >= 1) {
				console.log("saving cached domain")
				let domains = useDomain.getState().domains
				await AsyncStorage.setItem("cacheDomain", JSON.stringify(domains))
			}
			appState.current = nextAppState
		})
		return () => subscription.remove()
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
			<SafeAreaProvider>
				<PaperProvider>
					<NavigationContainer linking={linking}>
						<StatusBar animated={true} backgroundColor="#3399" />
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
											colorx = focused ? "#117" : "#ccc"
											switch (route.name) {
												case "home":
													Icon = Mci
													iconx = "chat"
													sizex = 32
													break
												case "live":
													Icon = Mci
													iconx = "text"
													sizex = 26
													break
												case "ho":
													Icon = Ion
													iconx = "person-sharp"
													sizex = 26
													break
												case "profile":
													Icon = Mci
													iconx = "pen"
													sizex = 26
													break
											}
											return (
												<Icon name={iconx} color={colorx} size={sizex} style={{
													width: 80,
													height: 30,
													borderRadius: 30,
													textAlign: "center",
													backgroundColor: focused ? "#44b1" : "#ddd1",
												}} />
											)
										},
										tabBarIconStyle: { marginTop: 6 },
										tabBarStyle: {
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
									<Tab.Screen name="live" component={Live} />
									<Tab.Screen name="home" component={HomeScreen} />
									<Tab.Screen name="ho" component={ProfileScreen} />
									<Tab.Screen name="profile" component={ProfileScreen} />
								</Tab.Navigator>
								:
								<Stack.Navigator
									initialRouteName={initialRoute ? "login" : "signUp"}
									screenOptions={{ headerShown: false, animation: "slide_from_right" }}
								>
									<Stack.Screen name="login" component={Login} />
									<Stack.Screen name="signUp" component={SignUp} />
								</Stack.Navigator>
						}
						<SnackBarView />
					</NavigationContainer>
				</PaperProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	)
}
import React, { useEffect, useMemo, useRef, useState } from "react"
import * as Keychain from "react-native-keychain"
import AsyncStorage from '@react-native-async-storage/async-storage'
import Ion from "react-native-vector-icons/Ionicons"
import Mci from 'react-native-vector-icons/MaterialCommunityIcons'
import PushNotification from 'react-native-push-notification'
import SplashScreen from 'react-native-splash-screen'
import { AppState, I18nManager, Linking, PermissionsAndroid, StatusBar, View } from "react-native"
import { getApp } from '@react-native-firebase/app'
import { getMessaging, onMessage, requestPermission } from '@react-native-firebase/messaging'
import { PaperProvider } from "react-native-paper"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useDomain, useModal, useToken } from "./store/useStore"
import getContacts from "./utils/getContacts"
import linking from "./utils/linking"
import SnackBarView from "./src/components/SnackBarView"

import Login from "./src/screens/auth/Login"
import SignUp from "./src/screens/auth/SignUp"

import ChatScreen from "./src/screens/main/ChatScreen"
import GameScreen from "./src/screens/main/GameScreen"
import ProfileScreen from "./src/screens/main/ProfileScreen"
import Post from "./src/screens/main/PostScreen"
import Aa from "./src/screens/main/Aa"

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

function AppContent() {
	const insets = useSafeAreaInsets()
	const messaging = getMessaging(getApp())
	const appState = useRef(AppState.currentState);
	const [initialRoute, setInitialRoute] = useState(false)
	const { accessToken } = useToken()
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
		<PaperProvider>
			<View
				style={{
					flex: 1,
					backgroundColor: "#3399",
					paddingTop: insets.top,
					paddingBottom: insets.bottom,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<NavigationContainer linking={linking}>
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
											case "chat":
												Icon = Mci
												iconx = "chat"
												sizex = 32
												break
											case "post":
												Icon = Mci
												iconx = "text"
												sizex = 26
												break
											case "game":
												Icon = Mci
												iconx = "gamepad-circle"
												sizex = 26
												break
											case "profile":
												Icon = Ion
												iconx = "person"
												sizex = 26
												break
											default:
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
								<Tab.Screen name="post" component={Post} />
								<Tab.Screen name="a" component={Aa} />
								<Tab.Screen name="chat" component={ChatScreen} />
								<Tab.Screen name="game" component={GameScreen} />
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
			</View>
		</PaperProvider>
	)
}

export default function App() {
	return (
		<GestureHandlerRootView>
			<SafeAreaProvider>
				<AppContent />
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
import React, { useEffect, useRef, useState } from "react";
import SplashScreen from 'react-native-splash-screen'
import * as Keychain from "react-native-keychain";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, View, StyleSheet, StatusBar, Button } from "react-native";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDomain, useToken, useUrl,useUser } from "./store/useStore";
import Mci from 'react-native-vector-icons/MaterialCommunityIcons';
import Ion from "react-native-vector-icons/Ionicons"

import SignUp from "./src/screens/SignUp";
import Login from "./src/screens/Login";
import ProfileScreen from "./src/screens/ProfileScreen";
import Settings from "./src/screens/Settings";
import ResizableComponent from "./src/screens/ResizableComponent";
import SideComponent from "./src/screens/SideComponent";
import AddDomain from "./src/screens/AddDomain";

I18nManager.forceRTL(false);
I18nManager.allowRTL(false);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Main() {
	return(
		<>
			<SideComponent/>
			<ResizableComponent/>
		</>
	)
}

function HomeScreen() {
	return (
		<Stack.Navigator screenOptions={{headerShown: false}}>
			<Stack.Screen name="main" component={Main}/>
			<Stack.Screen name="addDomain" component={AddDomain}/>
		</Stack.Navigator>
	)
}


export default function App() {
	const { url } = useUrl()
	const { setUser } = useUser()
	const { accessToken, refreshToken, setAccessToken } = useToken()
	const { setDomains } = useDomain()

	const refreshAccessToken = async () => {
		const refreshToken = await Keychain.getGenericPassword({service: "refreshToken"});
		const token = await fetch(`${url}/api/user/refresh-access-token`, {
			method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refreshToken: refreshToken.password,
            })
		})
		const res = await token.json()
		if(res.accessToken){
			await setAccessToken(res.accessToken)
			await Keychain.setGenericPassword("accessToken", res.accessToken, {service: "accessToken"})
		} else {
			console.log(res)
		}
	}

	useEffect(() => {
		const getToken = async () => {
			const accessToken = await Keychain.getGenericPassword({service: "accessToken"});
			if (accessToken) {
				await setAccessToken(accessToken.password)
			}
			SplashScreen.hide()
		};

		const getUser = async () => {
			try {
				const jsonValue = await AsyncStorage.getItem("user");
		 		setUser(jsonValue != null ? JSON.parse(jsonValue) : null);
			} catch (e) {
				// error reading value
			}
		};

		const getDomain = async () => {
			const accessToken = await Keychain.getGenericPassword({service: "accessToken"});
			const domain = await fetch(`${url}/api/user/domain`, {
				headers: {
					Authorization: "Bearer " + accessToken.password,
				}
			})
			const res = await domain.json()
			if (res.exp) {
				refreshAccessToken()
			} else {
				setDomains(res)
			}
		};

		getToken();
		getUser();
		getDomain();
	}, [])
	
	return (
		<GestureHandlerRootView style={{flex: 1}}>
		<PaperProvider>
		<NavigationContainer>
        <StatusBar animated={true} backgroundColor="#336" />
			{
				accessToken ? 
				<Tab.Navigator
					screenOptions={({ route }) => ({
						animation: "shift",
						headerShown: false,
						tabBarHideOnKeyboard: true,
						tabBarShowLabel: false,
						tabBarIcon: ({focused}) => {
							let Icon;
							let colorx;
							let iconx;
							let sizex;
							colorx = focused ? "#117" : "#fffc"
							switch (route.name) {
								case "Home":
									Icon = Mci
									iconx = "home"
									sizex = 34
									break;
								case "Profile":
									Icon = Ion
									iconx = "person-sharp"
									sizex = 28
									break;
							}
							return (
								<Icon name={iconx} color={colorx} size={sizex} style={{
									width: 100,
									height: 34,
									borderRadius: 50,
									textAlign: "center",
									backgroundColor: focused ? "#44b6" : "#ddd",
									// transform: focused ? [{ scale: 1.2 }] : [{ scale: 1 }],
								}}/>
							)
						},
						tabBarIconStyle:{marginTop: 6},
						tabBarStyle : {
							// position: 'absolute',
							elevation: 0,
							borderTopWidth: 0,	
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
					initialRouteName={accessToken ? "Login" : "SignUp"}
					screenOptions={{headerShown: false, animation: "fade"}}
				>
					<Stack.Screen name="Login" component={Login} />
					<Stack.Screen name="SignUp" component={SignUp} />
			  	</Stack.Navigator>
			}
		</NavigationContainer>
		</PaperProvider>
		</GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({

});
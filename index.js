/**
 * @format
 */

import 'react-native-gesture-handler';
import PushNotification from "react-native-push-notification";
import App from './App';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onNotificationOpenedApp, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { useDomain } from "./store/useStore";

const messaging = getMessaging(getApp());

onNotificationOpenedApp(messaging, async remoteMessage => {
	console.log("notification clicked")
});

setBackgroundMessageHandler(messaging, async remoteMessage => {
	const { setDomains } = useDomain.getState()
	if(remoteMessage.data.domain) {
		const newDomain = JSON.parse(remoteMessage.data.domain)
		setDomains(prev => [...prev, newDomain])
	}
	if(remoteMessage.notification) {
		PushNotification.localNotification({
		  channelId: "tells",
		  title: remoteMessage.notification.title,
		  message: remoteMessage.notification.body,
		});
	}
});

// PushNotification.configure({
//   onNotification: function (notification) {
//     notification.finish(PushNotificationIOS.FetchResult.NoData);
//   },

//   onRegistrationError: function (err) {
//     console.error(err.message, err);
//   },
//   popInitialNotification: true,
//   requestPermissions: true,
// });

AppRegistry.registerComponent(appName, () => App);

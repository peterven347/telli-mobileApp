import React, {useEffect} from "react";
import { View } from "react-native";
import {WebView} from "react-native-webview"
import SplashScreen from 'react-native-splash-screen'

export default function App() {
    useEffect(() => {
        SplashScreen.hide()
    }, [])
    return(
        <View style={{flex: 1, backgroundColor: "#fff"}}>
            <WebView
            source={{uri: "https://app.swiftdatalink.com"}}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            />
        </View>
    )
}
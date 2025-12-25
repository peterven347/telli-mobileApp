import React, { useState } from "react";
import { Button, View, Platform, TextInput, Text, Alert } from "react-native";
import { WebView } from "react-native-webview";
import Video from "react-native-video";
const tt = require("./WebTvScreen.html")

export default function Aa() {
  const [ttt, setText] = useState("http://10.66.252.133:3030/live/test/index.m3u8")
  const [tt, setTex] = useState("http://10.235.79.133:3000/test")
  const [data, setData] = useState({a: 666666})

  const fn = async () => {
    try {
      const test = await fetch(`${tt}`, {})
      const testRes = await test.json()
      setData(testRes)
    } catch (err) {
      Alert.alert(err)
    }
  }
  return (
    <View style={{ flex: 1 }}>
      {/* <WebView
        originWhitelist={["*"]}
        source={tt}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        startInLoadingState={true}
        onMessage={(event) =>
          console.log("Message from WebView:", event.nativeEvent.data)
        }
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error:", nativeEvent);
        }}
        androidHardwareAccelerationDisabled={false}
        onPermissionRequest={(event) => {
          alert("GOT PERMISSION REQUEST");
          console.log(event.resources);
          event.grant(event.resources);
        }}

      /> */}
      <TextInput value={ttt} onChangeText={(e) => setText(e)} />
      <TextInput value={tt} onChangeText={(e) => setTex(e)} />
      <Text onPress={fn}>{tt}</Text>
      <Text>{JSON.stringify(data, null, 2)}</Text>
      <View style={{ flex: 1 }}>
        <Video
          source={{ uri: ttt }}
          controls
          resizeMode="contain"
          style={{ flex: 0.5 }}
        />
      </View>
    </View>
  );
}

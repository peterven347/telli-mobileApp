import React, { } from "react"
import { } from "react-native"
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import FrontPage from "./live/FrontPage"
import Profile from "./live/Profile"
import TextBoard from "./live/TextBoard"
const Stack = createNativeStackNavigator()

export default function LiveScreen() {
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="frontPage" component={FrontPage} options={{ animation: "slide_from_left" }} />
                <Stack.Screen name="profile" component={Profile} options={{ animation: "fade"}} />
                <Stack.Screen name="textBoard" component={TextBoard} options={{ animation: "slide_from_bottom" }} />
            </Stack.Navigator>
        </>
    )
}
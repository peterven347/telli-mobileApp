import React, { } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import FrontPage from "./post/FrontPage"
import Profile from "./post/Profile"
import TextBoard from "./post/TextBoard"
import Channels from "./post/Channels"
import TvScreen from "./post/TvScreen"
const Stack = createNativeStackNavigator()
const queryClient = new QueryClient()

export default function PostScreen() {
    return (
        <QueryClientProvider client={queryClient}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="channels" component={Channels} options={{}} />
                <Stack.Screen name="tvScreen" component={TvScreen} options={{ animation: "fade" }} />
                <Stack.Screen name="frontPage" component={FrontPage} options={{ animation: "slide_from_left" }} />
                <Stack.Screen name="profile" component={Profile} options={{ animation: "fade" }} />
                <Stack.Screen name="textBoard" component={TextBoard} options={{ animation: "slide_from_bottom" }} />
            </Stack.Navigator>
        </QueryClientProvider>
    )
}
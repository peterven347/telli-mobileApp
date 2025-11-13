import React, { } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import FrontPage from "./post/FrontPage"
import Profile from "./post/Profile"
import TextBoard from "./post/TextBoard"
import Shorts from "./post/Shorts"
const Stack = createNativeStackNavigator()
const queryClient = new QueryClient()

export default function PostScreen() {
    return (
        <QueryClientProvider client={queryClient}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="frontPage" component={FrontPage} options={{ animation: "slide_from_left" }} />
                <Stack.Screen name="profile" component={Profile} options={{ animation: "fade" }} />
                <Stack.Screen name="textBoard" component={TextBoard} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="shorts" component={Shorts} options={{}} />
            </Stack.Navigator>
        </QueryClientProvider>
    )
}
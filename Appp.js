// import React, { useEffect } from 'react';
// import { SafeAreaView } from 'react-native';
// import SplashScreen from 'react-native-splash-screen'

// import ImageGallery from './ImageGallery';

// const App = () => {

//     useEffect(() => {
//         SplashScreen.hide()
//     }, [])
//     const images = [
//         "https://picsum.dev/300/200",
//         "https://picsum.dev/300/250",
//         "https://picsum.dev/330/200",
//         "https://picsum.dev/300/210"
//     ];

//     return (
//         <SafeAreaView style={{ flex: 1 }}>
//             <ImageGallery images={images} />
//         </SafeAreaView>
//     );
// };

// export default App;


import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Main from './Main';
import SectorView from './SectorView';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="main" component={Main} />
        <Stack.Screen
          name="sectorView"
          component={SectorView}
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

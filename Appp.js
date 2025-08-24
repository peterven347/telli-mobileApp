import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import SplashScreen from 'react-native-splash-screen'

import ImageGallery from './ImageGallery';

const App = () => {

    useEffect(() => {
        SplashScreen.hide()
    }, [])
    const images = [
        "https://picsum.dev/300/200",
        "https://picsum.dev/300/250",
        "https://picsum.dev/330/200",
        "https://picsum.dev/300/210"
    ];

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageGallery images={images} />
        </SafeAreaView>
    );
};

export default App;

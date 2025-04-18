import SplashScreen from 'react-native-splash-screen'
import React, { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';

const CustomPullToRefresh = () => {
        SplashScreen.hide()

  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const scrollViewRef = useRef(null);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const handleScrollEndDrag = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY < -60 && !refreshing) {
      triggerRefresh();
    }
  };

  const triggerRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000); // Fake 2s refresh
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.loaderContainer, {
        opacity: scrollY.interpolate({
          inputRange: [-80, 0],
          outputRange: [1, 0],
          extrapolate: 'clamp',
        }),
      }]}>
        {refreshing && <ActivityIndicator size="small" color="#fff" />}
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.text}>Pull down to refresh 👇</Text>
        <Text style={styles.text}>More content here...</Text>
        <Text style={styles.text}>Even more content...</Text>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#66b',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 100,
    paddingBottom: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  text: {
    fontSize: 18,
    color: 'white',
    marginVertical: 20,
  },
});

export default CustomPullToRefresh;

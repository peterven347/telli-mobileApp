import { useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

export default function useKeyboardHeight() {
  const keyboardHeight = useSharedValue(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (e) => {
      const height = e?.endCoordinates?.height ?? 0;
      const duration = e?.duration ?? 250;

      keyboardHeight.value = withTiming(height, { duration });
    };

    const onKeyboardHide = (e) => {
      const duration = e?.duration ?? 250;

      keyboardHeight.value = withTiming(0, { duration });
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return keyboardHeight;
}

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const ImageGallery = ({ images }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [layoutReady, setLayoutReady] = useState(false);
  const flatListRef = useRef(null);

  // Trigger scroll once modal and layout are ready
  useEffect(() => {
    if (modalVisible && layoutReady) {
      flatListRef.current?.scrollToIndex({ index: selectedIndex, animated: false });
    }
  }, [modalVisible, layoutReady, selectedIndex]);

  const openImage = (index) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setLayoutReady(false); // reset
  };

  const renderImage = ({ item, index }) => (
    <TouchableOpacity onPress={() => openImage(index)}>
      <Image source={{ uri: item }} style={styles.thumbnail} />
    </TouchableOpacity>
  );

  const renderFullImage = ({ item }) => (
    <View style={styles.fullImageWrapper}>
      <TouchableOpacity style={styles.fullImageTouchable} onPress={closeModal} activeOpacity={1}>
        <Image source={{ uri: item }} style={styles.fullImage} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
      />

      <Modal visible={modalVisible} transparent={false}>
        <StatusBar hidden />
        <FlatList
          data={images}
          ref={flatListRef}
          renderItem={renderFullImage}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          onLayout={() => setLayoutReady(true)} // triggers after layout is done
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
    backgroundColor: '#fff',
  },
  thumbnail: {
    width: width / 3 - 6,
    height: width / 3 - 6,
    margin: 2,
    borderRadius: 8,
  },
  fullImageWrapper: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  fullImageTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});

export default ImageGallery;

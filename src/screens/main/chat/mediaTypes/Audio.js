import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Sound, { createSound } from 'react-native-nitro-sound';
import Slider from '@react-native-community/slider';
import Mci from "react-native-vector-icons/MaterialCommunityIcons"

export default function Audio({ isMine, item, currAudioId, setCurrAudioId, currAudio, setCurrAudio, handlePress, handleLongPress }) {
    const soundRef = useRef(null);
    const [sliderValue, setSliderValue] = useState(0);
    const [sliderMaxValue, setSliderMaxValue] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false)

    //     setAllSliders(prev => ({
    //     ...prev,
    //     [id]: {
    //         ...prev[id],
    //         sliderMaxValue: e.duration
    //     },
    // }));
    useEffect(() => {
        soundRef.current = createSound();
        soundRef.current.addPlayBackListener((e) => {
            setSliderMaxValue(e.duration);
            if (!isSeeking) {
                setSliderValue(e.currentPosition);
            }
        });

        soundRef.current.addPlaybackEndListener(() => {
            setSliderValue(0);
            setCurrAudioId("");
        });

        return () => {
            soundRef.current.removePlayBackListener();
            soundRef.current.removePlaybackEndListener();
        };
    }, []);

    const onStartPlay = async () => {
        try {
            currAudio?.pausePlayer()
            setCurrAudioId(item._id || item.id);
            setCurrAudio(soundRef.current)
            if (sliderValue) {
                await soundRef.current.resumePlayer()
            } else {
                await soundRef.current.startPlayer(item.uri);
            }
        } catch (err) {
        }
    };

    const onPausePlay = async () => {
        try {
            setCurrAudioId("")
            await currAudio?.pausePlayer();
        } catch (error) {
            console.error('Failed to stop playback:', error);
        } finally {
        }
    };

    const onPauseSelected = async (id) => {
        try {
            if (id === currAudioId) {
                setCurrAudioId("")
                await currAudio?.pausePlayer();
            }
        } catch (error) {
            console.error('Failed to stop playback:', error);
        } finally {
        }
    };

    const onValueChange = (val) => {
        if (isSeeking) setSliderValue(val);
    };

    const onSlidingStart = () => {
        setIsSeeking(true);
    };

    const onSlidingComplete = async (val) => {
        try {
            await soundRef.current.seekToPlayer(val);
            setSliderValue(val);
        } catch (err) {
            console.error(err);
        } finally {
            setTimeout(() => setIsSeeking(false), 200);
        }
    };

    const formatTime = (millis) => {
        if (!millis) return null;
        const totalSeconds = Math.floor(millis / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return hours > 0
            ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <Pressable style={
            [styles.bubble,
            { backgroundColor: isMine ? '#DCF8C6' : '#E5E5EA', borderTopLeftRadius: isMine ? 8 : 0, borderTopRightRadius: isMine ? 0 : 8 }]}
            onPress={() => { !handlePress(item._id) && onPauseSelected(item._id) }}
            onLongPress={(e) => { handleLongPress(e, item); onPauseSelected(item._id) }}
        >
            {/* <Mci name="book" size={34} color="#66b" onPress={() => { currAudio?.resumePlayer()}} /> */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.ppIconView}>
                    {
                        (item._id || item.id) === currAudioId ?
                            <Mci name="pause" size={32} color="#66b" onPress={onPausePlay} />
                            : <Mci name="play" size={40} color="#66b" onPress={onStartPlay} />
                    }
                </View>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={sliderMaxValue}
                    value={sliderValue}
                    onValueChange={onValueChange}
                    onSlidingStart={onSlidingStart}
                    onSlidingComplete={onSlidingComplete}
                    minimumTrackTintColor="#66b"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#66b"
                />
            </View>
            {/* <Text>{currAudioId}</Text> */}
            <View style={styles.footer}>
                <View style={{ width: "50%", flexDirection: 'row', alignItems: "center" }}>
                    <Text style={{ width: 37, textAlign: "", fontWeight: 500, fontSize: 9 }}>{formatTime(sliderValue)}</Text>
                    <Text style={{ fontWeight: 500, fontSize: 9, position: "relative", right: 4 }}>{sliderValue > 0 ? "/ " : ""}</Text>
                    <Text style={{ fontWeight: 500, fontSize: 9 }}>{formatTime(sliderMaxValue)}</Text>
                </View>
                <Text style={{ fontSize: 10 }}>14:08</Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    bubble: {
        // flex: 1,
        borderRadius: 8,
        borderBottomEndRadius: 0,
        paddingTop: 10
    },
    footer: {
        backgroundColor: "",
        flexDirection: "row",
        justifyContent: "space-between",
        marginStart: 12,
        marginEnd: 11,
        position: "relative",
        bottom: 2
    },
    ppIconView: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: "center"
    },
    slider: {
        width: 242,
        height: 28,
        borderRadius: 14,
        marginEnd: 8,
        backgroundColor: '#fff4',
    },
});

// export default function Audio({ isMine, item, currAudioId, setCurrAudioId, currAudio, setCurrAudio, handlePress, handleLongPress, allSliders, setAllSliders }) {
//     const soundRef = useRef(null);
//     const [isSeeking, setIsSeeking] = useState(false);
//     const id = item._id || item.id
//     const sliderValue = allSliders[id]?.sliderValue || 0;
//     const sliderMaxValue = allSliders[id]?.sliderMaxValue || 0;

//     useEffect(() => {
//         soundRef.current = createSound();
//         soundRef.current.addPlayBackListener((e) => {
//             setAllSliders(prev => ({
//                 ...prev,
//                 [id]: {
//                     ...prev[id],
//                     sliderMaxValue: e.duration
//                 },
//             }));
//             if (!isSeeking) {
//                 setAllSliders(prev => ({
//                     ...prev,
//                     [id]: {
//                         ...prev[id],
//                         sliderValue: e.currentPosition
//                     },
//                 }));
//             }
//         });

//         soundRef.current.addPlaybackEndListener(() => {
//             setAllSliders(prev => ({
//                 ...prev,
//                 [id]: {
//                     ...prev[id],
//                     sliderValue: 0
//                 },
//             }));
//             setCurrAudioId("");
//         });

//         return () => {
//             soundRef.current.removePlayBackListener();
//             soundRef.current.removePlaybackEndListener();
//         };
//     }, []);

//     const onStartPlay = async () => {
//         try {
//             console.log(allSliders)
//             currAudio?.pausePlayer()
//             setCurrAudioId(item._id || item.id);
//             setCurrAudio(soundRef.current)
//             if (sliderValue) {
//                 await currAudio.resumePlayer()
//             } else {
//                 await currAudio.startPlayer(item.uri);
//             }
//         } catch (err) {
//         }
//     };

//     const onPausePlay = async () => {
//         try {
//             setCurrAudioId("")
//             await currAudio?.pausePlayer();
//         } catch (error) {
//             console.error('Failed to stop playback:', error);
//         } finally {
//         }
//     };

//     const onPauseSelected = async (id) => {
//         try {
//             if (id === currAudioId) {
//                 setCurrAudioId("")
//                 await soundRef.current?.pausePlayer();
//             }
//         } catch (error) {
//             console.error('Failed to stop playback:', error);
//         } finally {
//         }
//     };

//     const onValueChange = (val) => {
//         if (isSeeking) {
//                 setAllSliders(prev => ({
//                     ...prev,
//                     [id]: {
//                         ...prev[id],
//                         sliderValue: val
//                     },
//                 }));
//         };
//     };

//     const onSlidingStart = () => {
//         setIsSeeking(true);
//     };

//     const onSlidingComplete = async (val) => {
//         try {
//             await soundRef.current.seekToPlayer(val);
//                 setAllSliders(prev => ({
//                     ...prev,
//                     [id]: {
//                         ...prev[id],
//                         sliderValue: val
//                     },
//                 }));
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setTimeout(() => setIsSeeking(false), 200);
//         }
//     };

//     const formatTime = (millis) => {
//         if (!millis) return null;
//         const totalSeconds = Math.floor(millis / 1000);
//         const hours = Math.floor(totalSeconds / 3600);
//         const minutes = Math.floor((totalSeconds % 3600) / 60);
//         const seconds = totalSeconds % 60;
//         return hours > 0
//             ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
//             : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//     };

//     return (
//         <Pressable style={
//             [styles.bubble,
//             { backgroundColor: isMine ? '#DCF8C6' : '#E5E5EA', borderTopLeftRadius: isMine ? 8 : 0, borderTopRightRadius: isMine ? 0 : 8 }]}
//             onPress={() => { !handlePress(item._id) && onPauseSelected(item._id) }}
//             onLongPress={(e) => { handleLongPress(e, item); onPauseSelected(item._id) }}
//         >
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <View style={styles.ppIconView}>
//                     {
//                         (item._id || item.id) === currAudioId ?
//                             <Mci name="pause" size={32} color="#66b" onPress={onPausePlay} />
//                             : <Mci name="play" size={40} color="#66b" onPress={onStartPlay} />
//                     }
//                 </View>
//                 {/* <Text>{currAudioId}</Text> */}
//                 <Slider
//                     style={styles.slider}
//                     minimumValue={0}
//                     maximumValue={sliderMaxValue}
//                     value={sliderValue}
//                     onValueChange={onValueChange}
//                     onSlidingStart={onSlidingStart}
//                     onSlidingComplete={onSlidingComplete}
//                     minimumTrackTintColor="#66b"
//                     maximumTrackTintColor="#ccc"
//                     thumbTintColor="#66b"
//                 />
//             </View>
//             <View style={styles.footer}>
//                 <View style={{ width: "50%", flexDirection: 'row', alignItems: "center" }}>
//                     <Text style={{ width: 37, textAlign: "", fontWeight: 500, fontSize: 9 }}>{formatTime(sliderValue)}</Text>
//                     <Text style={{ fontWeight: 500, fontSize: 9, position: "relative", right: 4 }}>{sliderValue > 0 ? "/ " : ""}</Text>
//                     <Text style={{ fontWeight: 500, fontSize: 9 }}>{formatTime(sliderMaxValue)}</Text>
//                 </View>
//                 <Text style={{ fontSize: 10 }}>14:08</Text>
//             </View>
//         </Pressable>
//     );
// };
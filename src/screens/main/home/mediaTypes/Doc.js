import { Pressable, StyleSheet, Text, View } from "react-native"
import Mci from "react-native-vector-icons/MaterialCommunityIcons"
import { viewDocument } from "@react-native-documents/viewer"
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs"
import showSnackBar from "../../../../../utils/snackBar"

const formatFileSize = (bytes) => {
    if (!bytes) return null
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formatted = (bytes / Math.pow(k, i)).toFixed(2);
    return `${formatted} ${sizes[i]}`;
};

const openFileWithPath = async (fileUri) => {
    try {
        const path = Platform.OS === 'android' ? decodeURIComponent(fileUri.replace('file://', '')) : fileUri;
        const exists = await RNFS.exists(path);
        if (!exists) {
            showSnackBar('File does not exist');
            return;
        }
        await FileViewer.open(decodeURIComponent(fileUri), {
            showOpenWithDialog: true,
            displayName: path.split('/').pop(),
        });
    } catch (err) {
        showSnackBar("can't open this file")
    }
};

const openFile = (fileUri, sUri) => {
    viewDocument({ uri: sUri }).catch((err) => {
        openFileWithPath(fileUri)
    })
};

export default function Doc({ isMine, item, icon, bgColor, handlePress, handleLongPress }) {
    return (
        <Pressable style={{
            width: "60%", backgroundColor: isMine ? '#DCF8C6' : '#E5E5EA', padding: 6, paddingTop: 10, paddingEnd: 8,
            borderBottomEndRadius: isMine ? 0 : 8, borderTopLeftRadius: isMine ? 8 : 0,
            borderTopRightRadius: isMine ? 0 : 8, borderBottomStartRadius: isMine ? 8 : 0,
        }}
            onPress={() => handlePress(item) && openFile(item.uri, item.sourceUri)}
            onLongPress={(e) => { handleLongPress(e, item) }}
        >
            <View style={{ flexDirection: "row", columnGap: 4 }}>
                <View style={{ width: "20%", backgroundColor: bgColor, justifyContent: "center", alignItems: "center" }}>
                    <Mci name={icon} color="#fff" size={34} />
                </View>
                <View style={{ width: "80%", backgroundColor: bgColor + "11", padding: 4, borderRadius: 4 }}>
                    <Text numberOfLines={2} style={{ fontSize: 11, fontWeight: "500" }}>{item.name}</Text>
                </View>
            </View>
            <View style={{ position: "relative", top: 4, justifyContent: "space-between", flexDirection: "row", marginTop: 4 }}>
                <Text style={[{ fontWeight: 500, fontSize: 9 }]}>{formatFileSize(item.size)}</Text>
                <Text style={[styles.timestamp, { color: item.read ? "rgba(31, 138, 239, 1)" : item._id ? "#111" : "#999" }]}>
                    {new Date(item.createdAt || item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </Pressable>
    )
};

const styles = StyleSheet.create({
    timestamp: {
        fontSize: 10,
        textAlign: 'right',
    },
})
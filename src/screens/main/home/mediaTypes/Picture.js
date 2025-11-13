import { Image, Pressable, Text } from "react-native"

export default function Picture({ item, handlePress, handleLongPress }) {
    return (
        <Pressable
            onPress={() => handlePress(item._id)}
            onLongPress={() => handleLongPress(item)}
        >
            <Image source={{ uri: item.uri }} style={{ width: 150, height: 200, borderRadius: 4, backgroundColor: '#ccc' }} />
            <Text
                style={
                    {
                        position: 'absolute',
                        bottom: 2,
                        right: 6,
                        fontSize: 10,
                        backgroundColor: "#fff3",
                        paddingHorizontal: 3,
                        borderRadius: 3,
                        color: item.read ? 'rgba(31, 138, 239, 1)' : item._id ? '#111' : '#999',
                    }
                }
            >
                {new Date(item.createdAt || item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </Pressable>
    )
};
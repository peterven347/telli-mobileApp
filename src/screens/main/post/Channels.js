import React, { useEffect } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, TextInput, Pressable } from 'react-native';
import Ion from 'react-native-vector-icons/Ionicons';
import { Avatar } from 'react-native-paper';

const ChannelCard = ({ channel, navigation }) => {
    return (
        <Pressable style={styles.ChannelCard} onPress={() => { navigation.navigate("tvScreen", channel) }}>
            <Image source={{ uri: "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/BB1msFQx?w=0&h=0&q=60&m=6&f=jpg&u=t" }} style={{ width: 60, height: 60, borderRadius: 8 }} />
            <View style={{ flex: 1, height: 60, marginLeft: 10,  backgroundColor: "", justifyContent: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>{channel.name}</Text>
                <View style={{ flexDirection: 'row', backgroundColor: "" }}>
                    {channel.isLive && <Avatar.Text label="" size={4} backgroundColor={"#0f0"} style={{ marginTop: 5, marginEnd: 4 }} />}
                    <Text style={{ fontSize: 12, color: '#666' }}>{channel.description}</Text>
                </View>
            </View>
        </Pressable>
    );
}

const data = [
    {
        _id: "101",
        name: "Discovery Channel",
        thumbnail: "https://cdn.example.com/thumbnails/discovery.jpg",
        description: "Explore the wonders of science, nature, and technology with Discovery Channel.",
        streamUrl: "https://stream.example.com/discovery.m3u8",
        isLive: true
    },
    {
        _id: "102",
        name: "HBO",
        thumbnail: "https://cdn.example.com/thumbnails/hbo.jpg",
        description: "HBO brings you award-winning series, movies, and exclusive content.",
        streamUrl: "https://stream.example.com/hbo.m3u8",
    },
    {
        _id: "103",
        name: "CNN",
        thumbnail: "https://cdn.example.com/thumbnails/cnn.jpg",
        description: "Stay updated with the latest world and local news from CNN.",
        streamUrl: "https://stream.example.com/cnn.m3u8",
    }
]


export default function Channels({ navigation }) {
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.searchAndBack}>
                <Ion name="search" size={20} color="#666" />
                <View style={styles.search}>
                    <Ion name="search" size={20} color="#666" />
                    <TextInput
                        placeholder="search"
                        style={{ marginLeft: 8, backgroundColor: "red", flex: 1 }}
                        placeholderTextColor="#999"
                    />
                </View >
            </View>
            <FlatList
                data={data}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => <ChannelCard channel={item} navigation={navigation} />}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    ChannelCard: {
        flexDirection: 'row',
        margin: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        alignItems: "center"
    },
    search: {
        flexDirection: 'row',
        flex: 1,
        padding: 8,
        backgroundColor: '#f000f0',
        borderRadius: 10,
        alignItems: 'center'
    },
    searchAndBack: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        margin: 10,
        // paddingStart: 22,
        paddingEnd: 8,
        columnGap: 28,
        backgroundColor: "grey"
    },
})
import React, { useEffect } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Ion from 'react-native-vector-icons/Ionicons';

const ChannelCard = ({ channel }) => {
    return (
        <View style={styles.ChannelCard}>
            <Image source={{ uri: "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/BB1msFQx?w=0&h=0&q=60&m=6&f=jpg&u=t" }} style={{ width: 80, height: 80, borderRadius: 8 }} />
            <View style={{ flex: 1, marginLeft: 10, justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{channel.name}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>{channel.genre}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: channel.isLive ? 'green' : 'red' }}>
                        {channel.isLive ? 'LIVE' : 'OFFLINE'}
                    </Text>
                    <TouchableOpacity>
                        <Ion
                            name={channel.isFavorite ? 'heart' : 'heart-outline'}
                            size={20}
                            color={channel.isFavorite ? 'red' : '#666'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const data = [
    {
        id: "101",
        name: "Discovery Channel",
        thumbnail: "https://cdn.example.com/thumbnails/discovery.jpg",
        genre: "Documentary",
        isLive: true,
        isFavorite: false,
        language: "English",
        country: "US",
        description: "Explore the wonders of science, nature, and technology with Discovery Channel.",
        streamUrl: "https://stream.example.com/discovery.m3u8",
        schedule: [
            { time: "2025-11-09T10:00:00Z", show: "MythBusters" },
            { time: "2025-11-09T11:00:00Z", show: "Planet Earth" }
        ]
    },
    {
        id: "102",
        name: "HBO",
        thumbnail: "https://cdn.example.com/thumbnails/hbo.jpg",
        genre: "Entertainment",
        isLive: true,
        isFavorite: true,
        language: "English",
        country: "US",
        description: "HBO brings you award-winning series, movies, and exclusive content.",
        streamUrl: "https://stream.example.com/hbo.m3u8",
        schedule: [
            { time: "2025-11-09T09:30:00Z", show: "Game of Thrones" },
            { time: "2025-11-09T10:30:00Z", show: "Succession" }
        ]
    },
    {
        id: "103",
        name: "CNN",
        thumbnail: "https://cdn.example.com/thumbnails/cnn.jpg",
        genre: "News",
        isLive: false,
        isFavorite: false,
        language: "English",
        country: "US",
        description: "Stay updated with the latest world and local news from CNN.",
        streamUrl: "https://stream.example.com/cnn.m3u8",
        schedule: [
            { time: "2025-11-09T09:00:00Z", show: "Morning News" },
            { time: "2025-11-09T10:00:00Z", show: "World Report" }
        ]
    }
]


export default function Shorts() {
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
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <ChannelCard channel={item} />}
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
        elevation: 2
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
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import Video from "react-native-video";

function RenderItem() {
	return (
		<Text>tst</Text>
	)
}

export default function TvScreen({ route }) {
	const comments = [{}, {}]
	useEffect(() => {
		console.log(route.params)
	}, [])

	return (
		<View style={{ flex: 1 }}>
			<Video
				source={{ uri: route.streamUrl }}
				controls
				resizeMode="contain"
				style={{ flex: 1 }}
			/>
			<Text>{route.params.streamUrl}</Text>
			<FlatList
				data={comments}
				renderItem={() => <RenderItem />}
			/>
		</View>
	);
}

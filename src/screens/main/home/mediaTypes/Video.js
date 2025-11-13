import { Pressable, View } from "react-native";
import VideoPlayer from 'react-native-video';

export default function Video({ item, handlePress, handleLongPress }) {
	return (
		<Pressable style={{ width: 250, height: 200, borderRadius: 4, overflow: 'hidden' }}
			onPress={() => handlePress(item._id)}
			onLongPress={(e) => { handleLongPress(e, item) }}
		>
			<VideoPlayer
				source={{ uri: item.uri }}
				style={{ width: 250, height: 200 }}
				controls={true}
				resizeMode="cover"
				paused={true}
				focusable={false}
			/>
		</Pressable>

	);
}
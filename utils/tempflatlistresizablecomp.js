<FlatList
data={dd?.concat([{},{},{}])}
showsHorizontalScrollIndicator={false}
showsVerticalScrollIndicator={false}
onRefresh={() => {getDomain()}}
refreshing={refreshing}
numColumns={1}
contentContainerStyle={styles.domainView}
keyExtractor={item => item._id || Math.random()}
renderItem={({ item, index }) => (
		<Animated.View style={[{ alignItems: "center", maxWidth: 46 }, avatarStyle]}>
		{item._id ? 
			<Tooltip
				title={`${item.sectors.length} sectors ${item.sectors.reduce(
					(acc, i) => acc + i.domains?.length,
					0
				)} issues`}
				color="red"
				theme={{ colors: { primary: "green" } }}
			>
				<Avatar.Image
					source={{ uri: `${url}/domain_img/${item.logo}` }}
					size={46}
					// label={index}
					onPress={() => {
					setCurrDomain(item);
					componentWidth.value !== initialWidth && (componentWidth.value = initialWidth);
					}}
				/>
			</Tooltip>
		:   <View style={{ width: 46 }} />
		}
			<Text
				numberOfLines={numberOfLines}
				ellipsizeMode="tail"
				style={{ fontSize: 10, textAlign: "center", color: "#fff" }}
			>
				{item.domain?.replaceAll(" ", "\n")}
			</Text>
			<Avatar.Text
				label=""
				size={4}
				backgroundColor={item._id && item._id === currDomain._id && "#fff"}
				style={styles.currDomainIndicator}
			/>
		</Animated.View>

)}
/>

const currDomain = {
	pinned : true,
	_id: "67c0b52009cad31ea7ybb58b8f",
	domain: "Nigeria",
	creator: "Peterven",
	delegates: [
	  {
		name: "userid1",
		role: "member"
	  }
	],
	logo: "https://picsum.photos/200/300",
	public: true,
	sectors: [
	  {
		title: "title",
		data: [
		  {
			date_created: "2025-02-27T18:54:16.930Z",
			note: "note",
			pictures: [
			],
			resolved_votes: [],
			resolved: false,
			date_resolved: "2025-02-27T18:55:28.258Z",
			_id: "67c0b5209cad31ea7db58b90"
		  }
		]
	  },
	  {
		title: "title",
		data: [
		  {
			date_created: "2025-02-27T18:54:16.930Z",
			note: "note",
			pictures: [],
			resolved_votes: [],
			resolved: false,
			_id: "67c0b5209cad31ea7db58b91"
		  }
		]
	  }
	],
	createdAt: "2025-02-27T18:55:28.289Z",
	updatedAt: "2025-02-27T18:55:28.289Z",
	__v: 0,
	pinned: true
  }
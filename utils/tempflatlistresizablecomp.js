<FlatList
	data={dd?.concat([{}, {}, {}])}
	showsHorizontalScrollIndicator={false}
	showsVerticalScrollIndicator={false}
	onRefresh={() => { getDomain() }}
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
				: <View style={{ width: 46 }} />
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
import unknownArtistImage from '@/assets/unknown_artist.png'
import { ArtistTracksList } from '@/components/ArtistTracksList'
import { colors, screenPadding } from '@/constants/tokens'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useArtists } from '@/store/library'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'

export const unknownArtistImageUri = Image.resolveAssetSource(unknownArtistImage).uri // Bilinmeyen sanatçı resmi

const ArtistDetailScreen = () => {
	const { name: artistName } = useLocalSearchParams<{ name: string }>()

	const artists = useArtists()
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Search songs',
		},
	})

	const artist = artists.find((artist) => artist.name === artistName)

	if (!artist) {
		console.warn(`Artist ${artistName} not found!`)
		return <Redirect href={'/(tabs)/artists'} />
	}

	// Şarkıları filtreleme
	const filteredTracks = artist.tracks
		.filter((track) => track.title && track.title.toLowerCase().includes(search.toLowerCase()))
		.map((track, index) => ({
			...track,
			id: track.id || `unknown-${index}`, // Eksik ID'ler için benzersiz bir key oluştur
			title: track.title || 'Unknown', // Bilinmeyen şarkılar için varsayılan isim
		}))

	return (
		<FlatList
			data={filteredTracks}
			contentContainerStyle={{
				paddingHorizontal: screenPadding.horizontal,
				paddingBottom: 120,
			}}
			ListHeaderComponent={
				<View style={styles.headerContainer}>
					<FastImage
						source={{
							uri: unknownArtistImageUri || artist.image,
							priority: FastImage.priority.high,
						}}
						style={styles.artistImage}
					/>
					<Text style={styles.artistName}>{artist.name || 'Unknown Artist'}</Text>
				</View>
			}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => <ArtistTracksList artist={{ ...artist, tracks: [item] }} />}
			ListEmptyComponent={
				<Text style={styles.emptyText}>No songs found for {artist.name || 'Unknown Artist'}</Text>
			}
			style={styles.flatList} // Siyah arka plan
		/>
	)
}

const styles = StyleSheet.create({
	headerContainer: {
		alignItems: 'center',
		paddingVertical: 20,
	},
	artistImage: {
		width: 250,
		height: 250,
		borderRadius: 125,
		marginBottom: 10,
		borderColor: colors.primary,
		borderWidth: 1,
	},
	artistName: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#fff',
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 20,
		color: '#888',
		fontSize: 16,
	},
	flatList: {
		flex: 1,
		backgroundColor: '#000',
	},
})

export default ArtistDetailScreen

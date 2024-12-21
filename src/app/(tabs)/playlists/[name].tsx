import unknownTrackImage from '@/assets/unknown_artist.png' // Bilinmeyen playlist resmi
import { PlaylistTracksList } from '@/components/PlaylistTracksList'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { usePlaylists } from '@/store/library'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'

export const unknownTrackImageUri = Image.resolveAssetSource(unknownTrackImage).uri // Bilinmeyen şarkı resmi

const PlaylistScreen = () => {
	const { name: playlistName } = useLocalSearchParams<{ name: string }>()

	const { playlists } = usePlaylists()

	// Arama çubuğu tanımlaması
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Search in playlist',
		},
	})

	const playlist = playlists.find((playlist) => playlist.name === playlistName)

	if (!playlist) {
		console.warn(`Playlist ${playlistName} was not found!`)
		return <Redirect href={'/(tabs)/playlists'} />
	}

	// Şarkıları filtreleme
	const filteredTracks = useMemo(() => {
		return playlist.tracks.filter(
			(track) => track.title && track.title.toLowerCase().includes(search.toLowerCase()), // Arama sorgusuna göre filtreleme
		)
	}, [playlist.tracks, search])

	// Playlist için ilk şarkının resmi veya varsayılan resim
	const playlistImageUri =
		playlist.tracks.length > 0
			? playlist.tracks[0].artwork || unknownTrackImageUri
			: unknownTrackImageUri

	return (
		<FlatList
			data={filteredTracks}
			contentContainerStyle={{
				paddingHorizontal: 12,
				paddingBottom: 120,
			}}
			ListHeaderComponent={
				<View style={styles.headerContainer}>
					<FastImage
						source={{
							uri: playlistImageUri, // İlk şarkının resmi veya varsayılan resim
							priority: FastImage.priority.high,
						}}
						style={styles.playlistImage}
					/>
					<Text style={styles.playlistName}>{playlist.name || 'Unknown Playlist'}</Text>
				</View>
			}
			keyExtractor={(item, index) => item.id || `unknown-${index}`} // Benzersiz key
			renderItem={({ item }) => <PlaylistTracksList playlist={{ ...playlist, tracks: [item] }} />}
			ListEmptyComponent={
				<Text style={styles.emptyText}>
					No songs found in {playlist.name || 'Unknown Playlist'}
				</Text>
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
	playlistImage: {
		width: 300,
		height: 300,
		borderRadius: 10,
		marginBottom: 10,
		borderColor: '#fff',
		borderWidth: 1,
	},
	playlistName: {
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

export default PlaylistScreen

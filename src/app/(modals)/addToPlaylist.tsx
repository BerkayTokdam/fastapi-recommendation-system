import { PlaylistsList } from '@/components/PlaylistsList'
import { colors, screenPadding } from '@/constants/tokens'
import { Playlist } from '@/helpers/types'
import { usePlaylists, useTracks } from '@/store/library'
import { useQueue } from '@/store/queue'
import { defaultStyles } from '@/styles'
import { useHeaderHeight } from '@react-navigation/elements'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import TrackPlayer, { Track } from 'react-native-track-player'

const AddToPlaylistModal = () => {
	const router = useRouter()
	const headerHeight = useHeaderHeight()

	const { activeQueueId } = useQueue()
	const { trackUrl } = useLocalSearchParams<{ trackUrl: Track['url'] }>()
	const [newPlaylistName, setNewPlaylistName] = useState('')

	const tracks = useTracks() || []
	const { playlists: playlistsData = [], addToPlaylist, addPlaylist } = usePlaylists() || {}

	// Eğer tracks undefined ise kullanıcıya bilgi veriyoruz
	if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
		console.warn('Tracks data is unavailable:', tracks)
		return (
			<SafeAreaView style={[styles.modalContainer, { paddingTop: headerHeight }]}>
				<Text style={defaultStyles.text}>Tracks data is unavailable</Text>
			</SafeAreaView>
		)
	}

	const track = useMemo(() => {
		return tracks.find((currentTrack) => trackUrl === currentTrack.url)
	}, [tracks, trackUrl])

	// Eğer track bulunamazsa kullanıcıya bilgi veriyoruz
	if (!track) {
		console.warn('Track not found for URL:', trackUrl)
		return (
			<SafeAreaView style={[styles.modalContainer, { paddingTop: headerHeight }]}>
				<Text style={defaultStyles.text}>Track not found</Text>
			</SafeAreaView>
		)
	}

	// playlistsData içinde uygun playlist'leri filtreliyoruz
	const availablePlaylists = useMemo(() => {
		if (!playlistsData || !Array.isArray(playlistsData)) {
			console.error('playlistsData invalid:', playlistsData)
			return []
		}
		if (!track) {
			console.error('track is undefined or null:', track)
			return []
		}

		return playlistsData.filter((playlist) => {
			if (!Array.isArray(playlist.tracks)) {
				console.warn(`Playlist "${playlist.name}" does not have a valid "tracks" array.`)
				return false
			}

			return !playlist.tracks.some((playlistTrack) => playlistTrack.url === track.url)
		})
	}, [playlistsData, track])

	const handlePlaylistPress = async (playlist: Playlist) => {
		try {
			addToPlaylist(track, playlist.name)

			router.dismiss() // Modal'ı kapatıyoruz

			if (activeQueueId?.startsWith(playlist.name)) {
				await TrackPlayer.add(track)
			}
		} catch (error) {
			console.error('Error adding track to playlist:', error)
		}
	}

	// Yeni playlist oluşturma
	const handleAddPlaylist = () => {
		if (!newPlaylistName.trim()) {
			console.warn('Playlist name is empty')
			return
		}

		// İlk şarkının görselini playlist artwork olarak ekle
		const firstTrackArtwork = track?.artwork || null
		addPlaylist(newPlaylistName.trim(), firstTrackArtwork)

		// Input'u temizle
		setNewPlaylistName('')
	}

	return (
		<SafeAreaView style={[styles.modalContainer, { paddingTop: headerHeight }]}>
			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder="Enter playlist name"
					placeholderTextColor="#666"
					value={newPlaylistName}
					onChangeText={setNewPlaylistName}
				/>
				<TouchableOpacity style={styles.addButton} onPress={handleAddPlaylist}>
					<Text style={styles.addButtonText}>Add</Text>
				</TouchableOpacity>
			</View>

			{availablePlaylists.length > 0 ? (
				<PlaylistsList
					style={{
						marginTop: 20,
					}}
					playlists={availablePlaylists}
					onPlaylistPress={handlePlaylistPress}
				/>
			) : (
				<Text style={defaultStyles.text}>No available playlists</Text>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	modalContainer: {
		...defaultStyles.container,
		paddingHorizontal: screenPadding.horizontal,
		flex: 1,
		justifyContent: 'flex-start',
		paddingTop: 10,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	input: {
		flex: 1,
		height: 40,
		borderColor: colors.primary,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		color: '#fff',
		backgroundColor: '#222',
	},
	addButton: {
		marginLeft: 10,
		backgroundColor: '#222',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
		borderColor: colors.primary,
		borderWidth: 1,
	},
	addButtonText: {
		color: colors.primary,
		fontWeight: 'bold',
	},
})

export default AddToPlaylistModal

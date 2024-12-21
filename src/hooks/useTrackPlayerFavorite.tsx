import { useFavorites } from '@/store/library'
import { useCallback } from 'react'
import TrackPlayer, { useActiveTrack } from 'react-native-track-player'

export const useTrackPlayerFavorite = () => {
	const activeTrack = useActiveTrack() //comes directly from the track player internal state

	const { favorites, toggleTrackFavorite } = useFavorites()

	const isFavorite = favorites.find((track) => track.url === activeTrack?.url)?.rating === 1

	//we're updating both the track player internal state
	const toggleFavorite = useCallback(async () => {
		const id = await TrackPlayer.getActiveTrackIndex()

		if (id == null) return

		// update track player internal state and the application internal state
		await TrackPlayer.updateMetadataForTrack(id, {
			rating: isFavorite ? 0 : 1,
		})

		// update the app internal state
		if (activeTrack) {
			toggleTrackFavorite(activeTrack)
		}
	}, [isFavorite, toggleTrackFavorite, activeTrack])

	return { isFavorite, toggleFavorite }
}

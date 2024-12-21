import { saveToDayMusic } from '@/lib/dayMusic'
import { useAuth } from '@/providers/AuthProvider'
import Toast from 'react-native-toast-message'
import TrackPlayer, { Event, RepeatMode, useTrackPlayerEvents } from 'react-native-track-player'

let lastPlayedTrackUrl: string | null = null // Son oynatılan şarkıyı takip etmek için global değişken

const useTrackPlayerEventListener = () => {
	const { session } = useAuth()

	useTrackPlayerEvents([Event.PlaybackTrackChanged, Event.PlaybackQueueEnded], async (event) => {
		if (!session?.user) return

		// Döngü modu kontrolü
		const repeatMode = await TrackPlayer.getRepeatMode()

		const trackIndex =
			event.type === Event.PlaybackQueueEnded && repeatMode === RepeatMode.Track
				? await TrackPlayer.getCurrentTrack() // Şarkı tekrar modunda
				: event.type === Event.PlaybackTrackChanged
					? event.nextTrack // Normal geçiş
					: null

		if (trackIndex == null) return

		// Track verilerini al
		const track = await TrackPlayer.getTrack(trackIndex)
		if (!track) return

		// Eğer aynı şarkı tekrar çalınıyorsa bile, kaydet
		if (track.url !== lastPlayedTrackUrl) {
			lastPlayedTrackUrl = track.url // Son çalınan şarkıyı güncelle

			const trackData = {
				url: track.url,
				title: track.title ?? 'Unknown Title',
				artist: track.artist ?? 'Unknown Artist',
				genre: Array.isArray(track.genre) ? track.genre : [track.genre || ''],
				artwork: track.artwork || '',
				rating: track.rating || 0,
				playlist: track.playlist || [],
			}

			// Şarkıyı kaydet
			try {
				await saveToDayMusic(trackData, session.user.id)
				Toast.show({
					type: 'success',
					text1: 'Track Saved',
					text2: `${track.title || 'Unknown Title'} added to your daily list.`,
				})
			} catch (err) {
				console.error('Error saving track:', err)
			}
		}
	})
}

export default useTrackPlayerEventListener

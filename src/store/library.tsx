import library from '@/assets/data/library.json'
import { unknownTrackImageUri } from '@/constants/images'
import { Artist, Playlist, TrackWithPlayList } from '@/helpers/types'
import { useMemo } from 'react'
import Toast from 'react-native-toast-message'
import { Track } from 'react-native-track-player'
import { create } from 'zustand'

// JSON'dan gelen eksik playlist'ler için varsayılan değer atama
const defaultTracks: TrackWithPlayList[] = library.map((track) => ({
	...track,
	playlist: track.playlist ?? [], // Eğer playlist yoksa boş dizi ekle
}))

// Varsayılan Playlist'leri oluşturuyoruz
const defaultPlaylists: Playlist[] = defaultTracks.reduce<Playlist[]>((acc, track) => {
	;(track.playlist || []).forEach((playlistName) => {
		const existingPlaylist = acc.find((p) => p.name === playlistName)
		if (existingPlaylist) {
			existingPlaylist.tracks.push(track)
		} else {
			acc.push({
				name: playlistName,
				tracks: [track],
				artworkPreview: track.artwork || unknownTrackImageUri,
			})
		}
	})
	return acc
}, [])

// Zustand Store tanımlaması
interface LibraryState {
	tracks: TrackWithPlayList[] // Tüm parçalar
	playlists: Playlist[] // Tüm playlistler
	toggleTrackFavorite: (track: Track) => void // Favorilere ekleme/çıkarma
	addToPlaylist: (track: Track, playlistName: string) => void // Playlist'e ekleme
	addPlaylist: (name: string, artworkPreview?: string | null) => void // Yeni playlist oluşturma
}

export const useLibraryStore = create<LibraryState>()((set) => ({
	tracks: defaultTracks, // Başlangıç parçaları
	playlists: defaultPlaylists, // Başlangıç playlist'leri

	// Bir parçayı favorilere ekleme veya çıkarma
	toggleTrackFavorite: (track) =>
		set((state) => {
			const updatedTracks = state.tracks.map((currentTrack) => {
				if (currentTrack.url === track.url) {
					const isFavorite = currentTrack.rating === 1
					const updatedTrack = {
						...currentTrack,
						rating: isFavorite ? 0 : 1, // Favori ise çıkar, değilse ekle
					}

					// Kullanıcıya Toast mesajı
					Toast.show({
						type: 'success',
						text1: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
						text2: `${track.title} has been ${
							isFavorite ? 'removed from' : 'added to'
						} your favorites.`,
						position: 'bottom',
					})

					return updatedTrack
				}
				return currentTrack
			})

			return { tracks: updatedTracks }
		}),

	// Bir parçayı playlist'e ekleme
	addToPlaylist: (track, playlistName) =>
		set((state) => {
			const updatedTracks = state.tracks.map((currentTrack) => {
				if (currentTrack.url === track.url) {
					const updatedPlaylists = currentTrack.playlist
						? [...new Set([...currentTrack.playlist, playlistName])] // Aynı playlist'e eklemeyi engelle
						: [playlistName]
					return { ...currentTrack, playlist: updatedPlaylists }
				}
				return currentTrack
			})

			// Kullanıcıya Toast mesajı
			Toast.show({
				type: 'success',
				text1: 'Playlist Updated',
				text2: `${track.title} has been added to ${playlistName}`,
				position: 'bottom',
			})

			// Playlist'i güncelle
			const updatedPlaylists = state.playlists.map((playlist) => {
				if (playlist.name === playlistName) {
					return {
						...playlist,
						tracks: [...playlist.tracks, track],
					}
				}
				return playlist
			})

			return { tracks: updatedTracks, playlists: updatedPlaylists }
		}),

	// Yeni playlist oluşturma
	addPlaylist: (name, artworkPreview = null) =>
		set((state) => {
			// Eğer playlist adı zaten varsa ekleme yapma
			if (state.playlists.find((playlist) => playlist.name === name)) {
				Toast.show({
					type: 'error',
					text1: 'Playlist Exists',
					text2: `A playlist named "${name}" already exists.`,
					position: 'bottom',
				})
				return state
			}

			// Yeni playlist'i ekle
			const newPlaylist = {
				name,
				tracks: [],
				artworkPreview: artworkPreview || unknownTrackImageUri, // Eğer artwork yoksa varsayılan resim kullan
			}

			return {
				...state,
				playlists: [...state.playlists, newPlaylist],
			}
		}),
}))

// Tüm parçaları alma
export const useTracks = () => useLibraryStore((state) => state.tracks)

// Favori parçaları alma
export const useFavorites = () => {
	const favorites = useLibraryStore((state) => state.tracks)
	const toggleTrackFavorite = useLibraryStore((state) => state.toggleTrackFavorite)

	const filteredFavorites = useMemo(() => {
		return favorites.filter((track) => track.rating === 1) // Sadece favori olanları al
	}, [favorites])

	return {
		favorites: filteredFavorites,
		toggleTrackFavorite,
	}
}

// Sanatçı bazlı parçaları alma
export const useArtists = () => {
	const tracks = useLibraryStore((state) => state.tracks)

	return useMemo(() => {
		if (!Array.isArray(tracks) || tracks.length === 0) {
			return [] // tracks boş ya da undefined kontrolü
		}

		return tracks.reduce((acc: Artist[], track: TrackWithPlayList) => {
			const existingArtist = acc.find((artist) => artist.name === track.artist)

			if (existingArtist) {
				existingArtist.tracks.push(track)
			} else {
				acc.push({
					name: track.artist ?? 'Unknown',
					tracks: [track],
				})
			}

			return acc
		}, [] as Artist[])
	}, [tracks])
}

// Playlist bazlı parçaları alma
export const usePlaylists = () => {
	const playlists = useLibraryStore((state) => state.playlists)
	const addToPlaylist = useLibraryStore((state) => state.addToPlaylist)
	const addPlaylist = useLibraryStore((state) => state.addPlaylist)

	return { playlists, addToPlaylist, addPlaylist }
}

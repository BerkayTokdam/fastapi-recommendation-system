import { TracksListItem } from '@/components/TrackListItem'
import { unknownTrackImageUri } from '@/constants/images'
import { useQueue } from '@/store/queue'
import { utilsStyles } from '@/styles'
import { useEffect, useRef, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import TrackPlayer, { Track } from 'react-native-track-player'
import useTrackPlayerEventListener from '../hooks/useTrackPlayerListener'
import { QueueControls } from './QueueControls'

export type TracksListProps = {
	id: string
	tracks: Track[]
	hideQueueControls?: boolean
	search?: string
}

const ItemDivider = () => (
	<View style={{ ...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60 }} />
)

export const TracksList = ({
	id,
	tracks,
	hideQueueControls = false,
	search = '',
}: TracksListProps) => {
	const queueOffset = useRef(0)
	const { activeQueueId, setActiveQueueId } = useQueue()
	const [visibleTracks, setVisibleTracks] = useState(tracks.slice(0, 15))
	const [startIndex, setStartIndex] = useState(0)

	// TrackPlayer olaylarını dinlemek için hook
	useTrackPlayerEventListener()

	useEffect(() => {
		if (!search) {
			setVisibleTracks(tracks.slice(0, startIndex + 15))
		} else {
			const filteredTracks = tracks.filter((track) =>
				track.title?.toLowerCase().includes(search.toLowerCase()),
			)
			setVisibleTracks(filteredTracks)
		}
	}, [search, tracks, startIndex])

	const handleTrackSelect = async (selectedTrack: Track) => {
		const trackIndex = tracks.findIndex((track) => track.url === selectedTrack.url)
		if (trackIndex === -1) return

		const isChangingQueue = id !== activeQueueId

		if (isChangingQueue) {
			const beforeTracks = tracks.slice(0, trackIndex)
			const afterTracks = tracks.slice(trackIndex + 1)

			await TrackPlayer.reset()
			await TrackPlayer.add(selectedTrack)
			await TrackPlayer.add(afterTracks)
			await TrackPlayer.add(beforeTracks)

			await TrackPlayer.play()

			queueOffset.current = trackIndex
			setActiveQueueId(id)
		} else {
			const nextTrackIndex =
				trackIndex - queueOffset.current < 0
					? tracks.length + trackIndex - queueOffset.current
					: trackIndex - queueOffset.current

			await TrackPlayer.skip(nextTrackIndex)
			await TrackPlayer.play()
		}
	}

	const loadMoreTracks = () => {
		if (search) return
		const nextIndex = startIndex + 15
		if (nextIndex >= tracks.length) return

		setStartIndex(nextIndex)
		setVisibleTracks(tracks.slice(0, nextIndex + 15))
	}

	return (
		<FlatList
			data={visibleTracks}
			contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
			ListHeaderComponent={
				!hideQueueControls ? (
					<QueueControls tracks={tracks} style={{ paddingBottom: 20 }} />
				) : undefined
			}
			ListFooterComponent={ItemDivider}
			ItemSeparatorComponent={ItemDivider}
			ListEmptyComponent={
				<View>
					<Text style={utilsStyles.emptyContentText}>No songs found</Text>
					<FastImage
						source={{ uri: unknownTrackImageUri, priority: FastImage.priority.normal }}
						style={utilsStyles.emptyContentImage}
					/>
				</View>
			}
			renderItem={({ item: track }) => (
				<TracksListItem track={track} onTrackSelect={handleTrackSelect} />
			)}
			keyExtractor={(item, index) => `${item.url}-${index}`}
			onEndReached={loadMoreTracks}
			onEndReachedThreshold={0.5}
		/>
	)
}

import { TracksList } from '@/components/TracksList'
import { colors, screenPadding } from '@/constants/tokens'
import { trackTitleFilter } from '@/helpers/filter'
import { generateTracksListId } from '@/helpers/miscellaneous'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useTracks } from '@/store/library'
import { useMemo } from 'react'
import { View } from 'react-native'

const SongScreen = () => {
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Find in songs',
		},
	})

	const tracks = useTracks()

	const filteredTracks = useMemo(() => {
		if (!search) return tracks

		return tracks.filter(trackTitleFilter(search))
	}, [search, tracks])

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: colors.background,
				paddingTop: 120,
				paddingHorizontal: screenPadding.horizontal,
			}}
		>
			<TracksList id={generateTracksListId('songs', search)} tracks={filteredTracks} />
		</View>
	)
}

export default SongScreen

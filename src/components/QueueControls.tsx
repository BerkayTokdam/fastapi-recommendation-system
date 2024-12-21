import { colors } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import TrackPlayer, { Track } from 'react-native-track-player'

type QueueControlsProps = {
	tracks: Track[]
} & ViewProps

export const QueueControls = ({ tracks, style, ...ViewProps }: QueueControlsProps) => {
	const handlePlay = async () => {
		await TrackPlayer.setQueue(tracks)
		await TrackPlayer.play()
	}

	const handleShufflePlay = async () => {
		const shuffleTracks = [...tracks].sort(() => Math.random() - 0.5)

		await TrackPlayer.setQueue(shuffleTracks)
		await TrackPlayer.play()
	}

	return (
		<View style={[{ flexDirection: 'row', columnGap: 16 }, style]} {...ViewProps}>
			{/* Play Button */}
			<View style={{ flex: 1 }}>
				<TouchableOpacity onPress={handlePlay} activeOpacity={0.8} style={styles.button}>
					<Ionicons name="play" size={22} color={colors.primary} />
					<Text style={styles.buttonText}>Play</Text>
				</TouchableOpacity>
			</View>

			{/* Shuffle Button */}
			<View style={{ flex: 1 }}>
				<TouchableOpacity onPress={handleShufflePlay} activeOpacity={0.8} style={styles.button}>
					<Ionicons name={'shuffle-sharp'} size={24} color={colors.primary} />
					<Text style={styles.buttonText}>Shuffle</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	button: {
		padding: 12,
		backgroundColor: 'rgba(47,47,47,0.5)',
		borderRadius: 8,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		columnGap: 8,
	},
	buttonText: {
		...defaultStyles.text,
		color: colors.primary,
		fontWeight: '600',
		fontSize: 18,
		textAlign: 'center',
	},
})

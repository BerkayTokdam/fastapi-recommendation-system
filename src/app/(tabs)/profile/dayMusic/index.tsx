import { getDayMusic } from '@/lib/dayMusic'
import { useAuth } from '@/providers/AuthProvider'
import { DayMusic } from '@/types/DayMusic'
import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'

const DayMusicScreen = () => {
	const { session } = useAuth()
	const [dayMusic, setDayMusic] = useState<DayMusic[]>([])

	useEffect(() => {
		const fetchDayMusic = async () => {
			if (session?.user) {
				const data = await getDayMusic(session.user.id)
				setDayMusic(data)
			}
		}

		fetchDayMusic()
	}, [session])

	return (
		<FlatList
			data={dayMusic}
			keyExtractor={(item, index) => `${item.url}-${index}`} // Benzersiz anahtar
			contentContainerStyle={styles.container}
			renderItem={({ item }) => (
				<View style={styles.itemContainer}>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.artist}>{item.artist}</Text>
				</View>
			)}
			ListEmptyComponent={<Text style={styles.emptyText}>No songs played today.</Text>}
		/>
	)
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		paddingBottom: 100,
		backgroundColor: 'black',
	},
	itemContainer: {
		padding: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: 'gray',
		borderRadius: 8,
		backgroundColor: '#333',
	},
	title: {
		fontSize: 16,
		fontWeight: 'bold',
		color: 'white',
	},
	artist: {
		fontSize: 14,
		color: '#dddddd',
		marginTop: 4,
	},
	emptyText: {
		fontSize: 16,
		textAlign: 'center',
		marginTop: 20,
		color: 'White',
	},
})

export default DayMusicScreen

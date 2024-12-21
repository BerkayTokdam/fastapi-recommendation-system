import { Stack } from 'expo-router'

export default function DayMusicStack() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerShown: false, // Başlık çubuğunu göster
					title: 'Daily Music', // 'Daily Music' başlığını ekle
				}}
			/>
		</Stack>
	)
}

import ChatProvider from '@/providers/ChatProvider'
import { Stack } from 'expo-router'

export default function ChatLayout() {
	return (
		<ChatProvider>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			/>
		</ChatProvider>
	)
}

import { useAuth } from '@/providers/AuthProvider'
import ChatProvider from '@/providers/ChatProvider'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { Link, router, Stack } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ChannelList } from 'stream-chat-expo'

export default function ChatScreen() {
	const { user } = useAuth()
	return (
		<ChatProvider>
			<Stack.Screen
				options={{
					headerShown: true,
					headerStyle: { backgroundColor: 'black' },
					headerTitleStyle: { color: 'white' },
					headerTitle: 'Chat',
					headerRight: () => (
						<Link href="../chat/users" asChild>
							<FontAwesome5 name="users" size={24} color={'white'} style={{ marginRight: 8 }} />
						</Link>
					),
				}}
			/>
			<View style={styles.container}>
				<ChannelList
					filters={{ members: { $in: [user.id] } }}
					onSelect={(channel) => router.push(`/chat/channel/${channel.cid}`)}
				/>
			</View>
		</ChatProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
	},
})

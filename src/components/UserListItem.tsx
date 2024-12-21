import { useAuth } from '@/providers/AuthProvider'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, Text } from 'react-native'
import { useChatContext } from 'stream-chat-expo'

const UserListItem = ({ user }: any) => {
	const { client } = useChatContext()
	const { user: me } = useAuth()

	const onPress = async () => {
		//start a chat with him
		const channel = client.channel('messaging', {
			members: [me?.id, user.id],
		})
		await channel.watch()
		router.replace(`../chat/channel/${channel.cid}`)
	}
	return (
		<Pressable
			onPress={onPress}
			style={{
				padding: 12,
				backgroundColor: 'white',
				borderWidth: 0.5,
				borderColor: 'black',
			}}
		>
			<Text style={{ fontWeight: '600', color: 'black', fontSize: 16 }}>{user.full_name}</Text>
		</Pressable>
	)
}

export default UserListItem

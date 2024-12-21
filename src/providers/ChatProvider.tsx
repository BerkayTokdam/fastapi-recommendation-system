import { supabase } from '@/lib/supabase'
import { tokenProvider } from '@/utils/tokenProvider'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { StreamChat } from 'stream-chat'
import { Chat, OverlayProvider } from 'stream-chat-expo'
import { useAuth } from './AuthProvider'

const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY

if (!apiKey) {
	throw new Error('API key is missing! Check your .env file and Expo configuration.')
}

const client = StreamChat.getInstance(apiKey)

export default function ChatProvider({ children }: PropsWithChildren) {
	const [isConnected, setIsConnected] = useState(false)
	const { profile } = useAuth()

	useEffect(() => {
		if (!profile) {
			return
		}
		const connect = async () => {
			const token = await tokenProvider()
			console.log('TOKEN: ', token)

			try {
				const token = client.devToken(profile.id)
				await client.connectUser(
					{
						id: profile.id,
						name: profile.full_name,
						image: supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl,
					},
					token,
				)
				setIsConnected(true)
			} catch (error) {
				console.error('Error connecting user:', error)
			}
		}

		connect()

		return () => {
			if (isConnected) {
				client.disconnectUser()
			}
			setIsConnected(false)
		}
	}, [profile?.id])

	if (!isConnected) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text>Connecting to chat...</Text>
			</View>
		)
	}

	return (
		<OverlayProvider>
			<Chat client={client}>{children}</Chat>
		</OverlayProvider>
	)
}

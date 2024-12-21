import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Channel as StreamChannel } from 'stream-chat'
import { Channel, MessageInput, MessageList, useChatContext } from 'stream-chat-expo'

export default function ChannelScreen() {
	const [channel, setChannel] = useState<StreamChannel | null>(null)
	const { cid } = useLocalSearchParams<{ cid: string }>()
	const { client } = useChatContext()

	useEffect(() => {
		const fetchChannel = async () => {
			try {
				if (!client.userID) {
					console.log('Kullanıcı bağlanıyor...')
					return
				}
				if (!cid) {
					console.error('CID eksik!')
					return
				}

				const fetchedChannel = client.channel('messaging', cid.split(':')[1])
				await fetchedChannel.watch()
				setChannel(fetchedChannel)
			} catch (error) {
				console.error('Kanal alınırken hata:', error)
			}
		}

		fetchChannel()
	}, [cid, client.userID])

	if (!channel) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<Channel channel={channel} audioRecordingEnabled>
				<MessageList />
				<SafeAreaView edges={['bottom']}>
					<MessageInput />
				</SafeAreaView>
			</Channel>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		paddingTop: 20,
		paddingBottom: 100,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
})

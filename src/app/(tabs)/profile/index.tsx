import Avatar from '@/components/Avatar'
import { colors } from '@/constants/tokens'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import { useNavigation } from '@react-navigation/native'
import { Button, Input } from '@rneui/themed'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

export default function ProfileScreen() {
	const navigation = useNavigation()

	const { session } = useAuth()
	const [loading, setLoading] = useState(true)
	const [username, setUsername] = useState('')
	const [fullName, setFullname] = useState('')
	const [website, setWebsite] = useState('')
	const [avatarUrl, setAvatarUrl] = useState('')

	useEffect(() => {
		if (session) getProfile()
	}, [session])

	async function getProfile() {
		try {
			setLoading(true)
			if (!session?.user) throw new Error('No user on the session!')

			const { data, error, status } = await supabase
				.from('profiles')
				.select(`username, website, avatar_url, full_name`)
				.eq('id', session?.user.id)
				.single()
			if (error && status !== 406) {
				throw error
			}

			if (data) {
				setUsername(data.username)
				setWebsite(data.website)
				setAvatarUrl(data.avatar_url)
				setFullname(data.full_name)
			}
		} catch (error) {
			if (error instanceof Error) {
				Alert.alert(error.message)
			}
		} finally {
			setLoading(false)
		}
	}

	async function updateProfile({
		username,
		website,
		avatar_url,
		full_name,
	}: {
		username: string
		website: string
		avatar_url: string
		full_name: string
	}) {
		try {
			setLoading(true)
			if (!session?.user) throw new Error('No user on the session!')

			const updates = {
				id: session?.user.id,
				username,
				website,
				avatar_url,
				full_name,
				updated_at: new Date(),
			}

			const { error } = await supabase.from('profiles').upsert(updates)

			if (error) {
				throw error
			}
		} catch (error) {
			if (error instanceof Error) {
				Alert.alert(error.message)
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<View style={styles.outerContainer}>
			<ScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.avatarContainer}>
					<Avatar
						size={200}
						url={avatarUrl}
						onUpload={(url: string) => {
							setAvatarUrl(url)
							updateProfile({ username, website, avatar_url: url, full_name: fullName })
						}}
					/>
				</View>
				<View style={[styles.verticallySpaced, styles.mt20]}>
					<Input
						label="Email"
						value={session?.user?.email}
						disabled
						inputStyle={{ color: 'white' }}
						labelStyle={{ color: 'white' }}
					/>
				</View>
				<View style={styles.verticallySpaced}>
					<Input
						label="Full name"
						value={fullName || ''}
						onChangeText={(text) => setFullname(text)}
						inputStyle={{ color: 'white' }}
						labelStyle={{ color: 'white' }}
					/>
				</View>
				<View style={styles.verticallySpaced}>
					<Input
						label="Username"
						value={username || ''}
						onChangeText={(text) => setUsername(text)}
						inputStyle={{ color: 'white' }}
						labelStyle={{ color: 'white' }}
					/>
				</View>
				<View style={styles.verticallySpaced}>
					<Input
						label="Website"
						value={website || ''}
						onChangeText={(text) => setWebsite(text)}
						inputStyle={{ color: 'white' }}
						labelStyle={{ color: 'white' }}
					/>
				</View>

				<View style={[styles.verticallySpaced, styles.mt20]}>
					<Button
						title={loading ? 'Loading ...' : 'Update'}
						onPress={() =>
							updateProfile({ username, website, avatar_url: avatarUrl, full_name: fullName })
						}
						disabled={loading}
						buttonStyle={styles.button}
						titleStyle={styles.buttonTitle}
					/>
				</View>
				<View style={styles.verticallySpaced}>
					<Button
						title="Sign Out"
						onPress={() => supabase.auth.signOut()}
						buttonStyle={styles.button}
						titleStyle={styles.buttonTitle}
					/>
				</View>
				<View style={styles.dayMusicContainer}>
					<Button
						title="Go to Day Music"
						onPress={() => router.push('/profile/dayMusic')}
						buttonStyle={styles.buttonDayMusic}
						titleStyle={styles.buttonTitleDayMusic}
					/>
				</View>
				<View style={styles.daySuggestionContainer}>
					<Button
						title="Go to Suggestions"
						onPress={() => router.push('/profile/suggestions')} // Yönlendirme yapılacak rota
						buttonStyle={styles.buttonDayMusic}
						titleStyle={styles.buttonTitleDayMusic}
					/>
				</View>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	outerContainer: {
		flex: 1,
		backgroundColor: 'black',
	},
	scrollContainer: {
		paddingHorizontal: 12,
		paddingBottom: 120,
		paddingTop: 100,
	},
	verticallySpaced: {
		paddingTop: 4,
		paddingBottom: 4,
		alignSelf: 'stretch',
	},
	dayMusicContainer: {
		paddingTop: 50,
		paddingBottom: 1,
		alignSelf: 'stretch',
	},
	daySuggestionContainer: {
		paddingTop: 1,
		paddingBottom: 4,
		alignSelf: 'stretch',
	},
	mt20: {
		marginTop: 20,
	},
	button: {
		backgroundColor: colors.primary,
		borderRadius: 15,
	},
	buttonDayMusic: {
		backgroundColor: 'black',
		borderRadius: 1,
	},
	buttonTitle: {
		color: '#000000',
		fontWeight: 'bold',
	},
	buttonTitleDayMusic: {
		color: '#ffffff',
		fontWeight: 'bold',
	},
	avatarContainer: {
		alignItems: 'center',
	},
})
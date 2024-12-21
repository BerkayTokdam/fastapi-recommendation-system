import { colors } from '@/constants/tokens'
import { Button, Input } from '@rneui/themed'
import React, { useState } from 'react'
import { Alert, AppState, StyleSheet, View } from 'react-native'
import { supabase } from '../../lib/supabase'

// Supabase Auth oturum yenileme işlevi
AppState.addEventListener('change', (state) => {
	if (state === 'active') {
		supabase.auth.startAutoRefresh()
	} else {
		supabase.auth.stopAutoRefresh()
	}
})

export default function Auth() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)

	async function signInWithEmail() {
		setLoading(true)
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		})

		if (error) Alert.alert(error.message)
		setLoading(false)
	}

	async function signUpWithEmail() {
		setLoading(true)
		const {
			data: { session },
			error,
		} = await supabase.auth.signUp({
			email: email,
			password: password,
		})

		if (error) Alert.alert(error.message)
		if (!session) Alert.alert('Please check your inbox for email verification!')
		setLoading(false)
	}

	return (
		<View style={styles.container}>
			<View style={[styles.verticallySpaced, styles.mt20]}>
				<Input
					label="Email"
					leftIcon={{ type: 'font-awesome', name: 'envelope', color: 'white' }}
					onChangeText={(text) => setEmail(text)}
					value={email}
					placeholder="email@address.com"
					autoCapitalize="none"
					inputStyle={{ color: 'white' }}
					labelStyle={{ color: 'white' }}
					placeholderTextColor="#888"
				/>
			</View>
			<View style={styles.verticallySpaced}>
				<Input
					label="Password"
					leftIcon={{ type: 'font-awesome', name: 'lock', color: 'white' }}
					onChangeText={(text) => setPassword(text)}
					value={password}
					secureTextEntry={true}
					placeholder="Password"
					autoCapitalize="none"
					inputStyle={{ color: 'white' }}
					labelStyle={{ color: 'white' }}
					placeholderTextColor="#888"
				/>
			</View>
			<View style={[styles.verticallySpaced, styles.mt20]}>
				<Button
					title="Sign in"
					disabled={loading}
					onPress={() => signInWithEmail()}
					buttonStyle={styles.button}
					titleStyle={styles.buttonTitle}
				/>
			</View>
			<View style={styles.verticallySpaced}>
				<Button
					title="Sign up"
					disabled={loading}
					onPress={() => signUpWithEmail()}
					buttonStyle={styles.button}
					titleStyle={styles.buttonTitle}
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
		paddingTop: 100,
		paddingLeft: 12,
		paddingRight: 12,
	},
	verticallySpaced: {
		paddingTop: 4,
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
	buttonTitle: {
		color: '#000000',
		fontWeight: 'bold',
	},
})

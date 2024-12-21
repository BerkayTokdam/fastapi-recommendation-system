import { useAuth } from '@/providers/AuthProvider'
import { Redirect, Stack } from 'expo-router'

export default function AuthLayout() {
	const { user } = useAuth()

	if (user) {
		return <Redirect href={'/(tabs)'} />
	}
	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerStyle: {
					backgroundColor: 'black',
				},
				headerTintColor: 'white',
				headerTitleStyle: {
					color: 'white',
					fontWeight: 'bold',
				},
			}}
		/>
	)
}

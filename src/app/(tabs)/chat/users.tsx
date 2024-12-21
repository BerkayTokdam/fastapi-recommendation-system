import UserListItem from '@/components/UserListItem'
import { colors } from '@/constants/tokens'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

export default function UserScreen() {
	const [users, setUsers] = useState<any[]>([])
	const [searchQuery, setSearchQuery] = useState<string>('')
	const { user } = useAuth()

	useEffect(() => {
		const fetchUsers = async () => {
			let { data: profiles, error } = await supabase
				.from('profiles')
				.select('*')
				.neq('id', user?.id)

			if (error) {
				console.error('Error fetching users:', error)
				return
			}

			setUsers(profiles || [])
		}
		fetchUsers()
	}, [])

	const filteredUsers = users.filter((u) =>
		u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerStyle: { backgroundColor: 'black' },
					headerTitleStyle: { color: 'white' },
					headerTitle: 'Users',
					headerTintColor: colors.primary,
				}}
			/>
			<View style={styles.container}>
				{/* Arama Çubuğu */}
				<TextInput
					style={styles.searchBar}
					placeholder="Search users..."
					placeholderTextColor="gray"
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
				<FlatList
					data={filteredUsers}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => <UserListItem user={item} />}
					contentContainerStyle={styles.listContent}
					ListEmptyComponent={<Text style={styles.emptyText}>Users not found</Text>}
				/>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	searchBar: {
		backgroundColor: 'white',
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 5,
		margin: 10,
		color: 'black',
		fontSize: 16,
	},
	listContent: {
		paddingVertical: 10,
		gap: 0,
	},
	emptyText: {
		textAlign: 'center',
		color: 'gray',
		fontSize: 18,
		marginTop: 20,
	},
})

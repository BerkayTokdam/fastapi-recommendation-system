import ProfileScreen from '@/app/(tabs)/profile/index'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import DayMusicScreen from '../../src/app/(tabs)/profile/dayMusic/index'

const Stack = createStackNavigator()

const AppNavigator = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Profile">
				<Stack.Screen name="Profile" component={ProfileScreen} />
				<Stack.Screen name="DayMusic" component={DayMusicScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	)
}

export default AppNavigator

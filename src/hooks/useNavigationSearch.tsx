import { colors } from '@/constants/tokens'
import { useNavigation } from 'expo-router'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native'
import { SearchBarProps } from 'react-native-screens'

const defaultSearchOptions: SearchBarProps = {
	tintColor: colors.primary,
	textColor: colors.text,
	headerIconColor: colors.text,
	hintTextColor: colors.text,
	hideWhenScrolling: false,
}

export const useNavigationSearch = ({
	searchBarOptions,
}: {
	searchBarOptions?: SearchBarProps
}) => {
	const [search, setSearch] = useState('')
	const navigation = useNavigation()

	const handleOnChangeText = useCallback((e: NativeSyntheticEvent<TextInputChangeEventData>) => {
		const { text } = e.nativeEvent
		setSearch(text)
	}, [])

	const memoizedSearchBarOptions = useMemo(() => {
		return {
			...defaultSearchOptions,
			...searchBarOptions,
			onChangeText: handleOnChangeText,
		}
	}, [searchBarOptions])

	useLayoutEffect(() => {
		navigation.setOptions({
			headerSearchBarOptions: {
				...memoizedSearchBarOptions,
				onChangeText: handleOnChangeText,
			},
		})
	}, [navigation, memoizedSearchBarOptions])

	return search
}

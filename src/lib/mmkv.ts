import { MMKV } from 'react-native-mmkv'

export const mmkvStorage = new MMKV()

// MMKV'yi Supabase'e uygun hale getiren yardımcı işlevler
export const MMKVStorage = {
	getItem: async (key: string) => {
		const value = mmkvStorage.getString(key)
		return value ? value : null
	},
	setItem: async (key: string, value: string) => {
		mmkvStorage.set(key, value)
	},
	removeItem: async (key: string) => {
		mmkvStorage.delete(key)
	},
}

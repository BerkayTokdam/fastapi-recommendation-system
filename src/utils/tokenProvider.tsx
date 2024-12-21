import { supabase } from '@/lib/supabase'

export const tokenProvider = async () => {
	try {
		const { data, error } = await supabase.functions.invoke('stream-token')

		if (error) {
			console.error('Error invoking Supabase function:', error)
			return null
		}

		if (!data || !data.token) {
			console.error('Token not found in function response:', data)
			return null
		}

		console.log('Token received:', data.token)
		return data.token
	} catch (err) {
		console.error('Unexpected error in tokenProvider:', err)
		return null
	}
}

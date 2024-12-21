import { colors } from '@/constants/tokens'
import { Button } from '@rneui/themed'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useState } from 'react'
import { Alert, Image, StyleSheet, View } from 'react-native'
import { supabase } from '../lib/supabase'

interface Props {
	size: number
	url: string | null
	onUpload: (filePath: string) => void
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
	const [uploading, setUploading] = useState(false)
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const avatarSize = { height: size, width: size, borderRadius: size / 2 } // Yuvarlak avatar

	useEffect(() => {
		if (url) downloadImage(url)
	}, [url])

	async function downloadImage(path: string) {
		try {
			const { data, error } = await supabase.storage.from('avatars').download(path)

			if (error) {
				throw error
			}

			const fr = new FileReader()
			fr.readAsDataURL(data)
			fr.onload = () => {
				setAvatarUrl(fr.result as string)
			}
		} catch (error) {
			if (error instanceof Error) {
				console.log('Error downloading image: ', error.message)
			}
		}
	}

	async function uploadAvatar() {
		try {
			setUploading(true)

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsMultipleSelection: false,
				allowsEditing: true,
				quality: 1,
				exif: false,
			})

			if (result.canceled || !result.assets || result.assets.length === 0) {
				console.log('User cancelled image picker.')
				return
			}

			const image = result.assets[0]

			if (!image.uri) {
				throw new Error('No image uri!')
			}

			const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())

			const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
			const path = `${Date.now()}.${fileExt}`
			const { data, error: uploadError } = await supabase.storage
				.from('avatars')
				.upload(path, arraybuffer, {
					contentType: image.mimeType ?? 'image/jpeg',
				})

			if (uploadError) {
				throw uploadError
			}

			onUpload(data.path)
		} catch (error) {
			if (error instanceof Error) {
				Alert.alert(error.message)
			} else {
				throw error
			}
		} finally {
			setUploading(false)
		}
	}

	return (
		<View style={styles.container}>
			{avatarUrl ? (
				<Image
					source={{ uri: avatarUrl }}
					accessibilityLabel="Avatar"
					style={[avatarSize, styles.avatar]}
				/>
			) : (
				<View style={[avatarSize, styles.avatar, styles.noImage]} />
			)}
			<View style={styles.buttonContainer}>
				<Button
					title={uploading ? 'Uploading ...' : 'Upload'}
					onPress={uploadAvatar}
					disabled={uploading}
					buttonStyle={styles.button}
					titleStyle={styles.buttonTitle}
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
	},
	avatar: {
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: colors.primary,
	},
	noImage: {
		backgroundColor: '#333',
		borderWidth: 1,
		borderStyle: 'solid',
		borderColor: 'rgb(200, 200, 200)',
	},
	buttonContainer: {
		marginTop: 15,
		alignSelf: 'stretch',
		paddingHorizontal: 12,
	},
	button: {
		backgroundColor: colors.primary,
		borderRadius: 15,
		paddingVertical: 10,
	},
	buttonTitle: {
		color: '#000000',
		fontWeight: 'bold',
	},
})

import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default [
	{
		ignores: [
			'node_modules/**',
			'.expo/**',
			'.next/**',
			'__generated__/**',
			'build/**',
			'android/**',
			'assets/**',
			'bin/**',
			'fastlane/**',
			'ios/**',
			'kotlin/providers/**',
			'vendored/**',
			'docs/public/static/**',
			'babel.config.js',
		],
	},
	{
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: 'module',
			globals: {
				JSX: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': typescriptEslintPlugin,
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
		},
		rules: {
			'no-unused-vars': 'warn',
			'no-undef': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'react/react-in-jsx-scope': 'off',
			'react/display-name': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
		},
	},
]

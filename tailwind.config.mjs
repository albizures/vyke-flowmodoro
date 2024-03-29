import { themes } from './src/themes'

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
		'./node_modules/@vyke/astro/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'
	],
	safelist: ['animate-shake'],
	theme: {
		extend: {
			animation: {
				'shake': 'shake .5s both',
			},
			keyframes: {
				'shake': {
					'10%, 90%': {
						transform: 'translateX(-0.2rem)'
					},

					'20%, 80%': {
						transform: 'translateX(0.2rem)'
					},

					'30%, 50%, 70%': {
						transform: 'translateX(-0.5rem)'
					},

					'40%, 60%': {
						transform: 'translateX(0.5rem)'
					}
				},
			}
		},
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
	daisyui: {
		themes,
	},
}

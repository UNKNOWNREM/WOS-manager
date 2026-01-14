/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./ranks.html",
        "./map.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                // Main theme colors
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                // Theme Colors (New Palettes)
                theme: {
                    // Set 1
                    'pink-cyan': '#AFDBE6',
                    'pink-purple': '#427EA4',
                    'grey-moon': '#1C4366',
                    'sand-cyan': '#01151C',
                    'smoke-coagulate': '#1A153E',
                    // Set 2
                    'cloud': '#F1F0F1',
                    'purple-gauze': '#9C7692',
                    'smoke-light': '#254972',
                    'mountain-mist': '#152C4E',
                    'star-frost': '#17294C',
                },
                // Alliance colors
                alliance: {
                    unassigned: '#6b7280',
                    a: '#ef4444',
                    b: '#3b82f6',
                    c: '#10b981',
                    d: '#fbbf24',
                    e: '#a855f7',
                },
                // Status colors
                status: {
                    protected: '#3b82f6',
                    opening: '#10b981',
                    soon: '#fbbf24',
                    closing: '#6b7280',
                    contested: '#ef4444',
                },
                // Glass effect colors
                glass: {
                    100: 'rgba(255, 255, 255, 0.08)',
                    200: 'rgba(255, 255, 255, 0.12)',
                    300: 'rgba(255, 255, 255, 0.16)',
                }
            },
            backgroundImage: {
                // Set 1 Gradients
                'grad-pink-cyan': 'linear-gradient(to right, #ECD0E0, #AFDBE6)',
                'grad-pink-purple': 'linear-gradient(to right, #D29FA9, #427EA4)',
                'grad-grey-moon': 'linear-gradient(to right, #A0CCDA, #1C4366)',
                'grad-sand-cyan': 'linear-gradient(to right, #446485, #01151C)',
                'grad-smoke-coagulate': 'linear-gradient(to bottom right, #3C5662, #1A153E)',

                // Set 2 Gradients
                'grad-cloud': 'linear-gradient(to right, #F1F0F1, #DFCFC4)',
                'grad-purple-gauze': 'linear-gradient(to right, #D6C7C0, #9C7692)',
                'grad-smoke-light': 'linear-gradient(to right, #946886, #254972)',
                'grad-mountain-mist': 'linear-gradient(to right, #CCB6B6, #152C4E)',
                'grad-star-frost': 'linear-gradient(to right, #1D416B, #17294C)',

                // Theme Semantic Gradients
                'theme-main': 'linear-gradient(to bottom, #1C4366, #254972, #3C5662)', // Updated Vertical Gradient
                'theme-panel': 'linear-gradient(to bottom right, #1D416B, #17294C)', // Set 2 #5
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}

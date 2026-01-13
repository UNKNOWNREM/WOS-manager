/** @type {import('tailwindcss').Config} */
export default {
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
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}

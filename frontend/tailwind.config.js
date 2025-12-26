/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#00f2fe", // Neon Cyan
                secondary: "#7000ff", // Neon Purple
                accent: "#ff00e5", // Neon Pink
                background: "#030014", // Deep Dark Space
                surface: "#0c0a25", // Dark Surface
                glow: {
                    cyan: "0 0 20px rgba(0, 242, 254, 0.5)",
                    purple: "0 0 20px rgba(112, 0, 255, 0.5)",
                    pink: "0 0 20px rgba(255, 0, 229, 0.5)",
                }
            },
            boxShadow: {
                'neon-cyan': '0 0 15px rgba(0, 242, 254, 0.4)',
                'neon-purple': '0 0 15px rgba(112, 0, 255, 0.4)',
                'neon-pink': '0 0 15px rgba(255, 0, 229, 0.4)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow-pulse': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(0, 242, 254, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 242, 254, 0.6)' },
                }
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

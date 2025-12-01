/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        secondary: "#8B5CF6",
        accent: "#EC4899",
        surface: "#FFFFFF",
        background: "#F8FAFC",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'progress': 'progress 2s ease-out',
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 1s ease-in-out',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' }
        },
        'pulse-border': {
          '0%, 100%': { borderColor: '#6366F1', transform: 'scale(1)' },
          '50%': { borderColor: '#EC4899', transform: 'scale(1.02)' }
        },
        'bounce-gentle': {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        }
      }
    },
  },
  plugins: [],
}
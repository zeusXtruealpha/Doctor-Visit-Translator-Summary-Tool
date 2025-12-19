/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
        }
      },
      fontSize: {
        'elderly': '1.125rem', // 18px for better readability
        'elderly-lg': '1.25rem', // 20px
      },
      spacing: {
        'elderly': '1.5rem', // Extra spacing for elderly users
      }
    },
  },
  plugins: [],
}
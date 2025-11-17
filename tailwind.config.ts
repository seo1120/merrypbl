import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F2FD9D',
        gray500: '#303030',
        gray: {
          ...colors.gray,
          900: '#303030',
        },
      },
      borderRadius: {
        DEFAULT: '30px',
      },
      fontFamily: {
        sans: ['Pretendard', 'puntino', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        DEFAULT: '600', // Semibold
      },
    },
  },
  plugins: [],
}
export default config


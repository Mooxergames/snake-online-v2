import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: '#06070A',
          elevated: '#0C0E14',
          card: '#10131C',
          subtle: '#161A26',
          deep: '#03040A',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.14)',
          glow: 'rgba(255,149,0,0.35)',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#A6ADBB',
          // Bumped from #6B7280 (~4.47:1) to pass WCAG AA 4.5:1 on #06070A.
          tertiary: '#8A93A3',
          // Reserved for explicitly-disabled or low-emphasis surface decorations only.
          // Does NOT pass 4.5:1; never use for body copy. Lint-flag if it appears as text.
          muted: '#4B5263',
        },
        brand: {
          50: '#FFF8E6',
          100: '#FFECB3',
          200: '#FFD980',
          300: '#FFC54D',
          400: '#FFAE1F',
          500: '#FF9500',
          600: '#E07A00',
          700: '#B35E00',
          800: '#7A4000',
          900: '#3D2000',
        },
        magenta: {
          300: '#FF7AB0',
          400: '#FF5599',
          500: '#FF3B8A',
          600: '#E61F70',
        },
        purple: {
          400: '#B57AFF',
          500: '#A455FF',
          600: '#8B33E6',
        },
        venom: {
          400: '#5BFF8A',
          500: '#22E060',
          600: '#13B146',
        },
        neon: {
          pink: '#FF3B8A',
          cyan: '#00E5FF',
          purple: '#A455FF',
          lime: '#A5FF3B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-xl': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3.25rem)', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 50% 0%, rgba(255,149,0,0.18), transparent 60%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        'venom-gradient': 'linear-gradient(135deg, #FF9500 0%, #FF3B8A 50%, #A455FF 100%)',
        'mesh-aurora':
          'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(255,149,0,0.35), transparent 60%), radial-gradient(ellipse 55% 50% at 75% 20%, rgba(255,59,138,0.32), transparent 60%), radial-gradient(ellipse 55% 50% at 50% 80%, rgba(164,85,255,0.28), transparent 60%)',
        'conic-shimmer':
          'conic-gradient(from 0deg at 50% 50%, rgba(255,149,0,0) 0%, rgba(255,149,0,0.4) 25%, rgba(255,59,138,0.4) 50%, rgba(164,85,255,0.4) 75%, rgba(255,149,0,0) 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'shimmer': 'shimmer 2.4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'marquee': 'marquee 40s linear infinite',
        'marquee-slow': 'marquee 80s linear infinite',
        'spin-slow': 'spin 14s linear infinite',
        'gradient-shift': 'gradientShift 12s ease-in-out infinite',
        'tilt': 'tilt 10s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,149,0,0.5)' },
          '50%': { boxShadow: '0 0 40px 8px rgba(255,149,0,0.15)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(0.6deg)' },
          '75%': { transform: 'rotate(-0.6deg)' },
        },
      },
      boxShadow: {
        'glow-brand': '0 0 60px -10px rgba(255,149,0,0.6)',
        'glow-magenta': '0 0 60px -10px rgba(255,59,138,0.6)',
        'glow-purple': '0 0 60px -10px rgba(164,85,255,0.6)',
        'card-lifted': '0 24px 60px -24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;

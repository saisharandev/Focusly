/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base':        '#09090B',
        'bg-surface':     '#18181B',
        'bg-card':        '#27272A',
        'accent-teal':    '#14B8A6',
        'accent-cyan':    '#7df9ff',
        'accent-purple':  '#A855F7',
        'accent-amber':   '#F59E0B',
        'accent-red':     '#EF4444',
        'text-primary':   '#FAFAFA',
        'text-secondary': '#A1A1AA',
        'text-muted':     '#71717A',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'float-slow':   'float 8s ease-in-out infinite',
        'float-med':    'float 6s ease-in-out infinite',
        'float-fast':   'float 4s ease-in-out infinite',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%':      { transform: 'translateY(-30px) scale(1.05)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}


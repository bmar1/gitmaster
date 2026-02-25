/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface:     '#0e0e14',
        'surface-1': '#161620',
        'surface-2': '#1c1c28',
        'surface-alt':'#22222e',
        border:      '#2a2a38',
        'border-hi': '#3a3a4a',

        primary:     '#e8e0d4',
        secondary:   '#b0a898',
        muted:       '#706860',

        accent:      '#e07050',
        'accent-dim':'#c45d3e',
        'accent-glow':'rgba(224, 112, 80, 0.15)',
        ochre:       '#d4a020',
        'ochre-dim': '#b8860b',
        sage:        '#7daa84',
        forest:      '#2e6b45',
        mist:        '#99aa9e',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', '"Crimson Text"', 'Georgia', 'serif'],
        code: ['"Source Code Pro"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      animation: {
        'rise': 'rise 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        'rise-delay-1': 'rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
        'rise-delay-2': 'rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both',
        'rise-delay-3': 'rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both',
        'rise-delay-4': 'rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both',
        'gentle-fade': 'gentleFade 0.5s ease-out both',
        'expand': 'expand 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gentleFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        expand: {
          '0%': { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '2000px' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.4), 0 16px 48px rgba(0, 0, 0, 0.3)',
        'glow-accent': '0 0 20px rgba(224, 112, 80, 0.15)',
      },
    },
  },
  plugins: [],
}

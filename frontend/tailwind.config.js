/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:    '#faf6f0',
        parchment:'#f0ebe2',
        linen:    '#e8e0d4',
        walnut:   '#2c1810',
        espresso: '#1a0f0a',
        bark:     '#4a3728',
        sienna:   '#c45d3e',
        rust:     '#a0432e',
        ochre:    '#b8860b',
        forest:   '#1a3a2a',
        sage:     '#6b8f71',
        mist:     '#8a9a8e',
        ink:      '#2d2926',
        faded:    '#7a7067',
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
      },
      boxShadow: {
        'card': '0 1px 3px rgba(44, 24, 16, 0.06), 0 4px 12px rgba(44, 24, 16, 0.04)',
        'card-hover': '0 4px 12px rgba(44, 24, 16, 0.1), 0 8px 24px rgba(44, 24, 16, 0.06)',
        'elevated': '0 8px 24px rgba(44, 24, 16, 0.08), 0 16px 48px rgba(44, 24, 16, 0.05)',
      },
    },
  },
  plugins: [],
}

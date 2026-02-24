/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00ffff',
        secondary: '#00ff88',
        dark: '#0a0e27',
        darker: '#050810',
        accent: '#ff006e',
        'code-bg': '#1a1f3a',
        'border-glow': '#00ffff40',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'Consolas', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #00ffff40, 0 0 10px #00ffff20',
          },
          '100%': { 
            boxShadow: '0 0 20px #00ffff60, 0 0 30px #00ffff30',
          }
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        slideDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px #00ffff20',
            borderColor: '#00ffff40'
          },
          '50%': { 
            boxShadow: '0 0 20px #00ffff40',
            borderColor: '#00ffff80'
          }
        }
      }
    },
  },
  plugins: [],
}

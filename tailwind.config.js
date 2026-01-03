/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Must match styles/colors.ts
        'cyber-black': '#050508',
        'cyber-dark': '#0a0a12',
        'cyber-card': '#12121f',
        'neon-cyan': '#00f3ff',
        'neon-purple': '#bd00ff',
        'neon-green': '#00ff9d',
        'neon-amber': '#ffaa00',
        
        // Component Colors
        'arduino': {
          DEFAULT: '#00979D',
          dark: '#005C5F',
          light: '#00B5B8',
        },
        'pcb': {
          DEFAULT: '#1D5C4B',
          dark: '#0F3D2F',
          light: '#2A7A64',
        },
        'breadboard': {
          white: '#F8F8F8',
          railBlue: '#3B82F6',
          railRed: '#EF4444',
        },
        'chip': {
          DEFAULT: '#1E1E1E',
          highlight: '#3D3D3D',
        },
        'copper': {
          DEFAULT: '#9A916C',
          highlight: '#C4B896',
        },
        'lcd': {
          green: '#9ACD32',
          dark: '#556B2F',
        },
        'sensor': {
          blue: '#2563EB',
          dark: '#1D4ED8',
          purple: '#6D28D9',
        },
      },
      backgroundImage: {
        'pattern-carbon': "url('/assets/ui/pattern-carbon.png')",
        'pattern-brushed': "url('/assets/ui/pattern-brushed.png')",
        'pattern-circuit': "url('/assets/ui/pattern-circuit.png')",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in forwards',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      }
    },
  },
  plugins: [],
}

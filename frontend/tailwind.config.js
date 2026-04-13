/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        /* Stadium at Night — admin pannel/stadium_apex/DESIGN.md + HTML mocks */
        admin: {
          canvas: '#0A0F1E',
          surface: '#1A1F2F',
          'surface-high': '#25293a',
          'surface-highest': '#2f3445',
          'surface-low': '#161b2b',
          well: '#090E1C',
          cyan: '#00E5FF',
          'cyan-deep': '#0066FF',
          orange: '#FF6B35',
          'secondary-container': '#b83900',
          gold: '#fec931',
          'on-surface': '#dee1f7',
          'on-surface-variant': '#bac9cc',
        },
      },
      fontFamily: {
        headline: ['Rajdhani', 'system-ui', 'sans-serif'],
        orbitron: ['Orbitron', 'system-ui', 'sans-serif'],
        label: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        admin: '0.5rem',
        'admin-lg': '0.75rem',
      },
      boxShadow: {
        'admin-sidebar': '20px 0 40px rgba(0, 229, 255, 0.03)',
        'admin-glow': '0 0 20px rgba(0, 229, 255, 0.4)',
        'admin-float': '0 20px 40px rgba(0, 229, 255, 0.08)',
      },
    },
  },
  plugins: [],
};

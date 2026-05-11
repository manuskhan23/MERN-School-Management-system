/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        app: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          surface2: 'var(--surface2)',
          border: 'var(--border)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          danger: 'var(--danger)',
          success: 'var(--success)',
          warning: 'var(--warning)',
        },
      },
      borderRadius: {
        app: 'var(--radius)',
        card: '14px',
      },
      maxWidth: {
        shell: '1200px',
      },
      backgroundImage: {
        'app-radial':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.22), transparent)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vector: {
          // Rebrand (EdTech / Skysmart-ish): clean cool background + strong blue primary
          bg:       '#F8FAFF',
          surface:  '#FFFFFF',
          ink:      '#0B1220',
          soft:     '#475569',
          blue:     '#1E40AF',
          'blue-lt':'#DBEAFE',
          teal:     '#3B82F6',
          orange:   '#F59E0B',
          green:    '#22C55E',
          purple:   '#6366F1',
          dark:     '#0B1220',
          // legacy aliases
          'deep-blue':     '#0B1220',
          'electric':      '#3B82F6',
          'electric-blue': '#3B82F6',
          'medium':        '#475569',
          'light':         '#F8FAFF',
          'light-gray':    '#E5E7EB',
        },
      },
      fontFamily: {
        sans:    ['Golos Text', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        accent:  ['Unbounded', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft:   '0 4px 24px rgba(61,90,254,.10)',
        medium: '0 8px 40px rgba(61,90,254,.16)',
        hard:   '0 16px 60px rgba(61,90,254,.22)',
      },
      animation: {
        'fade-up':  'fadeUp .6s ease-out both',
        'fade-in':  'fadeIn .4s ease-out both',
        'float':    'float 5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity:'0', transform:'translateY(20px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:  { from: { opacity:'0' }, to: { opacity:'1' } },
        float:   { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}

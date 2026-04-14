import type { Config } from 'tailwindcss'

export default <Config>{
  darkMode: 'class',
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.ts',
    './plugins/**/*.ts',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        sidebar: 'var(--color-sidebar)',
        border: 'var(--color-border)',
        foreground: 'var(--color-foreground)',
        'font-primary': 'var(--color-font-primary)',
        'font-secondary': 'var(--color-font-secondary)',
        'muted-foreground': 'var(--color-muted-foreground)',
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

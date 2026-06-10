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
        // Unified status scale (5 hues × 3 tiers) — see assets/css/main.css
        'st-green-vivid': 'var(--color-st-green-vivid)',
        'st-green-bg': 'var(--color-st-green-bg)',
        'st-green-text': 'var(--color-st-green-text)',
        'st-amber-vivid': 'var(--color-st-amber-vivid)',
        'st-amber-bg': 'var(--color-st-amber-bg)',
        'st-amber-text': 'var(--color-st-amber-text)',
        'st-red-vivid': 'var(--color-st-red-vivid)',
        'st-red-bg': 'var(--color-st-red-bg)',
        'st-red-text': 'var(--color-st-red-text)',
        'st-blue-vivid': 'var(--color-st-blue-vivid)',
        'st-blue-bg': 'var(--color-st-blue-bg)',
        'st-blue-text': 'var(--color-st-blue-text)',
        'st-neutral-bg': 'var(--color-st-neutral-bg)',
        'st-neutral-text': 'var(--color-st-neutral-text)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

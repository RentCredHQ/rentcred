// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
  ],

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
      appName: 'RentCred',
    },
  },

  app: {
    head: {
      title: 'RentCred — Tenant Verification Made Simple',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'RentCred simplifies tenant verification for landlords and agents across Nigeria.' },
        { name: 'theme-color', content: '#0D0D0D' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL@24,400,1' },
      ],
    },
  },

  routeRules: {
    // Marketing pages — SSR + cached for SEO
    '/': { prerender: true },
    '/for-landlords': { prerender: true },
    '/about': { prerender: true },
    '/contact': { ssr: true },
    '/privacy': { prerender: true },
    '/terms': { prerender: true },
    '/ndpr': { prerender: true },
    // Dashboard pages — SPA mode (no SSR)
    '/dashboard/**': { ssr: false },
    '/ops/**': { ssr: false },
    '/tenant/**': { ssr: false },
    '/field-agent/**': { ssr: false },
    '/settings/**': { ssr: false },
  },

  nitro: {
    preset: process.env.NITRO_PRESET || undefined,
  },
})

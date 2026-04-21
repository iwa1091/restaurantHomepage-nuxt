// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
          crossorigin: 'anonymous'
        }
      ]
    }
  },

  runtimeConfig: {
    // サーバーサイドのみ（クライアントに公開しない）
    resendApiKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    mailFromAddress: '',
    mailAdminAddress: '',
    // クライアントサイドに公開するキー
    public: {
      stripePublishableKey: ''
    }
  },

  nitro: {
    // Vercel 環境では自動的に vercel プリセットが使用される
    // Prisma クライアントをバンドルに含める（サーバーレス対応）
    externals: {
      inline: ['@prisma/client', '.prisma/client']
    }
  },

  routeRules: {
    // 静的コンテンツ：1時間キャッシュ（stale-while-revalidate）
    '/menu_price': { swr: 3600 },
    '/gallery': { swr: 3600 },
    // API はキャッシュしない
    '/api/**': { cache: false }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})

<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'ja'
  }
})

useSeoMeta({
  title: 'すし割烹 いづ浦',
  description: '千葉県九十九里の新鮮な魚介を使った本格すし割烹。ご予約・お問い合わせはこちらから。',
  ogTitle: 'すし割烹 いづ浦',
  ogDescription: '千葉県九十九里の新鮮な魚介を使った本格すし割烹。'
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'ご注文ありがとうございます | すし割烹 いづ浦' })
</script>

<template>
  <div style="max-width:560px; margin:4rem auto; padding:1rem; text-align:center;">
    <i
      class="fa-solid fa-circle-check"
      style="font-size:3.5rem; color:var(--color-accent); display:block; margin-bottom:1.25rem;"
    />
    <h1 style="font-family:var(--font-heading); font-size:1.6rem; margin-bottom:0.75rem; color:var(--color-primary);">
      ご注文ありがとうございます
    </h1>
    <p style="font-size:0.95rem; color:var(--color-gray); line-height:1.7; margin-bottom:2rem;">
      ご注文を承りました。<br>
      確認メールをお送りしましたのでご確認ください。<br>
      発送準備が整い次第、改めてご連絡いたします。
    </p>
    <NuxtLink to="/online-store" class="btn btn--big" style="max-width:220px; margin:0 auto; display:block;">
      ストアへ戻る
    </NuxtLink>
  </div>
</template>

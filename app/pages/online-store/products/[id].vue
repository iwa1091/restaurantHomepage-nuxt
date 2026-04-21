<script setup lang="ts">
import '~/assets/css/pages/store/public_show.css'

definePageMeta({ layout: 'default' })

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  isActive: boolean
}

const route = useRoute()
const id = route.params.id as string

const { data: product, error } = await useFetch<Product>(`/api/store/products/${id}`)

if (error.value) {
  throw createError({ statusCode: 404, message: '商品が見つかりません。', fatal: true })
}

useSeoMeta({
  title: `${product.value?.name ?? '商品詳細'} | すし割烹 いづ浦`
})

const buying = ref(false)
const buyError = ref('')

async function buyNow() {
  if (!product.value) return
  buying.value = true
  buyError.value = ''
  try {
    const res = await $fetch<{ url: string | null }>(`/api/store/checkout/${product.value.id}`, {
      method: 'POST'
    })
    if (res.url && import.meta.client) {
      window.location.href = res.url
    }
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    buyError.value = e.data?.message ?? '購入処理に失敗しました。しばらくしてから再度お試しください。'
  }
  finally {
    buying.value = false
  }
}
</script>

<template>
  <div style="padding: 1rem;">
    <div class="back-link-wrapper" style="max-width:61.25rem; margin:1.5rem auto 0;">
      <NuxtLink to="/online-store" class="back-link">
        <i class="fa-solid fa-angle-left" /> 商品一覧へ戻る
      </NuxtLink>
    </div>

    <div v-if="product" class="product-detail-container">
      <!-- 商品画像 -->
      <div class="product-image-area">
        <img
          v-if="product.imageUrl"
          :src="product.imageUrl"
          :alt="product.name"
          class="product-image"
        >
        <div
          v-else
          style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:var(--color-bg-soft); font-size:4rem; color:var(--color-accent-soft);"
        >
          <i class="fa-solid fa-box-open" />
        </div>
      </div>

      <!-- 商品情報 -->
      <div class="product-info-area">
        <h1 class="product-name">{{ product.name }}</h1>
        <p v-if="product.description" class="product-description">{{ product.description }}</p>

        <p class="product-price">
          ¥{{ product.price.toLocaleString() }}
          <span style="font-size:0.9rem; font-weight:400;">（税込）</span>
        </p>

        <p class="product-stock">
          <span v-if="product.stock > 0" class="text-green-600">
            <i class="fa-solid fa-circle-check" style="margin-right:0.3rem;" />在庫あり
          </span>
          <span v-else class="text-red-500">
            <i class="fa-solid fa-circle-xmark" style="margin-right:0.3rem;" />売り切れ
          </span>
        </p>

        <p v-if="buyError" style="font-size:0.9rem; color:var(--color-error); margin-top:0.5rem;">
          {{ buyError }}
        </p>

        <div class="buy-button-wrapper">
          <button
            v-if="product.stock > 0"
            class="buy-button"
            :class="{ 'button-disabled': buying }"
            :disabled="buying"
            @click="buyNow"
          >
            <i class="fa-solid fa-credit-card" style="margin-right:0.4rem;" />
            {{ buying ? '処理中...' : '購入する（クレジットカード決済）' }}
          </button>
          <div v-else class="buy-button button-disabled" style="cursor:not-allowed;">
            売り切れ
          </div>
        </div>

        <p style="font-size:0.82rem; color:var(--color-gray); margin-top:0.75rem; line-height:1.6;">
          ※ Stripeの安全な決済ページにリダイレクトします。<br>
          ※ 送料は注文確定後にご連絡いたします。
        </p>
      </div>
    </div>
  </div>
</template>

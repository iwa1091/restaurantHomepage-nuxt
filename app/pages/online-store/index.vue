<script setup lang="ts">
import '~/assets/css/pages/store/public_index.css'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'オンラインストア | すし割烹 いづ浦' })

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
}

const { data: products } = await useFetch<Product[]>('/api/store/products')
</script>

<template>
  <div class="store-page">
    <div class="store-container">
      <div class="store-header">
        <h1 class="store-title">オンラインストア</h1>
        <p class="store-subtitle">
          すし割烹 いづ浦のこだわり食材・贈答品を全国へお届けします。<br>
          ご自宅でいづ浦の味をお楽しみください。
        </p>
      </div>

      <section class="products-section">
        <div class="product-grid">
          <p v-if="!products || products.length === 0" class="no-products-message">
            現在、販売中の商品はございません。
          </p>

          <div
            v-for="product in products"
            :key="product.id"
            class="product-card"
          >
            <NuxtLink :to="`/online-store/products/${product.id}`" class="product-link">
              <div class="product-img-wrap">
                <img
                  v-if="product.imageUrl"
                  :src="product.imageUrl"
                  :alt="product.name"
                  class="product-image"
                  loading="lazy"
                >
                <div v-else class="product-img-placeholder">
                  <i class="fa-solid fa-box-open" />
                </div>
              </div>
              <div class="product-info">
                <p class="product-name">{{ product.name }}</p>
                <p v-if="product.description" class="product-description">{{ product.description }}</p>
                <p class="product-price">¥{{ product.price.toLocaleString() }}<span style="font-size:0.75rem; font-weight:400;">（税込）</span></p>
                <p v-if="product.stock <= 0" style="font-size:0.85rem; color:var(--color-error); font-weight:600;">売り切れ</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.product-img-wrap {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--color-bg-soft);
}

.product-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--color-accent-soft);
}
</style>

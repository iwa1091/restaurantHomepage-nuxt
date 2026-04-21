<script setup lang="ts">
import '~/assets/css/pages/menu_price/menu_price.css'

useSeoMeta({
  title: 'お品書き | すし割烹 いづ浦',
  description: '九十九里の新鮮な海の幸を中心に、旬の食材を活かした料理をご用意しております。コース料理・宴会プランのご予約も承ります。'
})

interface Service {
  id: number
  name: string
  description: string | null
  price: number | null
  isActive: boolean
}

interface Category {
  id: number
  name: string
  services: Service[]
}

const { data: categories } = await useFetch<Category[]>('/api/menu')
</script>

<template>
  <div class="menu-page-container">
    <div class="menu-inner">

      <!-- ページヘッダー -->
      <div class="menu-header">
        <h1 class="menu-title">お品書き</h1>
        <p class="menu-description">
          九十九里の新鮮な海の幸を中心に、旬の食材を活かした料理をご用意しております。<br>
          季節により内容が変わる場合がございます。
        </p>
      </div>

      <!-- カテゴリ一覧 -->
      <template v-if="categories && categories.length > 0">
        <section
          v-for="category in categories"
          :key="category.id"
          class="menu-section"
        >
          <h2 class="section-title">{{ category.name }}</h2>

          <div v-if="category.services.length > 0" class="menu-grid">
            <div
              v-for="service in category.services"
              :key="service.id"
              class="menu-card"
            >
              <!-- タイトル・説明 -->
              <div class="card-header">
                <h3 class="card-title">{{ service.name }}</h3>
                <p v-if="service.description" class="card-description" style="white-space: pre-line;">{{ service.description }}</p>
              </div>

              <!-- 価格と予約ボタン -->
              <div class="card-content">
                <div class="card-price-info">
                  <span class="card-price">¥{{ service.price?.toLocaleString() }}</span>
                </div>
                <NuxtLink
                  :to="`/reservation?service_id=${service.id}`"
                  class="btn-reserve"
                >
                  ご予約・お問い合わせ
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- データなし -->
      <p v-else class="no-service">
        現在、登録されているメニューはありません。
      </p>

      <!-- 注意事項 -->
      <section class="notes-section">
        <h3 class="notes-title">ご案内</h3>
        <div class="notes-grid">
          <div class="note-item">
            <p>・料金は税込価格です。</p>
            <p>・仕入れ状況により、メニュー内容・価格が変更になる場合がございます。</p>
            <p>・アレルギーをお持ちの方は、事前にご相談ください。</p>
          </div>
          <div class="note-item">
            <p>・宴会・法事のコース料理は要予約制です（最大30名様まで対応）。</p>
            <p>・営業時間外の日中の法事・宴会もご予約にて承ります。</p>
            <p>・ご不明点はお気軽にお電話（080-9704-9500）にてお問い合わせください。</p>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

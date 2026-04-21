<script setup lang="ts">
import '~/assets/css/pages/admin/dashboard.css'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useSeoMeta({ title: '管理者ダッシュボード | すし割烹 いづ浦' })

const { user } = useUserSession()

const adminFeatures = [
  { title: '予約管理', description: '全てのお客様の予約一覧を確認、管理します。', href: '/admin/reservations', color: 'bg-indigo' },
  { title: '営業時間設定', description: '営業日と時間帯を設定・更新します。', href: '/admin/timetable', color: 'bg-brown' },
  { title: '商品・メニュー管理', description: '提供する商品やメニューの情報を管理します。', href: '/admin/products', color: 'bg-pink' },
  { title: 'サービス管理', description: 'サービス一覧の作成・編集・削除を行います。', href: '/admin/services', color: 'bg-green' },
  { title: 'カテゴリ管理', description: 'サービスカテゴリの管理を行います。', href: '/admin/categories', color: 'bg-orange' },
  { title: '顧客管理', description: '登録されている顧客情報を管理します。', href: '/admin/users', color: 'bg-teal' },
  { title: '宴会管理', description: '宴会問い合わせとデポジット決済状況を管理します。', href: '/admin/banquet-inquiries', color: 'bg-red' }
]
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="oh-container">
      <div class="dashboard-card-area">
        <p class="welcome-message">
          ようこそ、<span class="user-name">{{ user?.name }}</span>様。
          <span class="message-subtext">実行したい管理タスクを選択してください。</span>
        </p>

        <div class="feature-grid">
          <NuxtLink
            v-for="feature in adminFeatures"
            :key="feature.title"
            :to="feature.href"
            class="feature-card"
          >
            <div class="feature-icon-wrapper">
              <i class="fa-solid fa-gear" style="font-size: 1.4rem; color: var(--color-accent);" />
            </div>
            <h3 class="card-title">{{ feature.title }}</h3>
            <p class="card-description">{{ feature.description }}</p>
            <span class="card-link">詳細管理へ &rarr;</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

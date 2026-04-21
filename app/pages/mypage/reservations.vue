<script setup lang="ts">
import '~/assets/css/pages/admin/mypage/index.css'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: '予約履歴 | すし割烹 いづ浦' })

interface Reservation {
  id: number
  date: string
  startTime: string
  endTime: string
  partySize: number | null
  seatType: string | null
  name: string
  status: string
  reservationCode: string | null
  notes: string | null
  cancelReason: string | null
}

const { data: reservations, refresh } = await useFetch<Reservation[]>('/api/mypage/reservations')

const weekdays = ['日', '月', '火', '水', '木', '金', '土']

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`
}

const seatLabels: Record<string, string> = {
  counter: 'カウンター席',
  table: 'テーブル席',
  tatami: 'お座敷'
}

const statusLabel: Record<string, string> = {
  pending: '予約確認中',
  confirmed: '確定',
  cancelled: 'キャンセル済み'
}

// キャンセル
const cancelingId = ref<number | null>(null)
const cancelError = ref('')
const confirmCancelId = ref<number | null>(null)

function requestCancel(id: number) {
  confirmCancelId.value = id
  cancelError.value = ''
}

function abortCancel() {
  confirmCancelId.value = null
  cancelError.value = ''
}

async function doCancel(id: number) {
  cancelingId.value = id
  cancelError.value = ''
  try {
    await $fetch(`/api/reservations/${id}/cancel`, { method: 'POST' })
    confirmCancelId.value = null
    await refresh()
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    cancelError.value = e.data?.message ?? 'キャンセルに失敗しました。'
  }
  finally {
    cancelingId.value = null
  }
}
</script>

<template>
  <div class="mypage-root">
    <!-- ヘッダー -->
    <div class="mypage-header">
      <div class="mypage-topbar">
        <NuxtLink to="/mypage" class="mypage-outline-button">
          <i class="fa-solid fa-angle-left" /> マイページへ
        </NuxtLink>
      </div>
      <h1 class="mypage-header-title" style="padding:0 1.5rem;">予約履歴</h1>
    </div>

    <div class="mypage-main">
      <section class="mypage-section-card">
        <p v-if="!reservations || reservations.length === 0" class="mypage-empty-text">
          予約履歴がありません。
        </p>

        <div v-for="r in reservations" :key="r.id" class="mypage-item-card">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.5rem; flex-wrap:wrap;">
            <div>
              <p class="mypage-item-title">{{ formatDate(r.date) }}</p>
              <p class="mypage-item-meta">
                {{ r.startTime }} 〜 {{ r.endTime }}
                <span v-if="r.partySize">／ {{ r.partySize }}名</span>
                <span v-if="r.seatType">／ {{ seatLabels[r.seatType] ?? r.seatType }}</span>
              </p>
              <p v-if="r.reservationCode" class="mypage-item-meta">
                予約コード：{{ r.reservationCode }}
              </p>
              <p v-if="r.notes" class="mypage-item-meta">
                備考：{{ r.notes }}
              </p>
              <p v-if="r.cancelReason" class="mypage-item-meta" style="color:var(--color-error);">
                キャンセル理由：{{ r.cancelReason }}
              </p>
            </div>
            <span class="res-status" :class="`res-status--${r.status}`">
              {{ statusLabel[r.status] ?? r.status }}
            </span>
          </div>

          <!-- キャンセル確認 -->
          <div v-if="confirmCancelId === r.id" style="margin-top:0.75rem;">
            <p style="font-size:0.88rem; margin-bottom:0.5rem;">本当にキャンセルしますか？</p>
            <p v-if="cancelError" style="font-size:0.85rem; color:var(--color-error); margin-bottom:0.4rem;">
              {{ cancelError }}
            </p>
            <div class="mypage-item-actions">
              <button
                class="mypage-danger-button"
                :disabled="cancelingId === r.id"
                @click="doCancel(r.id)"
              >
                {{ cancelingId === r.id ? '処理中...' : 'キャンセルする' }}
              </button>
              <button class="mypage-outline-button" @click="abortCancel">
                戻る
              </button>
            </div>
          </div>

          <div v-else-if="r.status === 'pending' || r.status === 'confirmed'" class="mypage-item-actions">
            <button
              style="font-size:0.85rem; color:var(--color-error); background:none; border:none; cursor:pointer; text-decoration:underline; padding:0;"
              @click="requestCancel(r.id)"
            >
              キャンセルする
            </button>
          </div>
        </div>

        <div class="mypage-section-actions" style="margin-top:1.25rem;">
          <NuxtLink to="/reservation" class="mypage-outline-button">
            <i class="fa-solid fa-plus" style="font-size:0.8rem;" />
            新しく予約する
          </NuxtLink>
        </div>
      </section>
    </div>

    <NuxtLink to="/mypage" class="mypage-back-fab">
      <i class="fa-solid fa-angle-left" />
      <span>マイページ</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.res-status {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

.res-status--pending {
  background: rgba(198, 163, 85, 0.15);
  color: #8a6d1e;
}

.res-status--confirmed {
  background: rgba(40, 120, 80, 0.12);
  color: #287850;
}

.res-status--cancelled {
  background: rgba(197, 61, 61, 0.1);
  color: #c53d3d;
}
</style>

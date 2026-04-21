<script setup lang="ts">
import '~/assets/css/pages/admin/mypage/index.css'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'マイページ | すし割烹 いづ浦' })

interface Reservation {
  id: number
  date: string
  startTime: string
  endTime: string
  partySize: number | null
  status: string
  reservationCode: string | null
}

const { user, clear } = useUserSession()
const router = useRouter()

const { data: allReservations } = await useFetch<Reservation[]>('/api/mypage/reservations')

const recentReservations = computed(() =>
  (allReservations.value ?? []).slice(0, 3)
)

const weekdays = ['日', '月', '火', '水', '木', '金', '土']

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`
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
    await refreshNuxtData()
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    cancelError.value = e.data?.message ?? 'キャンセルに失敗しました。'
  }
  finally {
    cancelingId.value = null
  }
}

// ログアウト
const logoutLoading = ref(false)

async function logout() {
  logoutLoading.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await clear()
    await router.push('/auth/login')
  }
  finally {
    logoutLoading.value = false
  }
}
</script>

<template>
  <div class="mypage-root">
    <!-- ヘッダー -->
    <div class="mypage-header">
      <h1 class="mypage-header-title">マイページ</h1>
      <p class="mypage-header-subtitle">ようこそ、{{ user?.name }} 様。</p>
    </div>

    <div class="mypage-main">
      <!-- ご予約セクション -->
      <section class="mypage-section-card">
        <div class="mypage-section-head">
          <h2 class="mypage-section-title">
            <i class="fa-solid fa-calendar-check" style="color:var(--color-accent); margin-right:0.45rem;" />
            ご予約
          </h2>
          <NuxtLink to="/mypage/reservations" class="mypage-inline-link mypage-inline-link--compact">
            すべて見る →
          </NuxtLink>
        </div>

        <p v-if="recentReservations.length === 0" class="mypage-empty-text">
          予約履歴がありません。
        </p>

        <div v-for="r in recentReservations" :key="r.id" class="mypage-item-card">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.5rem; flex-wrap:wrap;">
            <div>
              <p class="mypage-item-title">{{ formatDate(r.date) }}</p>
              <p class="mypage-item-meta">
                {{ r.startTime }} 〜 {{ r.endTime }}
                <span v-if="r.partySize">／ {{ r.partySize }}名</span>
              </p>
              <p v-if="r.reservationCode" class="mypage-item-meta">
                予約コード：{{ r.reservationCode }}
              </p>
            </div>
            <span
              class="res-status"
              :class="`res-status--${r.status}`"
            >{{ statusLabel[r.status] ?? r.status }}</span>
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

        <div class="mypage-section-actions">
          <NuxtLink to="/reservation" class="mypage-outline-button">
            <i class="fa-solid fa-plus" style="font-size:0.8rem;" />
            新しく予約する
          </NuxtLink>
        </div>
      </section>

      <!-- アカウント情報セクション -->
      <section class="mypage-section-card">
        <h2 class="mypage-section-title">
          <i class="fa-solid fa-user" style="color:var(--color-accent); margin-right:0.45rem;" />
          アカウント情報
        </h2>

        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          <div style="display:flex; gap:1rem; align-items:baseline;">
            <span style="font-size:0.85rem; color:rgba(0,0,0,0.5); min-width:6rem;">お名前</span>
            <span style="font-size:0.95rem;">{{ user?.name }}</span>
          </div>
          <div style="display:flex; gap:1rem; align-items:baseline;">
            <span style="font-size:0.85rem; color:rgba(0,0,0,0.5); min-width:6rem;">メールアドレス</span>
            <span style="font-size:0.95rem; word-break:break-all;">{{ user?.email }}</span>
          </div>
        </div>
      </section>

      <!-- オンラインストアセクション -->
      <section class="mypage-section-card">
        <h2 class="mypage-section-title">
          <i class="fa-solid fa-bag-shopping" style="color:var(--color-accent); margin-right:0.45rem;" />
          オンラインストア
        </h2>
        <p class="mypage-empty-text" style="margin-bottom:0.75rem;">
          いづ浦のこだわり食材・贈答品をご自宅へお届けします。
        </p>
        <div class="mypage-section-actions">
          <NuxtLink to="/online-store" class="mypage-outline-button">
            ストアを見る →
          </NuxtLink>
        </div>
      </section>

      <!-- ログアウト -->
      <section class="mypage-section-card">
        <button
          class="mypage-primary-button"
          style="background:var(--color-primary);"
          :disabled="logoutLoading"
          @click="logout"
        >
          <i class="fa-solid fa-right-from-bracket" style="margin-right:0.4rem;" />
          {{ logoutLoading ? 'ログアウト中...' : 'ログアウト' }}
        </button>
      </section>
    </div>

    <!-- ホームへ戻るFAB -->
    <NuxtLink to="/" class="mypage-home-fab">
      <i class="fa-solid fa-house" />
      <span>ホーム</span>
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

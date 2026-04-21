<script setup lang="ts">
import '~/assets/css/pages/admin/reservation-list.css'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: '予約管理 | すし割烹 いづ浦' })

type Reservation = {
  id: number
  date: string
  startTime: string
  endTime: string
  name: string
  partySize: number | null
  status: string
  user?: { id: number; name: string; email: string } | null
}

const statusFilter = ref('')

const { data: reservations, refresh } = await useFetch<Reservation[]>('/api/admin/reservations', {
  query: computed(() => statusFilter.value ? { status: statusFilter.value } : {}),
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

function setFilter(s: string) {
  statusFilter.value = s
  refresh()
}

const statusLabels: Record<string, string> = {
  pending: '確認中',
  confirmed: '確定',
  cancelled: 'キャンセル',
}
</script>

<template>
  <div class="admin-reservation-page">
    <h1 class="admin-reservation-title">予約管理</h1>

    <div class="admin-reservation-actions">
      <button
        class="admin-reservation-button"
        :class="{ 'admin-reservation-button--edit': statusFilter === '' }"
        @click="setFilter('')"
      >全て</button>
      <button
        class="admin-reservation-button"
        :class="{ 'admin-reservation-button--edit': statusFilter === 'pending' }"
        @click="setFilter('pending')"
      >確認中</button>
      <button
        class="admin-reservation-button"
        :class="{ 'admin-reservation-button--edit': statusFilter === 'confirmed' }"
        @click="setFilter('confirmed')"
      >確定</button>
      <button
        class="admin-reservation-button"
        :class="{ 'admin-reservation-button--edit': statusFilter === 'cancelled' }"
        @click="setFilter('cancelled')"
      >キャンセル</button>
    </div>

    <div class="admin-reservation-table-wrapper">
      <table class="admin-reservation-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>日付</th>
            <th>時間</th>
            <th>名前</th>
            <th>人数</th>
            <th>ステータス</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in reservations"
            :key="r.id"
            class="admin-reservation-row"
          >
            <td>{{ r.id }}</td>
            <td>{{ formatDate(r.date) }}</td>
            <td>{{ r.startTime }}〜{{ r.endTime }}</td>
            <td>{{ r.name }}</td>
            <td>{{ r.partySize ?? '—' }}</td>
            <td>
              <span class="admin-reservation-status">
                {{ statusLabels[r.status] ?? r.status }}
              </span>
            </td>
            <td>
              <NuxtLink
                :to="`/admin/reservations/${r.id}/edit`"
                class="admin-reservation-button admin-reservation-button--edit"
              >編集</NuxtLink>
            </td>
          </tr>
          <tr v-if="!reservations || reservations.length === 0">
            <td colspan="7" style="text-align:center;">予約がありません。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

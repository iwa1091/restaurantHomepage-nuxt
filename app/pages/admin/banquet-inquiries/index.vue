<script setup lang="ts">
import '~/assets/css/pages/admin/reservation-list.css'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: '宴会問い合わせ管理 | すし割烹 いづ浦' })

type BanquetInquiry = {
  id: number
  name: string
  email: string
  date: string | null
  partySize: number | null
  status: string
}

const { data: inquiries } = await useFetch<BanquetInquiry[]>('/api/admin/banquet')

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

const statusLabels: Record<string, string> = {
  pending: '未対応',
  contacted: '連絡済み',
  completed: '完了',
  cancelled: 'キャンセル',
}
</script>

<template>
  <div class="admin-reservation-page">
    <h1 class="admin-reservation-title">宴会問い合わせ管理</h1>

    <div class="admin-reservation-table-wrapper">
      <table class="admin-reservation-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名前</th>
            <th>メール</th>
            <th>日程</th>
            <th>人数</th>
            <th>ステータス</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="b in inquiries"
            :key="b.id"
            class="admin-reservation-row"
          >
            <td>{{ b.id }}</td>
            <td>{{ b.name }}</td>
            <td>{{ b.email }}</td>
            <td>{{ formatDate(b.date) }}</td>
            <td>{{ b.partySize ?? '—' }}</td>
            <td>
              <span class="admin-reservation-status">
                {{ statusLabels[b.status] ?? b.status }}
              </span>
            </td>
            <td>
              <NuxtLink
                :to="`/admin/banquet-inquiries/${b.id}`"
                class="admin-reservation-button admin-reservation-button--edit"
              >詳細</NuxtLink>
            </td>
          </tr>
          <tr v-if="!inquiries || inquiries.length === 0">
            <td colspan="7" style="text-align:center;">問い合わせがありません。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

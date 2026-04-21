<script setup lang="ts">
import '~/assets/css/pages/admin/user-list.css'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: '顧客管理 | すし割烹 いづ浦' })

type User = {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

const { data: users } = await useFetch<User[]>('/api/admin/users')

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

const roleLabels: Record<string, string> = {
  admin: '管理者',
  user: '一般ユーザー',
}
</script>

<template>
  <div class="admin-page-container">
    <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
      <h1 class="page-title">顧客管理</h1>
      <NuxtLink to="/admin" class="back-button" style="color:#555;text-decoration:none;font-size:0.9rem;">← 管理画面に戻る</NuxtLink>
    </div>

    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">ID</th>
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">名前</th>
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">メール</th>
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">役割</th>
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">登録日</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ u.id }}</td>
            <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ u.name }}</td>
            <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ u.email }}</td>
            <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ roleLabels[u.role] ?? u.role }}</td>
            <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ formatDate(u.createdAt) }}</td>
          </tr>
          <tr v-if="!users || users.length === 0">
            <td colspan="5" style="text-align:center;padding:1rem;">ユーザーがいません。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

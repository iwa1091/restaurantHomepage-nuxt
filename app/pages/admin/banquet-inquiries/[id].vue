<script setup lang="ts">
import '~/assets/css/pages/admin/reservation-edit.css'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: '宴会問い合わせ詳細 | すし割烹 いづ浦' })

const route = useRoute()
const id = route.params.id as string

type BanquetInquiry = {
  id: number
  name: string
  email: string
  phone: string | null
  date: string | null
  partySize: number | null
  budget: string | null
  message: string | null
  status: string
  stripePaymentIntentId: string | null
}

const { data: inquiry, error } = await useFetch<BanquetInquiry>(`/api/admin/banquet/${id}`)

const statusValue = ref(inquiry.value?.status ?? 'pending')

watch(inquiry, (val) => {
  if (val) statusValue.value = val.status
})

const saveError = ref('')
const saveSuccess = ref(false)
const saving = ref(false)

async function saveStatus() {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  try {
    await $fetch(`/api/admin/banquet/${id}`, {
      method: 'PUT',
      body: { status: statusValue.value },
    })
    saveSuccess.value = true
  }
  catch (e: any) {
    saveError.value = e?.data?.message ?? '保存に失敗しました。'
  }
  finally {
    saving.value = false
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div class="admin-reservation-edit-page">
    <div class="admin-reservation-edit-back">
      <NuxtLink to="/admin/banquet-inquiries" class="admin-reservation-edit-back-link">← 宴会問い合わせ一覧に戻る</NuxtLink>
    </div>

    <div v-if="error" style="color:red;">問い合わせの取得に失敗しました。</div>

    <div v-else-if="inquiry" class="admin-reservation-edit-card">
      <h1 class="admin-reservation-edit-title">宴会問い合わせ詳細 #{{ inquiry.id }}</h1>

      <section style="margin-bottom:1.5rem;">
        <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
          <tbody>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;width:160px;">名前</th>
              <td style="padding:0.4rem 0;">{{ inquiry.name }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">メール</th>
              <td style="padding:0.4rem 0;">{{ inquiry.email }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">電話番号</th>
              <td style="padding:0.4rem 0;">{{ inquiry.phone ?? '—' }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">希望日程</th>
              <td style="padding:0.4rem 0;">{{ formatDate(inquiry.date) }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">人数</th>
              <td style="padding:0.4rem 0;">{{ inquiry.partySize ?? '—' }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">予算</th>
              <td style="padding:0.4rem 0;">{{ inquiry.budget ?? '—' }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">メッセージ</th>
              <td style="padding:0.4rem 0;white-space:pre-wrap;">{{ inquiry.message ?? '—' }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">決済ID</th>
              <td style="padding:0.4rem 0;">{{ inquiry.stripePaymentIntentId ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 style="font-size:1rem;margin-bottom:0.75rem;">ステータス更新</h2>

        <div style="margin-bottom:1rem;">
          <select v-model="statusValue" style="padding:0.5rem;border:1px solid #ccc;border-radius:4px;margin-right:0.75rem;">
            <option value="pending">未対応</option>
            <option value="contacted">連絡済み</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
          <button
            @click="saveStatus"
            :disabled="saving"
            style="padding:0.5rem 1.25rem;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;"
          >{{ saving ? '保存中...' : '保存' }}</button>
        </div>

        <p v-if="saveError" style="color:red;">{{ saveError }}</p>
        <p v-if="saveSuccess" style="color:green;">保存しました。</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/pages/admin/reservation-edit.css'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: '予約編集 | すし割烹 いづ浦' })

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

type Reservation = {
  id: number
  date: string
  startTime: string
  endTime: string
  name: string
  email: string
  phone: string | null
  partySize: number | null
  seatType: string | null
  reservationCode: string | null
  status: string
  notes: string | null
  cancelReason: string | null
  user?: { id: number; name: string; email: string } | null
}

const { data: reservation, error } = await useFetch<Reservation>(`/api/admin/reservations/${id}`)

const form = reactive({
  status: reservation.value?.status ?? 'pending',
  notes: reservation.value?.notes ?? '',
  cancelReason: reservation.value?.cancelReason ?? '',
})

watch(reservation, (val) => {
  if (val) {
    form.status = val.status
    form.notes = val.notes ?? ''
    form.cancelReason = val.cancelReason ?? ''
  }
})

const saveError = ref('')
const saveSuccess = ref(false)

async function save() {
  saveError.value = ''
  saveSuccess.value = false
  try {
    await $fetch(`/api/admin/reservations/${id}`, {
      method: 'PUT',
      body: { status: form.status, notes: form.notes, cancelReason: form.cancelReason },
    })
    saveSuccess.value = true
  }
  catch (e: any) {
    saveError.value = e?.data?.message ?? '保存に失敗しました。'
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div class="admin-reservation-edit-page">
    <div class="admin-reservation-edit-back">
      <NuxtLink to="/admin/reservations" class="admin-reservation-edit-back-link">← 予約一覧に戻る</NuxtLink>
    </div>

    <div v-if="error" style="color:red;">予約の取得に失敗しました。</div>

    <div v-else-if="reservation" class="admin-reservation-edit-card">
      <h1 class="admin-reservation-edit-title">予約編集 #{{ reservation.id }}</h1>

      <section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1rem;margin-bottom:0.75rem;">予約情報（読み取り専用）</h2>
        <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
          <tbody>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;width:140px;">日付</th>
              <td style="padding:0.4rem 0;">{{ formatDate(reservation.date) }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">時間</th>
              <td style="padding:0.4rem 0;">{{ reservation.startTime }}〜{{ reservation.endTime }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">名前</th>
              <td style="padding:0.4rem 0;">{{ reservation.name }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">メール</th>
              <td style="padding:0.4rem 0;">{{ reservation.email }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">電話番号</th>
              <td style="padding:0.4rem 0;">{{ reservation.phone ?? '—' }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">人数</th>
              <td style="padding:0.4rem 0;">{{ reservation.partySize ?? '—' }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">席タイプ</th>
              <td style="padding:0.4rem 0;">{{ reservation.seatType ?? '—' }}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:0.4rem 0.75rem 0.4rem 0;">予約コード</th>
              <td style="padding:0.4rem 0;">{{ reservation.reservationCode ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 style="font-size:1rem;margin-bottom:0.75rem;">編集</h2>

        <div style="margin-bottom:1rem;">
          <label style="display:block;font-weight:bold;margin-bottom:0.3rem;">ステータス</label>
          <select v-model="form.status" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;">
            <option value="pending">確認中</option>
            <option value="confirmed">確定</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>

        <div style="margin-bottom:1rem;">
          <label style="display:block;font-weight:bold;margin-bottom:0.3rem;">メモ</label>
          <textarea v-model="form.notes" rows="3" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;resize:vertical;" />
        </div>

        <div style="margin-bottom:1rem;">
          <label style="display:block;font-weight:bold;margin-bottom:0.3rem;">キャンセル理由</label>
          <input v-model="form.cancelReason" type="text" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;" />
        </div>

        <p v-if="saveError" style="color:red;margin-bottom:0.5rem;">{{ saveError }}</p>
        <p v-if="saveSuccess" style="color:green;margin-bottom:0.5rem;">保存しました。</p>

        <button @click="save" style="padding:0.6rem 1.5rem;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;">
          保存
        </button>
      </section>
    </div>
  </div>
</template>

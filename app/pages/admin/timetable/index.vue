<script setup lang="ts">
import '~/assets/css/pages/admin/timetable.css'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: '営業時間設定 | すし割烹 いづ浦' })

const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']

type Schedule = {
  id: number
  dayOfWeek: number | null
  date: string | null
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
}

const { data: schedules } = await useFetch<Schedule[]>('/api/admin/timetable')

type RowState = {
  dayOfWeek: number
  isOpen: boolean
  openTime: string
  closeTime: string
  saving: boolean
  saved: boolean
  error: string
}

const rows = ref<RowState[]>(
  dayNames.map((_, i) => {
    const existing = schedules.value?.find(s => s.dayOfWeek === i)
    return {
      dayOfWeek: i,
      isOpen: existing?.isOpen ?? true,
      openTime: existing?.openTime ?? '11:30',
      closeTime: existing?.closeTime ?? '22:00',
      saving: false,
      saved: false,
      error: '',
    }
  }),
)

async function saveRow(row: RowState) {
  row.saving = true
  row.saved = false
  row.error = ''
  try {
    await $fetch('/api/admin/timetable', {
      method: 'POST',
      body: {
        dayOfWeek: row.dayOfWeek,
        isOpen: row.isOpen,
        openTime: row.openTime || null,
        closeTime: row.closeTime || null,
      },
    })
    row.saved = true
  }
  catch (e: any) {
    row.error = e?.data?.message ?? '保存に失敗しました。'
  }
  finally {
    row.saving = false
  }
}
</script>

<template>
  <div class="admin-timetable-page">
    <div class="admin-timetable-topbar">
      <div class="admin-timetable-back">
        <NuxtLink to="/admin" class="admin-timetable-back-link">← 管理画面に戻る</NuxtLink>
      </div>
      <h1 style="font-size:1.4rem;font-weight:bold;">営業時間設定</h1>
    </div>

    <div class="admin-timetable-card">
      <div class="timetable-form-grid">
        <div
          v-for="row in rows"
          :key="row.dayOfWeek"
          style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;margin-bottom:1rem;"
        >
          <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
            <span style="font-weight:bold;min-width:80px;">{{ dayNames[row.dayOfWeek] }}</span>

            <div class="timetable-form-field">
              <label class="timetable-form-label">
                <input type="checkbox" v-model="row.isOpen" />
                営業
              </label>
            </div>

            <div class="timetable-form-field" v-if="row.isOpen">
              <label class="timetable-form-label">開始</label>
              <input
                v-model="row.openTime"
                type="time"
                class="timetable-form-input"
              />
            </div>

            <div class="timetable-form-field" v-if="row.isOpen">
              <label class="timetable-form-label">終了</label>
              <input
                v-model="row.closeTime"
                type="time"
                class="timetable-form-input"
              />
            </div>

            <button
              class="admin-timetable-btn admin-timetable-btn--primary"
              :disabled="row.saving"
              @click="saveRow(row)"
            >
              {{ row.saving ? '保存中...' : '保存' }}
            </button>

            <span v-if="row.saved" style="color:green;font-size:0.85rem;">保存しました</span>
            <span v-if="row.error" style="color:red;font-size:0.85rem;">{{ row.error }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/pages/reservation/reservation-form.css'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'ご予約 | すし割烹 いづ浦' })

interface TimeSlot { start: string; end: string }
interface ScheduleDay { date: string; isOpen: boolean; openTime: string | null; closeTime: string | null }

const { user } = useUserSession()

const TOTAL_STEPS = 7
const stepLabels = ['日付', '人数', '時間帯', '席タイプ', 'お客様情報', 'ご要望', '確認']
const step = ref(1)

const form = reactive({
  date: '',
  partySize: 2,
  startTime: '',
  endTime: '',
  seatType: '',
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
  phone: '',
  notes: ''
})

// ── Calendar ──────────────────────────────────────────────────────────────
const today = new Date()
const calYear = ref(today.getFullYear())
const calMonth = ref(today.getMonth())
const weekdays = ['日', '月', '火', '水', '木', '金', '土']
const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const { data: schedule } = await useFetch<ScheduleDay[]>('/api/business-hours/weekly')

function pad(n: number) { return String(n).padStart(2, '0') }
function toDateStr(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}` }
const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

function isClosedDay(dateStr: string) {
  const entry = schedule.value?.find(s => s.date === dateStr)
  return entry ? !entry.isOpen : true
}

const calDays = computed(() => {
  const firstDay = new Date(calYear.value, calMonth.value, 1).getDay()
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const cells: (null | { day: number; date: string; isPast: boolean; isClosed: boolean; isToday: boolean; isSelected: boolean })[] = []

  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(calYear.value, calMonth.value, d)
    cells.push({
      day: d,
      date: dateStr,
      isPast: dateStr < todayStr,
      isClosed: isClosedDay(dateStr),
      isToday: dateStr === todayStr,
      isSelected: dateStr === form.date
    })
  }
  return cells
})

const canPrevMonth = computed(() =>
  calYear.value > today.getFullYear() ||
  (calYear.value === today.getFullYear() && calMonth.value > today.getMonth())
)

const canNextMonth = computed(() => {
  const limit = new Date(today.getFullYear(), today.getMonth() + 3, 1)
  const next = new Date(calYear.value, calMonth.value + 1, 1)
  return next < limit
})

function prevMonth() {
  if (!canPrevMonth.value) return
  calMonth.value === 0 ? (calYear.value--, calMonth.value = 11) : calMonth.value--
}

function nextMonth() {
  if (!canNextMonth.value) return
  calMonth.value === 11 ? (calYear.value++, calMonth.value = 0) : calMonth.value++
}

function selectDate(dateStr: string) {
  form.date = dateStr
  form.startTime = ''
  form.endTime = ''
}

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return ''
  const parts = dateStr.split('-').map(Number)
  const y = parts[0] ?? 0
  const m = parts[1] ?? 0
  const d = parts[2] ?? 0
  const date = new Date(y, m - 1, d)
  return `${y}年${m}月${d}日（${weekdays[date.getDay()]}）`
}

// ── Time slots ────────────────────────────────────────────────────────────
const slots = ref<TimeSlot[]>([])
const loadingSlots = ref(false)

async function fetchSlots() {
  loadingSlots.value = true
  slots.value = []
  try {
    const data = await $fetch<{ available_slots: TimeSlot[] }>(
      `/api/reservations/check?date=${form.date}&party_size=${form.partySize}`
    )
    slots.value = data.available_slots
  }
  catch {
    slots.value = []
  }
  finally {
    loadingSlots.value = false
  }
}

// ── Seat types ────────────────────────────────────────────────────────────
const seatTypes = [
  { value: 'counter', label: 'カウンター席' },
  { value: 'table', label: 'テーブル席' },
  { value: 'tatami', label: 'お座敷' }
]

// ── Step navigation ───────────────────────────────────────────────────────
const stepError = ref('')
const submitting = ref(false)
const submitError = ref('')
const reservationCode = ref('')
const submitted = ref(false)

async function goNext() {
  stepError.value = ''

  if (step.value === 1 && !form.date) {
    stepError.value = '日付を選択してください。'
    return
  }
  if (step.value === 2 && (form.partySize < 1 || form.partySize > 9)) {
    stepError.value = '人数を1〜9名の範囲で選択してください。'
    return
  }
  if (step.value === 3 && !form.startTime) {
    stepError.value = '時間帯を選択してください。'
    return
  }
  if (step.value === 4 && !form.seatType) {
    stepError.value = '席タイプを選択してください。'
    return
  }
  if (step.value === 5) {
    if (!form.name || !form.email) {
      stepError.value = 'お名前とメールアドレスは必須です。'
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      stepError.value = 'メールアドレスの形式が正しくありません。'
      return
    }
  }

  if (step.value === 2) {
    await fetchSlots()
  }

  step.value++
}

function goPrev() {
  stepError.value = ''
  step.value--
}

async function submit() {
  submitting.value = true
  submitError.value = ''
  try {
    const res = await $fetch<{ reservationCode: string }>('/api/reservations', {
      method: 'POST',
      body: {
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        partySize: form.partySize,
        seatType: form.seatType,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        notes: form.notes || null
      }
    })
    reservationCode.value = res.reservationCode
    submitted.value = true
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    submitError.value = e.data?.message ?? '予約の送信に失敗しました。もう一度お試しください。'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="reservation-main">
    <!-- 完了画面 -->
    <div v-if="submitted" class="reservation-form-card" style="text-align:center; padding:2.5rem 1.75rem;">
      <i class="fa-solid fa-circle-check" style="font-size:3rem; color:var(--color-accent); display:block; margin-bottom:1rem;" />
      <h2 class="reservation-title">ご予約を承りました</h2>
      <p class="reservation-subtitle">
        予約コード：<strong>{{ reservationCode }}</strong><br>
        ご入力いただいたメールアドレスに確認メールをお送りします。
      </p>
      <NuxtLink to="/" class="btn btn--big" style="max-width:200px; margin:1.5rem auto 0; display:block;">
        トップへ戻る
      </NuxtLink>
    </div>

    <!-- フォーム -->
    <template v-else>
      <div class="reservation-back">
        <NuxtLink to="/" class="reservation-back-button">
          <i class="fa-solid fa-angle-left" /> トップへ
        </NuxtLink>
      </div>

      <h1 class="reservation-title">ご予約</h1>
      <p class="reservation-subtitle">
        10名以上のご予約は
        <NuxtLink to="/banquet-inquiry" style="color:var(--color-accent);">宴会問い合わせ</NuxtLink>
        からお願いします。
      </p>

      <!-- ステップ進捗 -->
      <div class="step-progress-wrap">
        <div class="step-progress-bar-bg">
          <div
            class="step-progress-bar-fill"
            :style="{ width: ((step - 1) / (TOTAL_STEPS - 1) * 100) + '%' }"
          />
        </div>
        <p class="step-progress-label">
          {{ stepLabels[step - 1] }}（{{ step }} / {{ TOTAL_STEPS }}）
        </p>
      </div>

      <div class="reservation-form-card">
        <!-- エラー -->
        <p v-if="stepError" class="reservation-message reservation-message--error">
          {{ stepError }}
        </p>

        <!-- Step 1: 日付 -->
        <div v-if="step === 1">
          <p class="reservation-label">ご希望の日付を選択してください</p>
          <div class="reservation-calendar-wrapper">
            <div class="reservation-calendar">
              <div class="cal-nav">
                <button class="cal-nav-btn" :disabled="!canPrevMonth" @click="prevMonth">‹</button>
                <span class="cal-nav-title">{{ calYear }}年 {{ monthNames[calMonth] }}</span>
                <button class="cal-nav-btn" :disabled="!canNextMonth" @click="nextMonth">›</button>
              </div>
              <div class="cal-grid">
                <div v-for="w in weekdays" :key="w" class="cal-weekday">{{ w }}</div>
                <template v-for="(cell, i) in calDays" :key="i">
                  <div v-if="cell === null" class="cal-empty" />
                  <button
                    v-else
                    class="cal-tile"
                    :class="{
                      'cal-tile--today': cell.isToday,
                      'cal-tile--selected': cell.isSelected,
                      'cal-tile--disabled': cell.isPast || cell.isClosed
                    }"
                    :disabled="cell.isPast || cell.isClosed"
                    @click="selectDate(cell.date)"
                  >
                    {{ cell.day }}
                  </button>
                </template>
              </div>
            </div>
          </div>
          <p v-if="form.date" class="reservation-date-text">
            選択中：{{ formatDateDisplay(form.date) }}
          </p>
        </div>

        <!-- Step 2: 人数 -->
        <div v-else-if="step === 2">
          <p class="reservation-label">人数を選択してください</p>
          <div class="party-size-grid">
            <button
              v-for="n in 9"
              :key="n"
              class="party-size-btn"
              :class="{ 'party-size-btn--selected': form.partySize === n }"
              @click="form.partySize = n"
            >
              {{ n }}名
            </button>
          </div>
          <div class="reservation-banquet-box">
            <p style="margin:0; font-size:0.9rem;">
              10名以上の場合は
              <NuxtLink to="/banquet-inquiry" style="color:var(--color-accent); font-weight:600;">宴会問い合わせ</NuxtLink>
              からご連絡ください。
            </p>
          </div>
        </div>

        <!-- Step 3: 時間帯 -->
        <div v-else-if="step === 3">
          <p class="reservation-label">ご希望の時間帯を選択してください</p>
          <div v-if="loadingSlots" style="text-align:center; padding:1.5rem 0;">
            <i class="fa-solid fa-spinner fa-spin" style="color:var(--color-accent);" /> 空き確認中...
          </div>
          <div v-else-if="slots.length === 0" class="reservation-message reservation-message--error">
            この日は満席または休業日です。別の日付をお選びください。
          </div>
          <div v-else class="reservation-time-wrapper">
            <p class="reservation-time-note">開始時刻を選択してください（30分単位）</p>
            <div class="reservation-time-grid">
              <button
                v-for="slot in slots"
                :key="slot.start"
                class="reservation-time-button"
                :class="{ 'reservation-time-button--selected': form.startTime === slot.start }"
                @click="() => { form.startTime = slot.start; form.endTime = slot.end }"
              >
                <span class="reservation-time-label">{{ slot.start }}</span>
                <span class="reservation-time-status">○</span>
              </button>
            </div>
          </div>
          <p v-if="form.startTime" class="reservation-selected-time">
            選択中：{{ form.startTime }} 〜 {{ form.endTime }}
          </p>
        </div>

        <!-- Step 4: 席タイプ -->
        <div v-else-if="step === 4">
          <p class="reservation-label">ご希望の席タイプを選択してください</p>
          <div class="seat-type-grid">
            <button
              v-for="s in seatTypes"
              :key="s.value"
              class="seat-type-btn"
              :class="{ 'seat-type-btn--selected': form.seatType === s.value }"
              @click="form.seatType = s.value"
            >
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- Step 5: お客様情報 -->
        <div v-else-if="step === 5">
          <div class="reservation-field">
            <label for="r-name" class="reservation-label">
              お名前 <span style="color:var(--color-error)">*</span>
            </label>
            <input
              id="r-name"
              v-model="form.name"
              type="text"
              class="reservation-input"
              placeholder="山田 太郎"
              autocomplete="name"
            >
          </div>
          <div class="reservation-field">
            <label for="r-email" class="reservation-label">
              メールアドレス <span style="color:var(--color-error)">*</span>
            </label>
            <input
              id="r-email"
              v-model="form.email"
              type="email"
              class="reservation-input"
              placeholder="example@email.com"
              autocomplete="email"
            >
          </div>
          <div class="reservation-field">
            <label for="r-phone" class="reservation-label">電話番号（任意）</label>
            <input
              id="r-phone"
              v-model="form.phone"
              type="tel"
              class="reservation-input"
              placeholder="09012345678"
              inputmode="numeric"
              autocomplete="tel"
            >
            <small style="font-size:0.85rem; color:rgba(0,0,0,0.5);">※ハイフンなしで入力してください</small>
          </div>
          <div class="reservation-phone-notice">
            <p>当日のご連絡先</p>
            <a href="tel:0952252255">095-225-2255</a>
          </div>
        </div>

        <!-- Step 6: ご要望 -->
        <div v-else-if="step === 6">
          <div class="reservation-field">
            <label for="r-notes" class="reservation-label">ご要望・アレルギー等（任意）</label>
            <textarea
              id="r-notes"
              v-model="form.notes"
              class="reservation-textarea"
              rows="5"
              placeholder="アレルギーや特別なご要望がございましたらご記入ください。"
            />
          </div>
        </div>

        <!-- Step 7: 確認 -->
        <div v-else-if="step === 7">
          <p class="reservation-label" style="margin-bottom:0.75rem;">予約内容をご確認ください</p>
          <div class="reservation-confirm">
            <p><strong>日付：</strong>{{ formatDateDisplay(form.date) }}</p>
            <p><strong>人数：</strong>{{ form.partySize }}名</p>
            <p><strong>時間：</strong>{{ form.startTime }} 〜 {{ form.endTime }}</p>
            <p><strong>席タイプ：</strong>{{ seatTypes.find(s => s.value === form.seatType)?.label }}</p>
            <p><strong>お名前：</strong>{{ form.name }}</p>
            <p><strong>メール：</strong>{{ form.email }}</p>
            <p v-if="form.phone"><strong>電話：</strong>{{ form.phone }}</p>
            <p v-if="form.notes"><strong>ご要望：</strong>{{ form.notes }}</p>
          </div>
          <p v-if="submitError" class="reservation-message reservation-message--error" style="margin-top:0.75rem;">
            {{ submitError }}
          </p>
        </div>

        <!-- ナビゲーション -->
        <div class="reservation-step-actions" style="margin-top:1.25rem;">
          <button
            v-if="step > 1"
            class="reservation-back-button"
            type="button"
            @click="goPrev"
          >
            <i class="fa-solid fa-angle-left" /> 戻る
          </button>
          <button
            v-if="step < TOTAL_STEPS"
            class="reservation-submit-button"
            type="button"
            :disabled="step === 3 && !loadingSlots && slots.length === 0"
            @click="goNext"
          >
            次へ
          </button>
          <button
            v-else
            class="reservation-submit-button"
            type="button"
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? '送信中...' : '予約を確定する' }}
          </button>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
/* ステップ進捗バー */
.step-progress-wrap {
  margin-bottom: 1rem;
  text-align: center;
}

.step-progress-bar-bg {
  height: 4px;
  background: var(--color-accent-soft);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.35rem;
}

.step-progress-bar-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.step-progress-label {
  font-size: 0.85rem;
  color: var(--text-default);
  opacity: 0.7;
}

/* カスタムカレンダー */
.cal-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-primary);
  padding: 0.4rem 0.75rem;
}

.cal-nav-title {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
}

.cal-nav-btn {
  color: #fff;
  background: none;
  border: none;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  transition: background 0.15s;
}

.cal-nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.cal-nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 0.5rem;
  background: #fff;
}

.cal-weekday {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-default);
  opacity: 0.55;
  padding: 0.25rem 0;
}

.cal-empty {
  /* 空白セル */
}

.cal-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: none;
  border-radius: 6px;
  background: none;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: var(--font-base);
  color: var(--text-default);
  transition: background 0.12s ease;
}

.cal-tile:hover:not(:disabled) {
  background: rgba(198, 163, 85, 0.12);
}

.cal-tile--today {
  background: rgba(198, 163, 85, 0.2);
  font-weight: 600;
}

.cal-tile--selected {
  background: var(--color-primary) !important;
  color: #fff !important;
}

.cal-tile--disabled,
.cal-tile:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 人数グリッド */
.party-size-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin: 0.5rem 0 1rem;
}

.party-size-btn {
  padding: 0.65rem;
  border: 1px solid var(--color-accent-soft);
  border-radius: 8px;
  background: #fff;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: var(--font-base);
  color: var(--text-default);
}

.party-size-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-soft);
}

.party-size-btn--selected {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* 席タイプグリッド */
.seat-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.seat-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 0.5rem;
  border: 1px solid var(--color-accent-soft);
  border-radius: 8px;
  background: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: var(--font-base);
  color: var(--text-default);
}

.seat-type-btn:hover {
  border-color: var(--color-primary);
}

.seat-type-btn--selected {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

@media (max-width: 375px) {
  .seat-type-grid {
    grid-template-columns: 1fr;
  }
}
</style>

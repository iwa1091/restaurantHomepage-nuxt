<script setup lang="ts">
import '~/assets/css/pages/contact/contact.css'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: '宴会問い合わせ | すし割烹 いづ浦' })

const budgetOptions = [
  '5,000円〜8,000円 / 人',
  '8,000円〜12,000円 / 人',
  '12,000円〜15,000円 / 人',
  '15,000円以上 / 人',
  '未定・相談したい'
]

const form = reactive({
  name: '',
  email: '',
  phone: '',
  date: '',
  partySize: '',
  budget: '',
  message: ''
})

const errors = reactive<Record<string, string>>({})
const loading = ref(false)
const sent = ref(false)

// 今日以降の日付のみ入力可能にする
const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

async function submit() {
  Object.keys(errors).forEach(k => delete errors[k])

  let valid = true
  if (!form.name) { errors.name = 'お名前を入力してください。'; valid = false }
  if (!form.email) { errors.email = 'メールアドレスを入力してください。'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'メールアドレスの形式が正しくありません。'
    valid = false
  }
  if (!form.message) { errors.message = 'お問い合わせ内容を入力してください。'; valid = false }
  if (!valid) return

  loading.value = true
  try {
    await $fetch('/api/banquet', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        date: form.date || null,
        partySize: form.partySize ? Number(form.partySize) : null,
        budget: form.budget || null,
        message: form.message
      }
    })
    sent.value = true
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    errors.general = e.data?.message ?? 'エラーが発生しました。しばらくしてから再度お試しください。'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="contact-page">
    <div class="contact-container">
      <!-- ページヘッダー -->
      <div class="page-header">
        <h1>宴会問い合わせ</h1>
        <p>
          10名以上の宴会・ご宴席のご相談を承っております。<br>
          ご希望の日程・人数・ご予算をお知らせください。担当者よりご連絡いたします。
        </p>
      </div>

      <div class="contact-layout">
        <!-- フォームカード -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">宴会問い合わせフォーム</h2>
            <p class="card-subtitle">通常2営業日以内にご返信いたします。</p>
          </div>

          <!-- 送信完了 -->
          <div v-if="sent" class="alert alert-success">
            <strong>お問い合わせを受け付けました。</strong><br>
            内容を確認のうえ、ご登録いただいたメールアドレスへご連絡いたします。<br>
            お急ぎの場合はお電話（<a href="tel:0952252255" style="color:inherit; font-weight:600;">095-225-2255</a>）にてお問い合わせください。
          </div>

          <!-- フォーム本体 -->
          <form v-else class="contact-form" novalidate @submit.prevent="submit">
            <!-- 全体エラー -->
            <div v-if="errors.general" class="alert alert-error">{{ errors.general }}</div>

            <!-- 氏名 / メール -->
            <div class="form-grid">
              <div class="form-field">
                <label for="b-name">お名前 <span style="color:var(--color-error)">*</span></label>
                <input
                  id="b-name"
                  v-model="form.name"
                  type="text"
                  class="input-field"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="山田 太郎"
                  autocomplete="name"
                >
                <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
              </div>
              <div class="form-field">
                <label for="b-email">メールアドレス <span style="color:var(--color-error)">*</span></label>
                <input
                  id="b-email"
                  v-model="form.email"
                  type="email"
                  class="input-field"
                  :class="{ 'is-invalid': errors.email }"
                  placeholder="example@email.com"
                  autocomplete="email"
                >
                <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
              </div>
            </div>

            <!-- 電話 / 人数 -->
            <div class="form-grid">
              <div class="form-field">
                <label for="b-phone">電話番号（任意）</label>
                <input
                  id="b-phone"
                  v-model="form.phone"
                  type="tel"
                  class="input-field"
                  placeholder="09012345678"
                  inputmode="numeric"
                  autocomplete="tel"
                >
              </div>
              <div class="form-field">
                <label for="b-party">人数（任意）</label>
                <input
                  id="b-party"
                  v-model="form.partySize"
                  type="number"
                  class="input-field"
                  min="10"
                  max="100"
                  placeholder="10"
                >
              </div>
            </div>

            <!-- 日程 / 予算 -->
            <div class="form-grid">
              <div class="form-field">
                <label for="b-date">ご希望日程（任意）</label>
                <input
                  id="b-date"
                  v-model="form.date"
                  type="date"
                  class="input-field"
                  :min="minDate"
                >
              </div>
              <div class="form-field">
                <label for="b-budget">ご予算（任意）</label>
                <select id="b-budget" v-model="form.budget" class="select-field">
                  <option value="">選択してください</option>
                  <option v-for="b in budgetOptions" :key="b" :value="b">{{ b }}</option>
                </select>
              </div>
            </div>

            <!-- メッセージ -->
            <div class="form-field">
              <label for="b-message">ご要望・その他 <span style="color:var(--color-error)">*</span></label>
              <textarea
                id="b-message"
                v-model="form.message"
                class="textarea-field"
                :class="{ 'is-invalid': errors.message }"
                rows="6"
                placeholder="ご利用シーン、アレルギー、特別なご要望などをお知らせください。"
              />
              <span v-if="errors.message" class="error-text">{{ errors.message }}</span>
            </div>

            <button type="submit" class="submit-button" :disabled="loading">
              {{ loading ? '送信中...' : '送信する' }}
            </button>
          </form>
        </div>

        <!-- サイドバー -->
        <aside class="sidebar">
          <!-- 宴会案内 -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">宴会・ご宴席のご案内</h2>
            </div>
            <div class="contact-info">
              <div class="contact-item">
                <i class="fa-solid fa-users" style="font-size:1.1rem; color:var(--color-accent); margin-top:0.15rem;" />
                <div>
                  <p class="info-label">対応人数</p>
                  <p class="info-text">10名〜最大40名様</p>
                </div>
              </div>
              <div class="contact-item">
                <i class="fa-solid fa-champagne-glasses" style="font-size:1.1rem; color:var(--color-accent); margin-top:0.15rem;" />
                <div>
                  <p class="info-label">ご利用シーン</p>
                  <p class="info-text">歓送迎会・忘年会・新年会<br>ご法事・還暦・ご接待など</p>
                </div>
              </div>
              <div class="contact-item">
                <i class="fa-solid fa-phone" style="font-size:1.1rem; color:var(--color-accent); margin-top:0.15rem;" />
                <div>
                  <p class="info-label">お電話でのご相談</p>
                  <a href="tel:0952252255" class="phone-link info-text">095-225-2255</a>
                </div>
              </div>
            </div>

            <div class="notice-box">
              ※宴会のご予約は、ご希望日の2週間前までにお問い合わせください。<br>
              お席・コースの都合上、ご希望に添えない場合がございます。
            </div>
          </div>

          <!-- お急ぎの方 -->
          <div class="quick-contact-card">
            <p style="font-weight:600; margin-bottom:0.5rem;">お急ぎのお客様</p>
            <p style="font-size:0.9rem; margin-bottom:1rem;">お電話でも受け付けております</p>
            <a href="tel:0952252255" class="phone-button">
              <i class="fa-solid fa-phone" style="margin-right:0.4rem;" />
              095-225-2255
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

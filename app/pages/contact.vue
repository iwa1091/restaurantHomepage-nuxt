<script setup lang="ts">
import '~/assets/css/pages/contact/contact.css'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'お問い合わせ | すし割烹 いづ浦' })

const subjects = [
  'お席の予約について',
  '宴会・団体のご利用について',
  'お取り寄せ・ギフトについて',
  'アクセス・駐車場について',
  'その他'
]

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const errors = reactive<Record<string, string>>({})
const loading = ref(false)
const sent = ref(false)

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
    await $fetch('/api/contact', { method: 'POST', body: form })
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
        <h1>お問い合わせ</h1>
        <p>
          ご予約・各種お問い合わせはこちらのフォームよりお気軽にどうぞ。<br>
          10名以上の宴会ご利用は<NuxtLink to="/banquet-inquiry" style="color:var(--color-accent);">宴会問い合わせ</NuxtLink>をご利用ください。
        </p>
      </div>

      <div class="contact-layout">
        <!-- フォームカード -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">お問い合わせフォーム</h2>
            <p class="card-subtitle">通常2営業日以内にご返信いたします。</p>
          </div>

          <!-- 送信完了 -->
          <div v-if="sent" class="alert alert-success">
            <strong>お問い合わせを受け付けました。</strong><br>
            内容を確認のうえ、ご登録いただいたメールアドレスへご連絡いたします。
          </div>

          <!-- フォーム本体 -->
          <form v-else class="contact-form" novalidate @submit.prevent="submit">
            <!-- 全体エラー -->
            <div v-if="errors.general" class="alert alert-error">{{ errors.general }}</div>

            <!-- 氏名 / メール -->
            <div class="form-grid">
              <div class="form-field">
                <label for="c-name">お名前 <span style="color:var(--color-error)">*</span></label>
                <input
                  id="c-name"
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
                <label for="c-email">メールアドレス <span style="color:var(--color-error)">*</span></label>
                <input
                  id="c-email"
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

            <!-- 電話 / 件名 -->
            <div class="form-grid">
              <div class="form-field">
                <label for="c-phone">電話番号（任意）</label>
                <input
                  id="c-phone"
                  v-model="form.phone"
                  type="tel"
                  class="input-field"
                  placeholder="09012345678"
                  inputmode="numeric"
                  autocomplete="tel"
                >
              </div>
              <div class="form-field">
                <label for="c-subject">お問い合わせ種別</label>
                <select id="c-subject" v-model="form.subject" class="select-field">
                  <option value="">選択してください</option>
                  <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>

            <!-- メッセージ -->
            <div class="form-field">
              <label for="c-message">お問い合わせ内容 <span style="color:var(--color-error)">*</span></label>
              <textarea
                id="c-message"
                v-model="form.message"
                class="textarea-field"
                :class="{ 'is-invalid': errors.message }"
                rows="6"
                placeholder="お問い合わせ内容をご記入ください。"
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
          <!-- 店舗情報 -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">店舗情報</h2>
            </div>
            <div class="contact-info">
              <div class="contact-item">
                <i class="fa-solid fa-location-dot" style="font-size:1.1rem; color:var(--color-accent); margin-top:0.15rem;" />
                <div>
                  <p class="info-label">住所</p>
                  <p class="info-text">〒850-0058<br>長崎県長崎市大黒町9-18</p>
                </div>
              </div>
              <div class="contact-item">
                <i class="fa-solid fa-phone" style="font-size:1.1rem; color:var(--color-accent); margin-top:0.15rem;" />
                <div>
                  <p class="info-label">電話番号</p>
                  <a href="tel:0952252255" class="phone-link info-text">095-225-2255</a>
                </div>
              </div>
              <div class="contact-item">
                <i class="fa-solid fa-clock" style="font-size:1.1rem; color:var(--color-accent); margin-top:0.15rem;" />
                <div>
                  <p class="info-label">営業時間</p>
                  <div class="hours-list">
                    <div class="hours-item">
                      <span>月〜土</span>
                      <span>17:30 〜 22:00</span>
                    </div>
                    <div class="hours-item">
                      <span>日・祝</span>
                      <span>定休日</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SNS -->
            <div class="sns-links">
              <a
                href="https://line.me/R/ti/p/@izuura"
                target="_blank"
                rel="noopener noreferrer"
                class="sns-button line"
              >
                <img src="/img/icon-line.png" alt="LINE" class="sns-icon">
                LINEで問い合わせる
              </a>
              <a
                href="https://www.instagram.com/izuura_nagasaki/"
                target="_blank"
                rel="noopener noreferrer"
                class="sns-button instagram"
              >
                <img src="/img/icon-instagram.svg" alt="Instagram" class="sns-icon">
                Instagramを見る
              </a>
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

<script setup lang="ts">
import '~/assets/css/pages/auth/authentication.css'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

useSeoMeta({ title: '会員登録 | すし割烹 いづ浦' })

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: ''
})
const errors = reactive<Record<string, string>>({})
const loading = ref(false)
const router = useRouter()

async function submit() {
  Object.keys(errors).forEach(k => delete errors[k])
  loading.value = true

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: form
    })
    await useUserSession().fetch()
    await router.push('/mypage')
  }
  catch (err: unknown) {
    const e = err as { statusCode?: number; data?: { message?: string } }
    errors.general = e.data?.message ?? 'エラーが発生しました。しばらくしてから再度お試しください。'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="authentication-page">
    <div class="authentication-container">
      <form class="authenticate-form" novalidate @submit.prevent="submit">
        <h1 class="page__title">会員登録</h1>

        <!-- 全体エラー -->
        <p v-if="errors.general" class="form__error" style="margin-bottom: 1rem; text-align: center;">
          {{ errors.general }}
        </p>

        <!-- お名前 -->
        <div class="form-group">
          <label for="name" class="entry__name">お名前</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            name="name"
            class="input"
            autocomplete="name"
          >
        </div>

        <!-- メールアドレス -->
        <div class="form-group">
          <label for="email" class="entry__name">メールアドレス</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            name="email"
            class="input"
            autocomplete="email"
          >
        </div>

        <!-- 電話番号（任意） -->
        <div class="form-group">
          <label for="phone" class="entry__name">電話番号（任意）</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            name="phone"
            class="input"
            placeholder="例：09012345678"
            inputmode="numeric"
          >
          <small style="font-size: 0.85rem; color: rgba(0,0,0,0.5);">
            ※ハイフンなしで入力してください
          </small>
        </div>

        <!-- パスワード -->
        <div class="form-group">
          <label for="password" class="entry__name">パスワード</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            name="password"
            class="input"
            autocomplete="new-password"
          >
          <small style="font-size: 0.85rem; color: rgba(0,0,0,0.5);">
            ※8文字以上で設定してください
          </small>
        </div>

        <!-- 確認用パスワード -->
        <div class="form-group">
          <label for="password_confirmation" class="entry__name">確認用パスワード</label>
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            type="password"
            name="password_confirmation"
            class="input"
            autocomplete="new-password"
          >
        </div>

        <!-- 登録ボタン -->
        <button type="submit" class="btn btn--big" :disabled="loading">
          {{ loading ? '登録中...' : '登録する' }}
        </button>

        <NuxtLink to="/auth/login" class="link">
          ログインはこちら
        </NuxtLink>
      </form>
    </div>
  </div>
</template>

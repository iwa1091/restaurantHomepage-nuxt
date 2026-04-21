<script setup lang="ts">
import '~/assets/css/pages/auth/authentication.css'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

useSeoMeta({ title: 'ログイン | すし割烹 いづ浦' })

const form = reactive({
  email: '',
  password: ''
})
const errors = reactive<{ email?: string; password?: string; general?: string }>({})
const loading = ref(false)
const router = useRouter()

async function submit() {
  Object.keys(errors).forEach(k => delete (errors as Record<string, string>)[k])
  loading.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form
    })
    await useUserSession().fetch()
    await router.push('/mypage')
  }
  catch (err: unknown) {
    const e = err as { statusCode?: number; data?: { message?: string } }
    if (e.statusCode === 401) {
      errors.general = e.data?.message ?? 'メールアドレスまたはパスワードが正しくありません'
    }
    else if (e.statusCode === 422) {
      errors.general = e.data?.message ?? '入力内容を確認してください'
    }
    else {
      errors.general = 'エラーが発生しました。しばらくしてから再度お試しください。'
    }
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
        <h1 class="page__title">ログイン</h1>

        <!-- 全体エラー -->
        <p v-if="errors.general" class="form__error" style="margin-bottom: 1rem; text-align: center;">
          {{ errors.general }}
        </p>

        <!-- メールアドレス -->
        <div class="form-group">
          <label for="email" class="entry__name">メールアドレス</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            name="email"
            class="input"
            :class="{ 'input--error': errors.email }"
            autocomplete="email"
            autofocus
          >
          <span v-if="errors.email" class="form__error">{{ errors.email }}</span>
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
            :class="{ 'input--error': errors.password }"
            autocomplete="current-password"
          >
          <span v-if="errors.password" class="form__error">{{ errors.password }}</span>
        </div>

        <!-- ログインボタン -->
        <button type="submit" class="btn btn--big" :disabled="loading">
          {{ loading ? 'ログイン中...' : 'ログインする' }}
        </button>

        <!-- ヘルプ -->
        <div class="auth-help-block">
          <p class="auth-help-text">
            パスワードをお忘れの方は、以下のリンクから再設定メールを送信できます。
          </p>
          <NuxtLink to="/auth/forgot-password" class="link">
            パスワードをお忘れの方はこちら
          </NuxtLink>
        </div>

        <div class="auth-help-block">
          <p class="auth-help-text">
            登録したメールアドレスが分からない場合は、お問い合わせフォームよりご連絡ください。
          </p>
          <NuxtLink to="/contact" class="link">
            お問い合わせフォームへ
          </NuxtLink>
        </div>

        <NuxtLink to="/auth/register" class="link">
          会員登録はこちら
        </NuxtLink>
      </form>
    </div>
  </div>
</template>

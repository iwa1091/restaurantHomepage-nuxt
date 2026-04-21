<script setup lang="ts">
import '~/assets/css/pages/auth/authentication.css'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

useSeoMeta({ title: '管理者ログイン | すし割烹 いづ浦' })

const form = reactive({
  email: '',
  password: ''
})
const errors = reactive<Record<string, string>>({})
const loading = ref(false)
const router = useRouter()

async function submit() {
  Object.keys(errors).forEach(k => delete errors[k])
  loading.value = true

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: form
    })
    await useUserSession().fetch()
    await router.push('/admin/dashboard')
  }
  catch (err: unknown) {
    const e = err as { statusCode?: number; data?: { message?: string } }
    if (e.statusCode === 401 || e.statusCode === 422) {
      errors.general = e.data?.message ?? 'メールアドレスまたはパスワードが正しくありません'
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
        <h1 class="page__title">管理者ログイン</h1>

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
            autocomplete="email"
            autofocus
          >
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
            autocomplete="current-password"
          >
        </div>

        <!-- ログインボタン -->
        <button type="submit" class="btn btn--big" :disabled="loading">
          {{ loading ? 'ログイン中...' : 'ログイン' }}
        </button>
      </form>
    </div>
  </div>
</template>

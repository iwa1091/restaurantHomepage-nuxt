// ゲスト専用ページ（ログイン済みならリダイレクト）
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()

  if (loggedIn.value) {
    // 管理者はダッシュボードへ、一般ユーザーはマイページへ
    if (user.value?.role === 'admin') {
      return navigateTo('/admin/dashboard')
    }
    return navigateTo('/mypage')
  }
})

// /mypage 以下：ログイン済みユーザーのみアクセス可
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }
})

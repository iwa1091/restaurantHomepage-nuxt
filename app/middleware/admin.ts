// /admin 以下：role === 'admin' のユーザーのみアクセス可
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value || user.value?.role !== 'admin') {
    return navigateTo('/admin/login')
  }
})

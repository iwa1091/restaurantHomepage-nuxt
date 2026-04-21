<script setup lang="ts">
const { clear } = useUserSession()
const router = useRouter()

async function logout() {
  await clear()
  await router.push('/admin/login')
}

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'ダッシュボード' },
  { href: '/admin/reservations', label: '予約管理' },
  { href: '/admin/timetable', label: 'タイムテーブル' },
  { href: '/admin/products', label: '商品管理' },
  { href: '/admin/services', label: 'サービス管理' },
  { href: '/admin/categories', label: 'カテゴリ管理' },
  { href: '/admin/users', label: '顧客管理' },
  { href: '/admin/banquet-inquiries', label: '宴会問い合わせ' }
]

const route = useRoute()
const menuOpen = ref(false)

watch(() => route.path, () => {
  menuOpen.value = false
})
</script>

<template>
  <div class="admin-layout">

    <!-- 管理画面ヘッダー -->
    <header class="admin-header-bar">
      <div class="oh-container admin-header-inner">

        <!-- ロゴ -->
        <NuxtLink to="/admin/dashboard" class="admin-logo-link">
          <span class="admin-logo-text">すし割烹 いづ浦 — 管理画面</span>
        </NuxtLink>

        <!-- PC ナビ -->
        <nav class="admin-desktop-nav" aria-label="管理メニュー">
          <NuxtLink
            v-for="link in adminNavLinks"
            :key="link.href"
            :to="link.href"
            class="admin-nav-link"
            :class="{ 'is-active': route.path === link.href }"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- ログアウトボタン -->
        <button class="admin-logout-btn" type="button" @click="logout">
          ログアウト
        </button>

        <!-- モバイル：ハンバーガー -->
        <button
          class="admin-menu-toggle mobile-only"
          type="button"
          aria-label="管理メニューを開く"
          @click="menuOpen = true"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:1.4rem;height:1.4rem;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

      </div>
    </header>

    <!-- モバイル：サイドドロワー -->
    <Transition name="overlay-fade">
      <div v-if="menuOpen" class="admin-menu-overlay" @click.self="menuOpen = false">
        <Transition name="drawer-slide">
          <div v-if="menuOpen" class="admin-mobile-menu">
            <div class="admin-mobile-menu-header">
              <span class="admin-logo-text">管理画面</span>
              <button class="menu-close-button" type="button" aria-label="閉じる" @click="menuOpen = false">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:1.4rem;height:1.4rem;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav class="admin-mobile-nav">
              <NuxtLink
                v-for="link in adminNavLinks"
                :key="link.href"
                :to="link.href"
                class="admin-mobile-nav-link"
                :class="{ 'is-active': route.path === link.href }"
              >
                {{ link.label }}
              </NuxtLink>
            </nav>
            <button class="admin-logout-btn admin-logout-btn--mobile" type="button" @click="logout">
              ログアウト
            </button>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- メインコンテンツ -->
    <main class="admin-main">
      <slot />
    </main>

  </div>
</template>

<style scoped>
/* =====================================================
   Admin Layout — Nuxt版
===================================================== */
.admin-layout {
  min-height: 100vh;
  background-color: var(--background);
  color: var(--foreground);
}

/* ヘッダー */
.admin-header-bar {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--border-color);
}

.admin-header-inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: 3.25rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

/* ロゴ */
.admin-logo-link {
  text-decoration: none;
  flex-shrink: 0;
}

.admin-logo-text {
  font-family: var(--font-heading);
  font-size: 1rem;
  letter-spacing: 0.06em;
  color: var(--color-accent);
}

/* PC ナビ */
.admin-desktop-nav {
  display: none;
  align-items: center;
  gap: 1.2rem;
  flex: 1;
}

@media (min-width: 1024px) {
  .admin-desktop-nav {
    display: flex;
  }
}

.admin-nav-link {
  font-family: var(--font-ui);
  font-size: 0.82rem;
  color: var(--color-gray);
  text-decoration: none;
  padding: 0.2rem 0;
  border-bottom: 2px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;
}

.admin-nav-link:hover,
.admin-nav-link.is-active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

/* ログアウトボタン */
.admin-logout-btn {
  margin-left: auto;
  font-family: var(--font-ui);
  font-size: 0.82rem;
  padding: 0.3rem 0.85rem;
  border-radius: var(--radius-base);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--color-gray);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}

.admin-logout-btn:hover {
  background-color: var(--color-bg-soft);
  color: var(--color-primary);
}

/* モバイルトグル */
.admin-menu-toggle {
  margin-left: auto;
  padding: 0.3rem;
  border-radius: var(--radius-base);
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--color-gray);
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.mobile-only {
  display: inline-flex;
}

@media (min-width: 1024px) {
  .mobile-only {
    display: none;
  }

  .admin-logout-btn {
    margin-left: 0;
  }
}

/* モバイルオーバーレイ */
.admin-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: var(--z-menu);
  display: flex;
  justify-content: flex-end;
}

.admin-mobile-menu {
  width: 16rem;
  background: var(--color-white);
  height: 100%;
  padding: 1rem 1.25rem 2rem;
  box-shadow: -4px 0 18px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.admin-mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.admin-mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.admin-mobile-nav-link {
  font-family: var(--font-ui);
  font-size: 0.93rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-base);
  color: var(--color-gray);
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.admin-mobile-nav-link:hover,
.admin-mobile-nav-link.is-active {
  background-color: rgba(var(--color-accent-rgb), 0.15);
  color: var(--color-accent);
}

.admin-logout-btn--mobile {
  margin-left: 0;
  width: 100%;
  text-align: center;
}

/* メイン */
.admin-main {
  padding-bottom: 2.5rem;
}

/* トランジション */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
.drawer-slide-enter-to,
.drawer-slide-leave-from {
  transform: translateX(0);
}
</style>

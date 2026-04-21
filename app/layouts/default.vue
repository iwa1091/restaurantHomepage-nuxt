<script setup lang="ts">
const route = useRoute()

const open = ref(false)

// ルート変更時にモバイルメニューを閉じる
watch(() => route.path, () => {
  open.value = false
})

// メニューが開いているときはbodyスクロールを禁止
watch(open, (val) => {
  if (import.meta.client) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

const navLinks = [
  { href: '/', label: '概要 メニュー' },
  { href: '/menu_price', label: 'コース・お席予約' },
  { href: '/gallery', label: 'ギャラリー' },
  { href: '/banquet-inquiry', label: '宴会・団体のご予約' },
  { href: '/online-store', label: 'お持ち帰りメニュー お土産' },
  { href: '/contact', label: 'ご予約・お問い合わせ' },
  { href: '/mypage', label: 'マイページ' }
]
</script>

<template>
  <div>
    <!-- ヘッダー -->
    <header class="main-header">
      <div class="header-container">
        <div class="header-content">

          <!-- ロゴ -->
          <NuxtLink to="/" class="header-logo-link">
            <span class="site-title">すし割烹 いづ浦</span>
          </NuxtLink>

          <!-- PC：ナビ + SNS アイコングループ -->
          <div class="desktop-right-group">

            <!-- デスクトップナビ -->
            <nav class="desktop-nav" aria-label="メインメニュー">
              <NuxtLink
                v-for="link in navLinks"
                :key="link.href"
                :to="link.href"
                class="nav-link"
                :class="{ 'is-active': route.path === link.href || (link.href !== '/' && route.path.startsWith(link.href)) }"
              >
                {{ link.label }}
              </NuxtLink>
            </nav>

            <!-- デスクトップ SNS -->
            <div class="desktop-sns">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" class="sns-icon-link" aria-label="Instagram">
                <img src="/img/icon-instagram.svg" class="sns-icon" alt="Instagram">
              </a>
              <a href="https://line.me/R/" target="_blank" rel="noopener noreferrer" class="sns-icon-link" aria-label="LINE">
                <img src="/img/icon-line.svg" class="sns-icon" alt="LINE">
              </a>
            </div>

          </div>

          <!-- モバイルメニューボタン -->
          <button
            class="menu-toggle-button mobile-only"
            type="button"
            aria-label="メニューを開く"
            @click="open = true"
          >
            <svg class="icon-menu" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        </div>
      </div>
    </header>

    <!-- モバイルメニュー Overlay -->
    <Transition name="overlay-fade">
      <div
        v-if="open"
        class="mobile-menu-overlay"
        @click.self="open = false"
      >
        <Transition name="drawer-slide">
          <div v-if="open" class="mobile-menu">

            <div class="mobile-menu-header">
              <button
                class="menu-close-button"
                type="button"
                aria-label="メニューを閉じる"
                @click="open = false"
              >
                <svg class="icon-close" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- モバイル SNS アイコン -->
            <div class="mobile-sns">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" class="sns-icon-link">
                <img src="/img/icon-instagram.svg" class="sns-icon" alt="Instagram">
              </a>
              <a href="https://line.me/R/" target="_blank" rel="noopener noreferrer" class="sns-icon-link">
                <img src="/img/icon-line.svg" class="sns-icon" alt="LINE">
              </a>
            </div>

            <!-- ロゴ -->
            <div class="mobile-logo-wrapper">
              <img src="/img/1top-img.png" alt="すし割烹 いづ浦 ロゴ" class="mobile-logo">
              <span class="site-title-mobile">すし割烹 いづ浦</span>
            </div>

            <!-- モバイルメニュー -->
            <div class="mobile-nav-list">
              <NuxtLink
                v-for="link in navLinks"
                :key="link.href"
                :to="link.href"
                class="mobile-nav-link"
                :class="{ 'is-active': route.path === link.href || (link.href !== '/' && route.path.startsWith(link.href)) }"
              >
                {{ link.label }}
              </NuxtLink>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>

    <!-- メインコンテンツ -->
    <main>
      <slot />
    </main>

    <!-- フッター -->
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-grid">

          <!-- Logo & Description -->
          <div class="footer-logo-section">
            <h3 class="salon-name">すし割烹 いづ浦</h3>
            <p class="salon-description">
              九十九里の海の幸を極めた老舗の味。料理人歴45年の店主がこだわりの料理をお届けします。
            </p>
            <!-- SNS Icons -->
            <div class="social-links">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="social-link">
                <img src="/img/icon-instagram.svg" alt="Instagram" class="footer-sns-icon">
              </a>
              <a href="https://line.me/R/" target="_blank" rel="noopener noreferrer" aria-label="LINE" class="social-link">
                <img src="/img/icon-line.svg" alt="LINE" class="footer-sns-icon">
              </a>
            </div>
          </div>

          <!-- Menu -->
          <div class="footer-menu-section">
            <h4 class="footer-menu-heading">メニュー</h4>
            <nav class="footer-menu-nav">
              <NuxtLink to="/" class="footer-nav-link" :class="{ 'is-active': route.path === '/' }">概要 メニュー</NuxtLink>
              <NuxtLink to="/menu_price" class="footer-nav-link" :class="{ 'is-active': route.path.startsWith('/menu_price') }">コース・お席予約</NuxtLink>
              <NuxtLink to="/gallery" class="footer-nav-link" :class="{ 'is-active': route.path.startsWith('/gallery') }">ギャラリー</NuxtLink>
              <NuxtLink to="/online-store" class="footer-nav-link" :class="{ 'is-active': route.path.startsWith('/online-store') }">お持ち帰りメニュー お土産</NuxtLink>
              <NuxtLink to="/contact" class="footer-nav-link" :class="{ 'is-active': route.path.startsWith('/contact') }">ご予約・お問い合わせ</NuxtLink>
            </nav>
          </div>

          <!-- Contact Info -->
          <div class="footer-contact-section">
            <h4 class="footer-contact-heading">お問い合わせ</h4>
            <div class="contact-info-list">

              <div class="contact-info-item">
                <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span class="contact-text">080-9704-9500</span>
              </div>

              <div class="contact-info-item">
                <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span class="contact-text">izurararara@yahoo.ne.jp</span>
              </div>

              <div class="contact-info-item address-item">
                <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span class="contact-text">
                  千葉県山武郡<br>
                  九十九里町片貝4772
                </span>
              </div>

            </div>
          </div>

          <!-- Business Hours -->
          <div class="footer-hours-section">
            <h4 class="footer-hours-heading">営業時間</h4>
            <div class="hours-list">
              <div class="hours-item">
                <span>火曜日〜日曜日</span>
                <span>17:00〜22:00</span>
              </div>
              <div class="hours-item">
                <span>月曜日</span>
                <span>定休日</span>
              </div>
              <div class="hours-item" style="margin-top: 0.5rem;">
                <span style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">※日中の法事・宴会は要予約</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Copyright -->
      <div class="footer-copyright-section">
        <div class="footer-container copyright-container">
          <div class="copyright-content">
            <p>&copy; {{ new Date().getFullYear() }} すし割烹 いづ浦. All rights reserved.</p>
            <div class="legal-links">
              <a href="#" class="legal-link">プライバシーポリシー</a>
              <a href="#" class="legal-link">利用規約</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* モバイルオーバーレイのトランジション */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* ドロワーのスライドトランジション（右から） */
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

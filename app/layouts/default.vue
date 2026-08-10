<template>
  <LayoutLoader v-if="isLoadingStore.isLoading" />

  <div v-else :class="{ 'crm-layout': store.isAuth }">
    <!-- Mobile menu button -->
    <button
      v-if="store.isAuth"
      type="button"
      class="mobile-menu-btn"
      @click="isMobileMenuOpen = !isMobileMenuOpen"
      aria-label="Відкрити меню"
    >
      <Icon name="material-symbols:menu" size="24px" />
    </button>

    <!-- Overlay for mobile sidebar -->
    <div
      v-if="store.isAuth && isMobileMenuOpen"
      class="sidebar-overlay"
      @click="isMobileMenuOpen = false"
    />

    <LayoutSidebar
      v-if="store.isAuth"
      class="sidebar"
      :class="{ 'sidebar--open': isMobileMenuOpen }"
      @close="isMobileMenuOpen = false"
    />

    <main class="main-content">
      <div class="page-container">
        <slot />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useAuthStore, useIsLoadingStore } from "~/store/auth.store";

const { $appwrite } = useNuxtApp();
const isLoadingStore = useIsLoadingStore();
const store = useAuthStore();
const router = useRouter();
const isMobileMenuOpen = ref(false);

isLoadingStore.set(true);

onMounted(async () => {
  try {
    const user = await $appwrite.account.get();

    if (user) {
      store.setUser({
        email: user.email,
        name: user.name,
        status: true,
      });
    }
  } catch (error) {
    const currentRoute = router.currentRoute.value;
    if (currentRoute.path !== '/login') {
      await router.push('/login');
    }
  } finally {
    isLoadingStore.set(false);
  }
});
</script>

<style lang="css" scoped>
.crm-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #0b0714;
  color: #e2daf5;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  overflow: hidden;
}

.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 60;
  width: 44px;
  height: 44px;
  border: 1px solid #2b1f47;
  border-radius: 10px;
  background-color: #140e24;
  color: #e2daf5;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mobile-menu-btn:hover {
  background-color: #1c1430;
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 40;
}

.sidebar {
  width: 20%;
  min-width: 240px;
  max-width: 300px;
  border-right: 1px solid #1c1430;
  background-color: #0b0714;
  transition: transform 0.3s ease;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  padding: 1.5rem;
}

.page-container {
  background-color: #140e24;
  border-radius: 16px;
  padding: 1.5rem;
  height: 100%;
  border: 1px solid #2b1f47;
  box-shadow:
    0 10px 25px -5px rgba(5, 3, 10, 0.7),
    0 8px 10px -6px rgba(43, 31, 71, 0.3);
}

/* Tablet */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
    min-width: 240px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .crm-layout {
    flex-direction: column;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 280px;
    min-width: 280px;
    z-index: 50;
    transform: translateX(-100%);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .main-content {
    padding: 0rem 1rem 1rem;
    width: 100%;
  }

  .page-container {
    padding: 1rem;
    border-radius: 12px;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .main-content {
    padding: 3.5rem 0.75rem 0.75rem;
  }

  .page-container {
    padding: 0.75rem;
    border-radius: 10px;
  }
}
</style>

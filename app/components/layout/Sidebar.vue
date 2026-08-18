<template>
  <aside class="aside">
    <button
      type="button"
      class="mobile-close-btn"
      @click="closeSidebar"
      aria-label="Закрити меню"
    >
      <Icon name="material-symbols:close" size="24px" />
    </button>

    <NuxtLink to="/" class="logo-link">
      <NuxtImg
        src="/logo.png"
        alt="Logo"
        width="70"
        height="auto"
        class="logo"
      />
    </NuxtLink>

    <div class="aside-actions">
      <LayoutThemeToggle />
      <Icon
        @click="logout"
        name="material-symbols:logout"
        size="26px"
        class="log-out-icon"
      />
    </div>

    <div class="layout-menu">
      <LayoutMenu />
    </div>
  </aside>
</template>
<script setup lang="ts">
const { $appwrite } = useNuxtApp();

import { useAuthStore, useIsLoadingStore } from "~/store/auth.store";
const isLoadingStore = useIsLoadingStore();
const store = useAuthStore();
const router = useRouter();

const emit = defineEmits(["close"]);

const closeSidebar = () => {
  emit("close");
};

const logout = async () => {
  isLoadingStore.set(true);

  try {
    await $appwrite.account.deleteSession({
      sessionId: "current",
    });

    store.clear();

    await router.push("/login");
  } catch (error) {
    console.error("Помилка при виході з системи:", error);
    alert("Не вдалося вийти з акаунта");
  } finally {
    isLoadingStore.set(false);
  }
};
</script>
<style lang="css" scoped>
.aside {
  padding: 20px;
  position: relative;
}
.logo-link {
  display: block;
  margin: 0 auto;
  width: 70px;
  height: auto;
}
.aside-actions {
  position: absolute;
  top: 500px;
  right: 130px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.log-out-icon {
  cursor: pointer;
  color: var(--text-muted);
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}
.log-out-icon:hover {
  color: var(--error-hover);
  transform: translateX(2px);
}
.layout-menu {
  margin-top: 30px;
}

.mobile-close-btn {
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background-color: transparent;
  color: var(--text-muted);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mobile-close-btn:hover {
  background-color: color-mix(in srgb, var(--accent-primary) 10%, transparent);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .aside {
    padding: 70px 20px 20px;
    height: 100vh;
    overflow-y: auto;
  }

  .mobile-close-btn {
    display: flex;
  }

  .logo-link {
    width: 60px;
  }

  .aside-actions {
    top: 530px;
    left: 16px;
    right: auto;
  }
}

@media (max-width: 480px) {
  .aside {
    padding: 60px 16px 16px;
  }

  .logo-link {
    width: 50px;
  }
}
</style>

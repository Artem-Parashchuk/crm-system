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
    <Icon
      @click="logout"
      name="material-symbols:logout"
      size="26px"
      class="log-out-icon"
    />
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

const emit = defineEmits(['close']);

const closeSidebar = () => {
  emit('close');
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
.logo {
}
.log-out-icon {
  position: absolute;
  top: 20px;
  right: 0px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}
.log-out-icon:hover {
  color: #f43f5e;
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
  color: #94a3b8;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mobile-close-btn:hover {
  background-color: rgba(139, 92, 246, 0.1);
  color: #e2daf5;
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

  .log-out-icon {
    top: 16px;
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

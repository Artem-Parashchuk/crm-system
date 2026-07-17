<template>
  <aside class="aside">
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
</style>

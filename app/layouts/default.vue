<template>
  <LayoutLoader v-if="isLoadingStore.isLoading" />

  <div v-else :class="{ 'crm-layout': store.isAuth }">
    <LayoutSidebar class="sidebar" v-if="store.isAuth" />

    <main class="main-content">
      <div class="page-container">
        <slot />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useAuthStore, useIsLoadingStore } from "~/store/auth.store";

const { $appwrite } = useNuxtApp();
const isLoadingStore = useIsLoadingStore();
const store = useAuthStore();
const router = useRouter();

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
    console.log("Сесія відсутня, редирект на логін");
    await router.push("/login");
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
.sidebar {
  width: 20%;
}
.main-content {
  width: 100%;
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
  border: 1px solid #2b1f47;
  box-shadow:
    0 10px 25px -5px rgba(5, 3, 10, 0.7),
    0 8px 10px -6px rgba(43, 31, 71, 0.3);
}

.sidebar {
  border-right: 1px solid #1c1430;
  background-color: #0b0714;
}
</style>

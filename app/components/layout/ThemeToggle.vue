<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="themeStore.theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'"
    @click="themeStore.toggleTheme()"
  >
    <Icon
      :name="
        themeStore.theme === 'dark' ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'
      "
      size="22px"
    />
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/store/theme.store'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  color: var(--text-muted);
  cursor: pointer;
}

.theme-toggle:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}
</style>

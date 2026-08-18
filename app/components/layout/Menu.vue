<template>
  <nav class="menu-container">
    <NuxtLink v-for="item in MENU_DATA" :key="item.name" :to="item.url" class="menu-link">
      <Icon :name="item.icon" class="menu-icon" />
      <span class="menu-text">{{ item.name }}</span>
    </NuxtLink>
  </nav>
</template>

<script lang="ts" setup>
import { MENU_DATA } from './menu.data'
</script>

<style lang="css" scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-icon {
  font-size: 20px;
  color: var(--text-subtle);
  transition: color 0.25s ease;
}

.menu-text {
  white-space: nowrap;
  font-weight: 700;
}

.menu-link:hover {
  color: var(--text-secondary);
  background-color: color-mix(in srgb, var(--accent-primary) 10%, transparent);
}

.menu-link:hover .menu-icon {
  color: var(--accent-secondary);
}

.router-link-active,
.router-link-exact-active {
  color: var(--text-primary) !important;
  background-color: var(--bg-tertiary);
  box-shadow:
    inset 0 0 12px color-mix(in srgb, var(--accent-primary) 20%, transparent),
    0 4px 12px color-mix(in srgb, var(--bg-primary) 40%, transparent);
  border: 1px solid var(--border-secondary);
}

.router-link-active .menu-icon,
.router-link-exact-active .menu-icon {
  color: var(--accent-primary);
}
</style>

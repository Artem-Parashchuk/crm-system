<template>
  <nav class="menu-container">
    <NuxtLink
      v-for="item in MENU_DATA"
      :to="item.url"
      :key="item.name"
      class="menu-link"
    >
      <Icon :name="item.icon" class="menu-icon" />
      <span class="menu-text">{{ item.name }}</span>
    </NuxtLink>
  </nav>
</template>

<script lang="ts" setup>
import { MENU_DATA } from "./menu.data";
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
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-icon {
  font-size: 20px;
  color: #64748b;
  transition: color 0.25s ease;
}

.menu-text {
  white-space: nowrap;
  font-weight: 700;
}

.menu-link:hover {
  color: #f4f4f5;
  background-color: rgba(43, 31, 71, 0.4);
}

.menu-link:hover .menu-icon {
  color: #a78bfa;
}

.router-link-active,
.router-link-exact-active {
  color: #ffffff !important;
  background-color: #2b1f47;
  box-shadow:
    inset 0 0 12px rgba(139, 92, 246, 0.2),
    0 4px 12px rgba(11, 7, 20, 0.4);
  border: 1px solid #3e2d63;
}

.router-link-active .menu-icon,
.router-link-exact-active .menu-icon {
  color: #8b5cf6;
}
</style>

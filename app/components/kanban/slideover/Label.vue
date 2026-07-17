<template>
  <div class="label-block">
    <label v-if="labelText" class="label-title">{{ labelText }}</label>
    <div class="label-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  labelText: {
    type: String,
    default: "",
  },
});
</script>

<style lang="css" scoped>
.label-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.label-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.label-content {
  color: #111827;
  font-size: 0.95rem;
}
</style>

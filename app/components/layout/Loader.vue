<template>
  <div class="loader-backdrop">
    <div class="loader-container">
      <div class="loader-bars">
        <div class="bar" />
        <div class="bar" />
        <div class="bar" />
      </div>
      <p class="loader-text">Завантаження даних...</p>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="css" scoped>
.loader-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: color-mix(in srgb, var(--bg-primary) 70%, transparent);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  border-radius: 16px;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loader-bars {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
}

.bar {
  width: 6px;
  height: 100%;
  background: var(--accent-gradient);
  border-radius: 3px;
  animation: wave 1.2s ease-in-out infinite;
}

.bar:nth-child(1) {
  animation-delay: -0.4s;
}

.bar:nth-child(2) {
  animation-delay: -0.2s;
}

.bar:nth-child(3) {
  animation-delay: 0s;
}

.loader-text {
  font-size: 14px;
  color: var(--accent-secondary);
  font-weight: 500;
  letter-spacing: 0.5px;
  animation: pulse 1.8s ease-in-out infinite;
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>

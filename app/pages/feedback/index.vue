<template>
  <div class="feedback-page">
    <h1 class="feedback-page__title">Відгуки</h1>
    <p class="feedback-page__text">Розділ в розробці</p>
  </div>
</template>

<style scoped>
.feedback-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
}

.feedback-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 0;
}

.feedback-page__text {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
}
</style>

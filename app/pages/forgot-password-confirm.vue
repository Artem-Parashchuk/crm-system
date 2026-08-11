<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="success-icon-wrapper">
        <Icon name="material-symbols:mail-outline" class="success-icon" />
      </div>
      
      <h1 class="auth-title">Перевірте email</h1>
      <p class="auth-subtitle">
        Ми надіслали посилання для відновлення паролю на вашу пошту
      </p>

      <div class="info-box">
        <p>
          Не отримали лист? Перевірте папку "Спам" або спробуйте надіслати посилання ще раз.
        </p>
      </div>

      <div class="action-buttons">
        <NuxtLink to="/forgot-password" class="btn btn-secondary">
          Надіслати ще раз
        </NuxtLink>
        
        <NuxtLink to="/login" class="btn btn-primary">
          Повернутися до входу
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'auth'
})
</script>

<style lang="css" scoped>
.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  background-color: var(--bg-primary);
  padding: 20px;
}

.auth-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-card);
  text-align: center;
}

.success-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.success-icon {
  font-size: 64px;
  color: var(--accent-primary);
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.auth-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 32px;
}

.info-box {
  background-color: color-mix(in srgb, var(--accent-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-box p {
  color: var(--accent-secondary);
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  text-align: center;
}

.btn-primary {
  background: var(--accent-gradient);
  color: var(--text-primary);
  border: none;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-primary) 30%, transparent);
}

.btn-primary:hover {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent-primary) 40%, transparent);
}

.btn-secondary {
  background-color: transparent;
  color: var(--accent-secondary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background-color: color-mix(in srgb, var(--accent-primary) 10%, transparent);
  border-color: var(--accent-primary);
}

/* Адаптивність */
@media (max-width: 768px) {
  .auth-wrapper {
    padding: 16px;
    min-height: 100vh;
  }

  .auth-card {
    padding: 32px 24px;
    border-radius: 12px;
    max-width: 100%;
  }

  .auth-title {
    font-size: 24px;
  }

  .auth-subtitle {
    font-size: 13px;
    margin-bottom: 24px;
  }

  .success-icon {
    font-size: 48px;
  }

  .info-box {
    padding: 14px;
  }

  .info-box p {
    font-size: 13px;
  }

  .btn {
    padding: 16px;
    min-height: 52px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px 20px;
  }

  .auth-title {
    font-size: 22px;
  }

  .auth-subtitle {
    font-size: 12px;
  }
}
</style>

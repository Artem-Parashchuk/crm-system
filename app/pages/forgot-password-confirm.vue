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
  background-color: #0b0714;
  padding: 20px;
}

.auth-card {
  background-color: #140e24;
  border: 1px solid #2b1f47;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow:
    0 20px 40px rgba(5, 3, 10, 0.8),
    0 1px 3px rgba(139, 92, 246, 0.1);
  text-align: center;
}

.success-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.success-icon {
  font-size: 64px;
  color: #8b5cf6;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.auth-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 32px;
}

.info-box {
  background-color: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-box p {
  color: #a78bfa;
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
  background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-primary:hover {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.btn-secondary {
  background-color: transparent;
  color: #a78bfa;
  border: 1px solid #2b1f47;
}

.btn-secondary:hover {
  background-color: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
}
</style>

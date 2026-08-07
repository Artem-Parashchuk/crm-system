<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1 class="auth-title">Відновлення паролю</h1>
      <p class="auth-subtitle">
        Введіть email, і ми надішлемо посилання для скидання паролю
      </p>

      <form @submit.prevent="onSubmit" class="auth-form">
        <div v-if="serverError" class="server-error">
          <Icon name="material-symbols:error-outline" class="error-icon" />
          <span>{{ serverError }}</span>
        </div>

        <div class="input-group">
          <Icon name="material-symbols:mail-outline" class="input-icon" />
          <input
            v-model="formEmail"
            placeholder="Email"
            type="email"
            class="auth-input"
            :class="{ 'input-error': emailError && emailMeta.touched }"
          />
          <span v-if="emailError && emailMeta.touched" class="error-message">
            {{ emailError }}
          </span>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loadingStore.isLoading"
        >
          Надіслати посилання
        </button>

        <div class="auth-toggle">
          <span>Згадали пароль?</span>
          <NuxtLink to="/login" class="btn-link">
            Увійти
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import { useIsLoadingStore } from "~/store/auth.store";

definePageMeta({
  layout: 'auth'
})

const { $appwrite } = useNuxtApp();
const config = useRuntimeConfig();
const loadingStore = useIsLoadingStore();

const { handleSubmit: handleValidSubmit } = useForm();

const serverError = ref("");

const { value: formEmail, errorMessage: emailError, meta: emailMeta } = useField(
  "email",
  (value: string) => {
    if (!value?.trim()) return "Email є обов'язковим";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Некоректний формат email";
    return true;
  }
);

const onSubmit = handleValidSubmit(async () => {
  serverError.value = "";
  loadingStore.set(true);

  try {
    const resetUrl = config.public.resetPasswordUrl || 'http://localhost:3000/reset-password';
    
    await $appwrite.account.createRecovery({
      email: formEmail.value,
      url: resetUrl
    });

    await navigateTo('/forgot-password-confirm');
  } catch (error: any) {
    serverError.value = "Не вдалося надіслати посилання. Перевірте email та спробуйте ще раз.";
  } finally {
    loadingStore.set(false);
  }
});
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

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 14px;
  font-size: 20px;
  color: #64748b;
  pointer-events: none;
  transition: color 0.2s ease;
  z-index: 1;
}

.auth-input {
  width: 100%;
  padding: 14px 16px 14px 44px;
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 10px;
  color: #e2daf5;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
}

.auth-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  background-color: #0e091a;
}

.auth-input:focus ~ .input-icon,
.input-group:focus-within .input-icon {
  color: #8b5cf6;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  transition: all 0.2s ease;
  margin-top: 10px;
}

.btn-primary:hover {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 14px;
  color: #94a3b8;
}

.btn-link {
  background: none;
  border: none;
  color: #a78bfa;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  transition: color 0.2s ease;
  text-decoration: none;
}

.btn-link:hover {
  color: #c084fc;
  text-decoration: underline;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  text-align: left;
  padding-left: 44px;
}

.input-error {
  border-color: #ef4444 !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
}

.server-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fca5a5;
  font-size: 14px;
}

.server-error .error-icon {
  font-size: 18px;
  flex-shrink: 0;
}
</style>

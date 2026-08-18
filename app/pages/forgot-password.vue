<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1 class="auth-title">Відновлення паролю</h1>
      <p class="auth-subtitle">Введіть email, і ми надішлемо посилання для скидання паролю</p>

      <form class="auth-form" @submit.prevent="onSubmit">
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

        <button type="submit" class="btn btn-primary" :disabled="loadingStore.isLoading">
          Надіслати посилання
        </button>

        <div class="auth-toggle">
          <span>Згадали пароль?</span>
          <NuxtLink to="/login" class="btn-link"> Увійти </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { useIsLoadingStore } from '~/store/auth.store'

definePageMeta({
  layout: 'auth',
})

const { $appwrite } = useNuxtApp()
const config = useRuntimeConfig()
const loadingStore = useIsLoadingStore()

const { handleSubmit: handleValidSubmit } = useForm()

const serverError = ref('')

const {
  value: formEmail,
  errorMessage: emailError,
  meta: emailMeta,
} = useField('email', (value: string) => {
  if (!value?.trim()) return "Email є обов'язковим"
  if (!/^\S+@\S+\.\S+$/.test(value)) return 'Некоректний формат email'
  return true
})

const onSubmit = handleValidSubmit(async () => {
  serverError.value = ''
  loadingStore.set(true)

  try {
    const resetUrl =
      config.public.resetPasswordUrl || 'http://crm-system-fawn-sigma.vercel.app/reset-password'

    await $appwrite.account.createRecovery({
      email: formEmail.value,
      url: resetUrl,
    })

    await navigateTo('/forgot-password-confirm')
  } catch {
    serverError.value = 'Не вдалося надіслати посилання. Перевірте email та спробуйте ще раз.'
  } finally {
    loadingStore.set(false)
  }
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
  color: var(--text-subtle);
  pointer-events: none;
  transition: color 0.2s ease;
  z-index: 1;
}

.auth-input {
  width: 100%;
  padding: 14px 16px 14px 44px;
  background-color: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
}

.auth-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 15%, transparent);
  background-color: var(--bg-primary);
}

.auth-input:focus ~ .input-icon,
.input-group:focus-within .input-icon {
  color: var(--accent-primary);
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: var(--accent-gradient);
  border: none;
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-primary) 30%, transparent);
  transition: all 0.2s ease;
  margin-top: 10px;
}

.btn-primary:hover {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent-primary) 40%, transparent);
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
  color: var(--text-muted);
}

.btn-link {
  background: none;
  border: none;
  color: var(--accent-secondary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  transition: color 0.2s ease;
  text-decoration: none;
}

.btn-link:hover {
  color: var(--text-accent);
  text-decoration: underline;
}

.error-message {
  display: block;
  color: var(--error-primary);
  font-size: 12px;
  margin-top: 4px;
  text-align: left;
  padding-left: 44px;
}

.input-error {
  border-color: var(--error-primary) !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--error-primary) 15%, transparent) !important;
}

.server-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--error-text);
  font-size: 14px;
}

.server-error .error-icon {
  font-size: 18px;
  flex-shrink: 0;
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

  .auth-form {
    gap: 16px;
  }

  .auth-input {
    padding: 16px 16px 16px 44px;
    font-size: 16px;
    min-height: 52px;
  }

  .input-icon {
    top: 16px;
  }

  .btn-primary {
    padding: 16px;
    min-height: 52px;
    font-size: 16px;
    margin-top: 8px;
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

  .error-message {
    padding-left: 40px;
    font-size: 11px;
  }

  .server-error {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>

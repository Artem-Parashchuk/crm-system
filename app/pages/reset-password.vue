<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1 class="auth-title">Новий пароль</h1>
      <p class="auth-subtitle">Введіть новий пароль для вашого акаунту</p>

      <form @submit.prevent="onSubmit" class="auth-form" novalidate>
        <!-- Помилка сервера -->
        <div v-if="serverError" class="server-error" role="alert">
          <Icon name="material-symbols:error-outline" class="error-icon" aria-hidden="true" />
          <span>{{ serverError }}</span>
        </div>

        <!-- Успішне виконання -->
        <div v-if="successMessage" class="success-message" role="alert">
          <Icon name="material-symbols:check-circle-outline" class="success-icon" aria-hidden="true" />
          <span>{{ successMessage }}</span>
        </div>

        <!-- Поле: Новий пароль -->
        <div class="input-group">
          <Icon name="material-symbols:lock-outline" class="input-icon" aria-hidden="true" />
          <div class="input-wrapper">
            <input
              v-model="formPassword"
              placeholder="Новий пароль"
              :type="showPassword ? 'text' : 'password'"
              class="auth-input"
              :class="{ 'input-error': passwordError && passwordMeta.touched }"
              :disabled="isLoading || !!successMessage"
              aria-label="Новий пароль"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showPassword ? 'Приховати пароль' : 'Показати пароль'"
              :disabled="isLoading || !!successMessage"
              @click="showPassword = !showPassword"
            >
              <Icon
                :name="showPassword ? 'material-symbols:visibility' : 'material-symbols:visibility-off'"
                aria-hidden="true"
              />
            </button>
          </div>
          <span v-if="passwordError && passwordMeta.touched" class="error-message" role="alert">
            {{ passwordError }}
          </span>
        </div>

        <!-- Поле: Повторіть пароль -->
        <div class="input-group">
          <Icon name="material-symbols:lock-outline" class="input-icon" aria-hidden="true" />
          <div class="input-wrapper">
            <input
              v-model="formConfirmPassword"
              placeholder="Повторіть пароль"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="auth-input"
              :class="{ 'input-error': confirmPasswordError && confirmPasswordMeta.touched }"
              :disabled="isLoading || !!successMessage"
              aria-label="Підтвердження пароля"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showConfirmPassword ? 'Приховати підтвердження пароля' : 'Показати підтвердження пароля'"
              :disabled="isLoading || !!successMessage"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon
                :name="showConfirmPassword ? 'material-symbols:visibility' : 'material-symbols:visibility-off'"
                aria-hidden="true"
              />
            </button>
          </div>
          <span v-if="confirmPasswordError && confirmPasswordMeta.touched" class="error-message" role="alert">
            {{ confirmPasswordError }}
          </span>
        </div>

        <!-- Кнопка сабміту -->
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!meta.valid || isLoading || !!successMessage"
        >
          <span v-if="isLoading" class="btn-spinner" aria-hidden="true"></span>
          <span>{{ successMessage ? "Пароль змінено" : "Змінити пароль" }}</span>
        </button>

        <!-- Посилання навігації -->
        <div class="auth-toggle">
          <NuxtLink to="/login" class="btn-link">
            {{ successMessage ? "Увійти з новим паролем" : "Повернутися до входу" }}
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useForm, useField } from "vee-validate";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const { $appwrite } = useNuxtApp();
const isLoading = ref(false);
const serverError = ref("");
const successMessage = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 1. Ініціалізуємо форму для збору загального мета-стану (meta.valid)
const { handleSubmit: handleValidSubmit, meta } = useForm();

// 2. Валідація основного пароля
const {
  value: formPassword,
  errorMessage: passwordError,
  meta: passwordMeta,
  validate: validatePassword, // дістаємо метод ручної валідації
} = useField<string>("password", (value) => {
  if (!value) return "Пароль є обов'язковим";
  if (value.length < 6) return "Пароль має містити мінімум 6 символів";
  return true;
});

// 3. Валідація підтвердження пароля
const {
  value: formConfirmPassword,
  errorMessage: confirmPasswordError,
  meta: confirmPasswordMeta,
  validate: validateConfirmPassword, // дістаємо метод ручної валідації
} = useField<string>("confirmPassword", (value) => {
  if (!value) return "Підтвердіть пароль";
  if (value !== formPassword.value) return "Паролі не співпадають";
  return true;
});

// 🔥 Секрет синхронізації: Якщо користувач змінив ОСНОВНИЙ пароль, 
// ми примусово перевіряємо ПОЛЕ ПІДТВЕРДЖЕННЯ, щоб помилка "не співпадають" вчасно з'явилася або зникла.
watch(formPassword, () => {
  if (confirmPasswordMeta.touched) {
    validateConfirmPassword();
  }
});

const onSubmit = handleValidSubmit(async () => {
  serverError.value = "";

  const userId = route.query.userId as string;
  const secret = route.query.secret as string;

  if (!userId || !secret) {
    serverError.value = "Недійсне або прострочене посилання для відновлення паролю.";
    return;
  }

  isLoading.value = true;

  try {
    await $appwrite.account.updateRecovery({
      userId,
      secret,
      password: formPassword.value,
      passwordConfirm: formConfirmPassword.value,
    });

    successMessage.value = "Пароль успішно змінено!";
    setTimeout(async () => {
      await navigateTo("/login");
    }, 2500);
  } catch (error: any) {
    console.error("Appwrite recovery error:", error);
    serverError.value = "Не вдалося змінити пароль. Можливо, посилання вже застаріло.";
  } finally {
    isLoading.value = false;
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

.input-wrapper {
  position: relative;
  width: 100%;
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

.input-wrapper .auth-input {
  padding-right: 44px;
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

.toggle-password {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-subtle);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 20px;
  transition: color 0.2s;
}

.toggle-password:hover {
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

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--success-bg);
  border: 1px solid var(--success-border);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--success-text);
  font-size: 14px;
}

.success-message .success-icon {
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

  .toggle-password {
    font-size: 22px;
  }

  .btn-primary {
    padding: 16px;
    min-height: 52px;
    font-size: 16px;
    margin-top: 8px;
  }

  .server-error,
  .success-message {
    padding: 12px;
    font-size: 13px;
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
}
</style>

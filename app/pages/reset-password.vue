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

.input-wrapper {
  position: relative;
  width: 100%;
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

.input-wrapper .auth-input {
  padding-right: 44px;
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

.toggle-password {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 20px;
  transition: color 0.2s;
}

.toggle-password:hover {
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

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #86efac;
  font-size: 14px;
}

.success-message .success-icon {
  font-size: 18px;
  flex-shrink: 0;
}
</style>

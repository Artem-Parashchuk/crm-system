<template>
  <div class="auth-wrapper">
    <LayoutLoader v-if="loadingStore.isLoading" />

    <div class="auth-card">
      <h1 class="auth-title">
        {{ isLoginMode ? "Вхід у систему" : "Реєстрація" }}
      </h1>
      <p class="auth-subtitle">
        Будь ласка, введіть свої дані для доступу до CRM
      </p>

      <form @submit.prevent="onSubmit" class="auth-form">
        <div v-if="serverError" class="server-error">
          <Icon name="material-symbols:error-outline" class="error-icon" />
          <span>{{ serverError }}</span>
        </div>

        <div v-if="!isLoginMode" class="input-group">
          <Icon name="material-symbols:person-outline" class="input-icon" />
          <input
            v-model="formName"
            placeholder="Ваше ім'я"
            type="text"
            class="auth-input"
            :class="{ 'input-error': nameError && nameMeta.touched }"
          />
          <span v-if="nameError && nameMeta.touched" class="error-message">
            {{ nameError }}
          </span>
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

        <div class="input-group">
          <Icon name="material-symbols:lock-outline" class="input-icon" />
          <div class="input-wrapper">
            <input
              v-model="formPassword"
              placeholder="Пароль"
              :type="showPassword ? 'text' : 'password'"
              class="auth-input"
              :class="{ 'input-error': passwordError && passwordMeta.touched }"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <Icon :name="showPassword ? 'material-symbols:visibility' : 'material-symbols:visibility-off'" />
            </button>
          </div>
          <span v-if="passwordError && passwordMeta.touched" class="error-message">
            {{ passwordError }}
          </span>
        </div>

        <div v-if="isLoginMode" class="forgot-password-link">
          <NuxtLink to="/forgot-password" class="forgot-link">
            Забули пароль?
          </NuxtLink>
        </div>

        <div v-if="!isLoginMode" class="input-group">
          <Icon name="material-symbols:lock-outline" class="input-icon" />
          <div class="input-wrapper">
            <input
              v-model="formConfirmPassword"
              placeholder="Повторіть пароль"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="auth-input"
              :class="{ 'input-error': confirmPasswordError && confirmPasswordMeta.touched }"
            />
            <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
              <Icon :name="showConfirmPassword ? 'material-symbols:visibility' : 'material-symbols:visibility-off'" />
            </button>
          </div>
          <span v-if="confirmPasswordError && confirmPasswordMeta.touched" class="error-message">
            {{ confirmPasswordError }}
          </span>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loadingStore.isLoading"
        >
          {{ isLoginMode ? "Увійти" : "Створити акаунт" }}
        </button>

        <div class="auth-toggle">
          <span>{{
            isLoginMode ? "Ще немає акаунту?" : "Вже маєте акаунт?"
          }}</span>
          <button
            type="button"
            class="btn-link"
            @click="isLoginMode = !isLoginMode"
          >
            {{ isLoginMode ? "Зареєструватися" : "Увійти" }}
          </button>
        </div>

        <div v-if="isLoginMode" class="demo-login-wrapper">
          <button
            type="button"
            class="btn-demo"
            @click="demoLogin"
            :disabled="loadingStore.isLoading"
          >
            <Icon name="material-symbols:person" class="demo-icon" />
            Увійти як демо-користувач
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from "uuid";
import { ref, watch } from "vue";
import { useForm, useField } from "vee-validate";
import { useAuthStore, useIsLoadingStore } from "~/store/auth.store";

definePageMeta({
  layout: 'auth'
})

const isLoginMode = ref(true);

const { $appwrite } = useNuxtApp();
const authStore = useAuthStore();
const loadingStore = useIsLoadingStore();

const { handleSubmit: handleValidSubmit, resetForm } = useForm();

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const serverError = ref("");

const { value: formEmail, errorMessage: emailError, meta: emailMeta } = useField(
  "email",
  (value: string) => {
    if (!value?.trim()) return "Email є обов'язковим";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Некоректний формат email";
    return true;
  }
);

const { value: formPassword, errorMessage: passwordError, meta: passwordMeta } = useField(
  "password",
  (value: string) => {
    if (!value) return "Пароль є обов'язковим";
    if (value.length < 8) return "Пароль має містити мінімум 8 символів";
    return true;
  }
);

const { value: formName, errorMessage: nameError, meta: nameMeta } = useField(
  "name",
  (value: string) => {
    if (!isLoginMode.value) {
      if (!value?.trim()) return "Ім'я є обов'язковим";
      if (value.trim().length < 2) return "Ім'я має містити мінімум 2 літери";
    }
    return true;
  }
);

const { value: formConfirmPassword, errorMessage: confirmPasswordError, meta: confirmPasswordMeta } = useField(
  "confirmPassword",
  (value: string) => {
    if (!isLoginMode.value) {
      if (!value) return "Підтвердіть пароль";
      if (value !== formPassword.value) return "Паролі не співпадають";
    }
    return true;
  }
);

const login = async () => {
  serverError.value = "";
  loadingStore.set(true);

  try {
    await $appwrite.account.createEmailPasswordSession({
      email: formEmail.value,
      password: formPassword.value,
    });

    const userDetails = await $appwrite.account.get();

    authStore.setUser({
      email: userDetails.email,
      name: userDetails.name,
      status: true,
    });

    await navigateTo("/");
  } catch (error: any) {
    serverError.value = "Неправильний email або пароль";
  } finally {
    loadingStore.set(false);
  }
};

const register = async () => {
  serverError.value = "";
  loadingStore.set(true);
  try {
    const customUserId = uuidv4();
    const cleanEmail = formEmail.value.trim().toLowerCase();

    await $appwrite.account.create({
      userId: customUserId,
      email: cleanEmail,
      password: formPassword.value,
      name: formName.value,
    });

    await $appwrite.account.createEmailPasswordSession({
      email: cleanEmail,
      password: formPassword.value,
    });

    const userDetails = await $appwrite.account.get();
    authStore.setUser({
      email: userDetails.email,
      name: userDetails.name,
      status: true,
    });

    await navigateTo("/");
  } catch (error: any) {
    serverError.value = error.message || "Помилка реєстрації";
  } finally {
    loadingStore.set(false);
  }
};

const demoLogin = async () => {
  serverError.value = "";
  formEmail.value = "test@gmail.com";
  formPassword.value = "12345678";
  await login();
};

const onSubmit = handleValidSubmit(() => {
  serverError.value = "";
  if (isLoginMode.value) {
    login();
  } else {
    register();
  }
});

watch(isLoginMode, () => {
  serverError.value = "";
  resetForm();
});
</script>

<style lang="css" scoped>
/* Центрування карти по центру екрану */
.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background-color: var(--bg-primary);
  padding: 20px;
}

/* Картка форми */
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

/* Контейнер для інпуту з іконкою */
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

/* Стиль полів вводу */
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

/* Ефекти фокусу на інпуті */
.auth-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 15%, transparent);
  background-color: var(--bg-primary);
}

/* Підсвічуємо іконку, коли інпут в активному стані */
.auth-input:focus ~ .input-icon,
.input-group:focus-within .input-icon {
  color: var(--accent-primary);
}

/* Головна кнопка (Вхід / Реєстрація) */
.btn-primary {
  width: 100%;
  padding: 14px;
  background: var(--accent-gradient);
  border: none;
  border-radius: 10px;
  color: #ffffff;
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

/* Блок перемикання режимів */
.auth-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-muted);
}

/* Демо-вхід */
.demo-login-wrapper {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
}

.btn-demo {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px dashed var(--border-secondary);
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-demo:hover:not(:disabled) {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: color-mix(in srgb, var(--accent-primary) 5%, transparent);
}

.btn-demo:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.demo-icon {
  font-size: 18px;
}

/* Демо-вхід */
.demo-login-wrapper {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
}

.btn-demo {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px dashed var(--border-secondary);
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-demo:hover:not(:disabled) {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: color-mix(in srgb, var(--accent-primary) 5%, transparent);
}

.btn-demo:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.demo-icon {
  font-size: 18px;
}

/* Кнопка-посилання */
.btn-link {
  background: none;
  border: none;
  color: var(--accent-secondary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  transition: color 0.2s ease;
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

.input-wrapper .auth-input {
  padding-right: 44px;
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

.forgot-password-link {
  text-align: right;
  margin-top: -12px;
}

.forgot-link {
  color: var(--accent-secondary);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--text-accent);
  text-decoration: underline;
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

  .forgot-password-link {
    text-align: center;
    margin-top: -8px;
  }

  .btn-demo {
    padding: 14px;
    min-height: 48px;
    font-size: 14px;
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

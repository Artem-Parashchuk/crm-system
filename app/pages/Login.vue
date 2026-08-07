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
            {{ isLoginMode ? "Зареєстроватися" : "Увійти" }}
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
  background-color: #0b0714; /* Наш фірмовий глибокий фон */
  padding: 20px;
}

/* Картка форми */
.auth-card {
  background-color: #140e24; /* Світліша фіолетова підкладка */
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
  color: #64748b;
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
  padding: 14px 16px 14px 44px; /* Робимо відступ зліва для іконки */
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 10px;
  color: #e2daf5;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
}

/* Ефекти фокусу на інпуті */
.auth-input:focus {
  border-color: #8b5cf6; /* Підсвічування неоновим фіолетовим */
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  background-color: #0e091a;
}

/* Підсвічуємо іконку, коли інпут в активному стані */
.auth-input:focus ~ .input-icon,
.input-group:focus-within .input-icon {
  color: #8b5cf6;
}

/* Головна кнопка (Вхід / Реєстрація) */
.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(
    135deg,
    #8b5cf6 0%,
    #d946ef 100%
  ); /* Трендовий градієнт */
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

/* Блок перемикання режимів */
.auth-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 14px;
  color: #94a3b8;
}

/* Кнопка-посилання */
.btn-link {
  background: none;
  border: none;
  color: #a78bfa;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  transition: color 0.2s ease;
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

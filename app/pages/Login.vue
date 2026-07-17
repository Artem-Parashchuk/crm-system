<template>
  <div class="auth-wrapper">
    <Loader v-if="loadingStore.isLoading" />

    <div class="auth-card">
      <h1 class="auth-title">
        {{ isLoginMode ? "Вхід у систему" : "Реєстрація" }}
      </h1>
      <p class="auth-subtitle">
        Будь ласка, введіть свої дані для доступу до CRM
      </p>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="!isLoginMode" class="input-group">
          <Icon name="material-symbols:person-outline" class="input-icon" />
          <input
            v-model="formName"
            placeholder="Ваше ім'я"
            type="text"
            class="auth-input"
            required
          />
        </div>

        <div class="input-group">
          <Icon name="material-symbols:mail-outline" class="input-icon" />
          <input
            v-model="formEmail"
            placeholder="Email"
            type="email"
            class="auth-input"
            required
          />
        </div>

        <div class="input-group">
          <Icon name="material-symbols:lock-outline" class="input-icon" />
          <input
            v-model="formPassword"
            placeholder="Пароль"
            type="password"
            class="auth-input"
            required
          />
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
import { ref } from "vue";
import { useAuthStore, useIsLoadingStore } from "~/store/auth.store";

const isLoginMode = ref(true);
const formEmail = ref("");
const formName = ref("");
const formPassword = ref("");

const { $appwrite } = useNuxtApp();
const authStore = useAuthStore();
const loadingStore = useIsLoadingStore();

// 1. МЕТОД ДЛЯ ВХОДУ (LOGIN)
const login = async () => {
  loadingStore.set(true);

  try {
    // ЗВЕРНИ УВАГУ: тут круглі дужки (), а всередині фігурні {} — це ОБ'ЄКТ
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
  } catch (error) {
    console.error(error);
    alert("Неправильний email або пароль");
  } finally {
    loadingStore.set(false);
  }
};

// 2. МЕТОД ДЛЯ РЕЄСТРАЦІЇ (REGISTER)
const register = async () => {
  loadingStore.set(true);
  try {
    // Генеруємо гарантовано унікальний ID засобами браузера, щоб не залежати від імпортів
    const customUserId = uuidv4();
    const cleanEmail = formEmail.value.trim().toLowerCase();

    await $appwrite.account.create({
      userId: customUserId,
      email: cleanEmail, // тепер пошта гарантовано чиста, маленькими літерами
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
    console.error("Повна помилка Appwrite:", error);

    // Виводимо точне повідомлення від сервера Appwrite
    alert(`Помилка від Appwrite: ${error.message} (Код: ${error.code})`);
  } finally {
    loadingStore.set(false);
  }
};

// 3. ГОЛОВНИЙ ДИСПЕТЧЕР ФОРМИ
const handleSubmit = () => {
  if (isLoginMode.value) {
    login();
  } else {
    register();
  }
};
</script>

<style lang="css" scoped>
/* Центрування карти по центру екрану */
.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
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
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 20px;
  color: #64748b;
  pointer-events: none;
  transition: color 0.2s ease;
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
</style>

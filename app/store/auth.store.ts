import { defineStore } from "pinia";

// Інтерфейс для користувача
interface AuthUser {
  email: string;
  name: string;
  status: boolean;
}

// Функція, яка ЗАВЖДИ повертає новий чистий об'єкт (уникаємо мутації посилань)
const createDefaultUser = (): AuthUser => ({
  email: "",
  name: "",
  status: false,
});

// 1. Стор Авторизації Користувача
export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: createDefaultUser(),
  }),

  getters: {
    // Повертає true, якщо користувач авторизований
    isAuth: (state) => state.user.status,
  },

  actions: {
    // Повне скидання даних (наприклад, при виході з CRM)
    clear() {
      this.user = createDefaultUser();
    },
    // Запис даних користувача після успішного входу через Appwrite
    setUser(input: AuthUser) {
      this.user = input; // Пряме присвоєння в Pinia працює чудово й без $patch
    },
  },
});

// 2. Стор Глобального завантаження (Лоадер)
export const useIsLoadingStore = defineStore("isLoading", {
  state: () => ({
    isLoading: false, // За замовчуванням фальш, щоб користувач одразу бачив форму
  }),

  actions: {
    set(data: boolean) {
      this.isLoading = data;
    },
  },
});
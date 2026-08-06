<template>
  <ClientOnly>
    <div class="settings-wrapper">
      <div class="settings-card">
        <div class="settings-header">
          <h1 class="settings-title">Налаштування</h1>
          <p class="settings-subtitle">Керування профілем та системою</p>
        </div>

        <!-- Секція 1: Профіль -->
        <div class="settings-section">
          <h2 class="section-title">
            <Icon name="material-symbols:person-outline" class="section-icon" />
            Профіль користувача
          </h2>

          <div class="profile-info">
            <div class="profile-field">
              <span class="profile-label">Email</span>
              <span class="profile-value">{{ authStore.user.email }}</span>
            </div>

            <div class="profile-field">
              <span class="profile-label">Ім'я</span>
              <div v-if="!isEditingName" class="profile-value-wrapper">
                <span class="profile-value">{{ authStore.user.name }}</span>
                <button class="btn-edit" @click="startEditName">
                  <Icon name="material-symbols:edit-outline" />
                </button>
              </div>
              <div v-else class="profile-edit-wrapper">
                <input
                  v-model="newName"
                  type="text"
                  class="settings-input"
                  placeholder="Нове ім'я"
                />
                <div class="profile-edit-actions">
                  <button
                    class="btn-primary btn-sm"
                    @click="updateName()"
                    :disabled="isNamePending || !newName.trim()"
                  >
                    <span v-if="isNamePending" class="btn-spinner"></span>
                    {{ isNamePending ? "Збереження..." : "Зберегти" }}
                  </button>
                  <button class="btn-secondary btn-sm" @click="cancelEditName">
                    Скасувати
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Секція 2: Пароль -->
        <div class="settings-section">
          <h2 class="section-title">
            <Icon name="material-symbols:lock-outline" class="section-icon" />
            Зміна паролю
          </h2>

          <form class="settings-form" @submit.prevent="updatePassword()">
            <div class="form-group">
              <label class="form-label">Старий пароль</label>
              <div class="input-wrapper">
                <input
                  v-model="oldPassword"
                  :type="showOldPassword ? 'text' : 'password'"
                  class="settings-input"
                  placeholder="Введіть старий пароль"
                  required
                />
                <button
                  type="button"
                  class="btn-toggle-password"
                  @click="showOldPassword = !showOldPassword"
                >
                  <Icon
                    :name="
                      showOldPassword
                        ? 'material-symbols:visibility-off'
                        : 'material-symbols:visibility'
                    "
                  />
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Новий пароль</label>
              <div class="input-wrapper">
                <input
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  class="settings-input"
                  placeholder="Мінімум 8 символів"
                  minlength="8"
                  required
                />
                <button
                  type="button"
                  class="btn-toggle-password"
                  @click="showNewPassword = !showNewPassword"
                >
                  <Icon
                    :name="
                      showNewPassword
                        ? 'material-symbols:visibility-off'
                        : 'material-symbols:visibility'
                    "
                  />
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Підтвердження паролю</label>
              <input
                v-model="confirmPassword"
                type="password"
                class="settings-input"
                placeholder="Повторіть новий пароль"
                required
              />
            </div>

            <button
              type="submit"
              class="btn-primary"
              :disabled="isPasswordPending || !isPasswordFormValid"
            >
              <span v-if="isPasswordPending" class="btn-spinner"></span>
              {{ isPasswordPending ? "Зміна..." : "Змінити пароль" }}
            </button>
          </form>
        </div>

        <!-- Секція 3: Email -->
        <div class="settings-section">
          <h2 class="section-title">
            <Icon name="material-symbols:mail-outline" class="section-icon" />
            Зміна email
          </h2>

          <form class="settings-form" @submit.prevent="updateEmail()">
            <div class="form-group">
              <label class="form-label">Новий email</label>
              <input
                v-model="newEmail"
                type="email"
                class="settings-input"
                placeholder="new@example.com"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Поточний пароль</label>
              <input
                v-model="emailPassword"
                type="password"
                class="settings-input"
                placeholder="Для підтвердження"
                required
              />
            </div>

            <button
              type="submit"
              class="btn-primary"
              :disabled="isEmailPending || !newEmail || !emailPassword"
            >
              <span v-if="isEmailPending" class="btn-spinner"></span>
              {{ isEmailPending ? "Зміна..." : "Змінити email" }}
            </button>
          </form>
        </div>

        <!-- Секція 4: Статистика -->
        <div class="settings-section">
          <h2 class="section-title">
            <Icon name="material-symbols:bar-chart" class="section-icon" />
            Статистика системи
          </h2>

          <div class="stats-grid">
            <div v-for="stat in STATS_CONFIG" :key="stat.key" class="stat-card">
              <div class="stat-icon-wrapper">
                <Icon :name="stat.icon" class="stat-icon" />
              </div>
              <div class="stat-info">
                <span class="stat-label">{{ stat.label }}</span>
                <span class="stat-value">
                  <span
                    v-if="statsLoading(stat.key)"
                    class="stat-spinner"
                  ></span>
                  <span v-else>{{ getStatsTotal(stat.key) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Повідомлення -->
        <Transition name="fade">
          <div
            v-if="message.text"
            :class="['message', `message--${message.type}`]"
          >
            <Icon
              :name="
                message.type === 'success'
                  ? 'material-symbols:check-circle'
                  : 'material-symbols:error'
              "
            />
            {{ message.text }}
          </div>
        </Transition>
      </div>
    </div>
    <template #fallback>
      <div class="settings-wrapper">
        <div class="settings-card">
          <div class="settings-header">
            <h1 class="settings-title">Налаштування</h1>
            <p class="settings-subtitle">Завантаження...</p>
          </div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useAuthStore } from "~/store/auth.store";
import { STATS_CONFIG } from "~/data/settings-stats.data";

const { $appwrite } = useNuxtApp();
const config = useRuntimeConfig();
const authStore = useAuthStore();

// Стан форм
const isEditingName = ref(false);
const newName = ref("");
const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const newEmail = ref("");
const emailPassword = ref("");

// Toggle видимості паролю
const showOldPassword = ref(false);
const showNewPassword = ref(false);

// Стан завантаження для кожної мутації
const isNamePending = ref(false);
const isPasswordPending = ref(false);
const isEmailPending = ref(false);

// Повідомлення
const message = ref<{ type: "success" | "error"; text: string }>({
  type: "success",
  text: "",
});

// Валідація форми паролю
const isPasswordFormValid = computed(() => {
  return (
    oldPassword.value.length >= 8 &&
    newPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value
  );
});

// Показати повідомлення з автоочищенням
const showMessage = (type: "success" | "error", text: string) => {
  message.value = { type, text };
  setTimeout(() => {
    message.value.text = "";
  }, 3000);
};

// Редагування імені
const startEditName = () => {
  newName.value = authStore.user.name;
  isEditingName.value = true;
};

const cancelEditName = () => {
  isEditingName.value = false;
  newName.value = "";
};

// Зміна імені
const updateName = async () => {
  if (!newName.value.trim()) return;

  isNamePending.value = true;
  try {
    const user = await $appwrite.account.updateName({ name: newName.value });
    authStore.setUser({
      email: user.email,
      name: user.name,
      status: true,
    });
    isEditingName.value = false;
    showMessage("success", "Ім'я успішно оновлено");
  } catch (error: any) {
    showMessage("error", error.message || "Помилка при зміні імені");
  } finally {
    isNamePending.value = false;
  }
};

// Зміна паролю
const updatePassword = async () => {
  if (!isPasswordFormValid.value) return;

  isPasswordPending.value = true;
  try {
    if (newPassword.value !== confirmPassword.value) {
      throw new Error("Паролі не співпадають");
    }
    await $appwrite.account.updatePassword({
      password: newPassword.value,
      oldPassword: oldPassword.value,
    });
    oldPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    showMessage("success", "Пароль успішно змінено");
  } catch (error: any) {
    showMessage("error", error.message || "Помилка при зміні паролю");
  } finally {
    isPasswordPending.value = false;
  }
};

// Зміна email
const updateEmail = async () => {
  if (!newEmail.value || !emailPassword.value) return;

  isEmailPending.value = true;
  try {
    const user = await $appwrite.account.updateEmail({
      email: newEmail.value,
      password: emailPassword.value,
    });
    authStore.setUser({
      email: user.email,
      name: user.name,
      status: true,
    });
    newEmail.value = "";
    emailPassword.value = "";
    showMessage("success", "Email змінено. Перевірте пошту для підтвердження");
  } catch (error: any) {
    showMessage("error", error.message || "Помилка при зміні email");
  } finally {
    isEmailPending.value = false;
  }
};

// Статистика: запити до колекцій
const statsQueries: Record<string, ReturnType<typeof useQuery>> = {};
STATS_CONFIG.forEach((stat) => {
  const collectionId = (config.public as any)[stat.collectionKey];
  statsQueries[stat.key] = useQuery({
    queryKey: ["stats", stat.key],
    queryFn: async () => {
      if (!config.public.dbId || !collectionId) {
        throw new Error("Appwrite config missing");
      }
      const result = await $appwrite.databases.listDocuments(
        config.public.dbId,
        collectionId,
        [],
      );
      return result.total;
    },
    staleTime: 60000,
  });
});

const statsLoading = (key: string) => {
  return statsQueries[key]?.isLoading.value ?? true;
};

const getStatsTotal = (key: string) => {
  return statsQueries[key]?.data.value ?? 0;
};
</script>

<style scoped>
.settings-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  padding: 20px;
}

.settings-card {
  background-color: #140e24;
  border: 1px solid #2b1f47;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 720px;
  box-shadow:
    0 20px 40px rgba(5, 3, 10, 0.8),
    0 1px 3px rgba(139, 92, 246, 0.1);
}

.settings-header {
  text-align: center;
  margin-bottom: 32px;
}

.settings-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.settings-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.settings-section {
  padding-top: 24px;
  border-top: 1px solid #2b1f47;
  margin-top: 24px;
}

.settings-section:first-of-type {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #e2daf5;
  margin: 0 0 20px 0;
}

.section-icon {
  font-size: 22px;
  color: #8b5cf6;
}

/* Профіль */
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-value {
  font-size: 15px;
  color: #e2daf5;
  font-weight: 600;
}

.profile-value-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-edit-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-edit-actions {
  display: flex;
  gap: 8px;
}

.btn-edit {
  background: none;
  border: none;
  color: #8b5cf6;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.btn-edit:hover {
  color: #a78bfa;
}

.btn-edit svg {
  font-size: 18px;
}

/* Форми */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.settings-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  color: #e2daf5;
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 8px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.settings-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.settings-input::placeholder {
  color: #64748b;
}

.input-wrapper {
  position: relative;
}

.btn-toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.btn-toggle-password:hover {
  color: #8b5cf6;
}

.btn-toggle-password svg {
  font-size: 20px;
}

/* Кнопки */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  background-color: #1e1b2e;
  border: 1px solid #2b1f47;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-secondary:hover {
  background-color: #2b1f47;
  color: #e2daf5;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 12px;
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.stat-card:hover {
  border-color: #8b5cf6;
  transform: translateY(-2px);
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
  border-radius: 12px;
}

.stat-icon {
  font-size: 24px;
  color: #ffffff;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  min-height: 28px;
}

.stat-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Повідомлення */
.message {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.message--success {
  background-color: #10b981;
  color: #ffffff;
}

.message--error {
  background-color: #ef4444;
  color: #ffffff;
}

.message svg {
  font-size: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Адаптивність */
@media (max-width: 768px) {
  .settings-card {
    padding: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
  }
}
</style>

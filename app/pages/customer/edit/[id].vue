якщо <template>
  <div class="edit-customer-container">
    <div class="edit-card">
      <!-- Заголовок сторінки -->
      <div class="card-header">
        <h1>
          Редагування компанії:
          <span class="highlight">{{ values.name || "Завантаження..." }}</span>
        </h1>
        <p class="subtitle">
          Змініть необхідні дані клієнта та збережіть зміни
        </p>
      </div>

      <!-- Використовуємо ClientOnly, щоб уникнути Hydration Mismatch -->
      <ClientOnly>
        <!-- Стан завантаження первинних даних -->
        <div v-if="isLoading" class="loader-state">
          <div class="spinner"></div>
          <p>Отримання інформації з бази даних...</p>
        </div>

        <!-- Форма редагування -->
        <form v-else @submit.prevent="onSubmit" class="edit-form">
          <!-- Блок завантаження логотипу компанії -->
          <div class="form-group avatar-upload-section">
            <label>Логотип компанії</label>
            <div class="avatar-container">
              <div class="avatar-preview-wrapper">
                <img
                  v-if="values.avatar_url && !isUploadImagePending"
                  :src="values.avatar_url"
                  alt="Лого Компанії"
                  class="avatar-preview"
                />
                <div
                  v-else-if="isUploadImagePending"
                  class="avatar-spinner-wrapper"
                >
                  <div class="btn-spinner accent"></div>
                </div>
                <div v-else class="avatar-placeholder">
                  <span>Лого</span>
                </div>
              </div>

              <div class="upload-controls">
                <label
                  for="logo-file"
                  class="btn-upload"
                  :class="{ disabled: isUploadImagePending }"
                >
                  {{ isUploadImagePending ? "Завантаження..." : "Обрати файл" }}
                </label>
                <input
                  id="logo-file"
                  type="file"
                  accept="image/*"
                  @change="handleFileChange"
                  :disabled="isUploadImagePending"
                  class="hidden-file-input"
                />
                <p class="file-hint">
                  Підтримуються формати PNG, JPG або SVG (до 2MB)
                </p>
              </div>
            </div>
          </div>

          <!-- Решта полів форми ... -->
          <div class="form-group">
            <label for="name">Назва компанії</label>
            <input
              id="name"
              type="text"
              v-model="name"
              v-bind="nameAttrs"
              placeholder="Наприклад: ТОВ 'Вектор'"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="email">Email адреса</label>
            <input
              id="email"
              type="email"
              v-model="email"
              v-bind="emailAttrs"
              placeholder="example@company.com"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="fromSource">Звідки прийшов клієнт</label>
            <input
              id="fromSource"
              type="text"
              v-model="fromSource"
              v-bind="fromSourceAttrs"
              placeholder="Наприклад: Instagram, Рекомендація"
              class="form-input"
            />
          </div>

          <!-- Кнопки дій -->
          <div class="form-actions">
            <NuxtLink to="/customer" class="btn-secondary">
              Скасувати
            </NuxtLink>
            <button type="submit" :disabled="isPending" class="btn-primary">
              <span v-if="isPending" class="btn-spinner"></span>
              {{ isPending ? "Збереження..." : "Зберегти зміни" }}
            </button>
          </div>
        </form>

        <!-- Запасний інтерфейс на час ініціалізації клієнтської частини (fallback) -->
        <template #fallback>
          <div class="loader-state">
            <div class="spinner"></div>
            <p>Завантаження форми...</p>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useForm } from "vee-validate";
import { v4 as uuid } from "uuid";
import type { ICustomer } from "~/types/deals.types";

const { $appwrite } = useNuxtApp();
const config = useRuntimeConfig();
const queryClient = useQueryClient();

const databaseId = config.public.dbId;
const collectionCustomers = config.public.collectionCustomers;

interface ICustomerFromState extends Pick<
  ICustomer,
  "avatar_url" | "email" | "name" | "from_source"
> {}

useSeoMeta({
  title: "Редагувати компанію",
});

// Отримуємо правильний ID з роуту
const route = useRoute();
const routerId = route.params.id as string;

// Ініціалізуємо форму (отримуємо setFieldValue для збереження лінка на картинку у формі)
const { handleSubmit, defineField, setValues, setFieldValue, values } =
  useForm<ICustomerFromState>();

// 1. Отримуємо дані про клієнта з бази
const { data, isSuccess, isLoading } = useQuery({
  queryKey: ["get customer", routerId],
  queryFn: async () => {
    if (!databaseId || !collectionCustomers) {
      throw new Error("Appwrite configuration missing");
    }
    return await $appwrite.databases.getDocument(
      databaseId,
      collectionCustomers,
      routerId,
    );
  },
});

// 2. Слідкуємо за успішним запитом та заповнюємо форму первинними даними
watch(
  isSuccess,
  (success) => {
    if (success && data.value) {
      const initialData = data.value as unknown as ICustomer;
      setValues({
        email: initialData.email,
        avatar_url: initialData.avatar_url || "",
        from_source: initialData.from_source || "",
        name: initialData.name,
      });
    }
  },
  { immediate: true },
);

// Визначаємо реактивні поля форми
const [name, nameAttrs] = defineField("name");
const [email, emailAttrs] = defineField("email");
const [fromSource, fromSourceAttrs] = defineField("from_source");

// 3. Мутація для завантаження файлу в Appwrite Storage
const { mutate: uploadImg, isPending: isUploadImagePending } = useMutation({
  mutationKey: ["upload image"],
  mutationFn: async (file: File) => {
    const bucketId = config.public.storageId;

    if (!bucketId) {
      throw new Error("Storage Bucket ID is missing in runtimeConfig!");
    }

    return await $appwrite.storage.createFile(bucketId, $appwrite.ID.unique(), file);
  },
  onSuccess: (uploadedFile) => {
    const bucketId = config.public.storageId;

    // Використовуємо getFileView замість getFileDownload для відображення в тегу <img>
    const fileUrl = $appwrite.storage.getFileView(bucketId, uploadedFile.$id);

    // Явно перетворюємо URL-об'єкт на рядок через .toString() або .href
    const finalUrl = fileUrl.toString();

    console.log("Згенероване посилання на логотип:", finalUrl);

    // Записуємо рядок у форму
    setFieldValue("avatar_url", finalUrl);
  },
  onError: (error) => {
    console.error("Помилка при завантаженні зображення в Appwrite:", error);
  },
});

// Обробка вибору файлу з інпуту
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    uploadImg(target.files[0]);
  }
};

// 4. Мутація для оновлення даних в Appwrite Databases
const { mutate, isPending } = useMutation({
  mutationKey: ["update customer", routerId],
  mutationFn: async (updatedData: ICustomerFromState) => {
    if (!databaseId || !collectionCustomers) {
      throw new Error("Appwrite configuration missing");
    }
    return await $appwrite.databases.updateDocument(
      databaseId,
      collectionCustomers,
      routerId,
      {
        name: updatedData.name,
        email: updatedData.email,
        from_source: updatedData.from_source,
        avatar_url: updatedData.avatar_url,
      },
    );
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    navigateTo("/customer");
  },
  onError: (error) => {
    console.error("Помилка під час оновлення клієнта:", error);
  },
});

// Сабміт форми
const onSubmit = handleSubmit((formValues) => {
  mutate(formValues);
});
</script>

<style scoped>
.edit-customer-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100%;
  background-color: #0b0714;
  padding: 2rem;
}

.edit-card {
  width: 100%;
  max-width: 600px;
  background: #140e24;
  border: 1px solid #2b1f47;
  border-radius: 16px;
  box-shadow:
    0 20px 40px rgba(5, 3, 10, 0.8),
    0 1px 3px rgba(139, 92, 246, 0.1);
  padding: 2.5rem;
}

.card-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #2b1f47;
  padding-bottom: 1.5rem;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.highlight {
  color: #8b5cf6;
}

.subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2daf5;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid #2b1f47;
  border-radius: 8px;
  background-color: #0b0714;
  color: #e2daf5;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  font-family: "Lato", sans-serif;
}

.form-input::placeholder {
  color: #64748b;
}

.form-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Секція завантаження аватара */
.avatar-upload-section {
  border-bottom: 1px solid #2b1f47;
  padding-bottom: 1.5rem;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.avatar-preview-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #2b1f47;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0b0714;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.avatar-spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-controls {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.btn-upload {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;
  text-align: center;
}

.btn-upload:hover {
  background-color: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
  color: #e2daf5;
}

.btn-upload.disabled {
  background-color: #0b0714;
  color: #4a3870;
  cursor: not-allowed;
  border-color: #2b1f47;
}

.hidden-file-input {
  display: none;
}

.file-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #2b1f47;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #94a3b8;
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 8px;
  text-decoration: none;
  transition:
    background-color 0.2s,
    border-color 0.2s;
  text-align: center;
}

.btn-secondary:hover {
  background-color: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
  color: #e2daf5;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.2s;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-primary:disabled {
  background: #2b1f47;
  cursor: not-allowed;
  box-shadow: none;
}

/* Стан завантаження первинних даних */
.loader-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #94a3b8;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(139, 92, 246, 0.2);
  border-top: 4px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.btn-spinner.accent {
  border-top-color: #8b5cf6;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

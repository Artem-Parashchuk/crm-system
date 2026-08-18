<template>
  <div class="customers-wrapper">
    <div class="customers-page">
      <div class="header-row">
        <div>
          <h1>
            Клієнти
            <span class="counter">({{ customers.length }})</span>
          </h1>
          <p class="subtitle">Управління вашими клієнтами та їхніми даними</p>
        </div>
      </div>

      <div class="search-bar">
        <Icon name="material-symbols:search" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Пошук за назвою або email..."
          class="search-input"
        />
      </div>

      <div v-if="isLoading" class="loader-state">
        <div class="spinner"></div>
        <span>Завантаження даних...</span>
      </div>

      <div v-else class="customers-table">
        <div class="table-header">
          <p>Зображення</p>
          <p>Назва</p>
          <p>Email</p>
          <p>Звідки прийшов</p>
        </div>

        <div v-if="customers?.length" class="table-body">
          <NuxtLink
            v-for="customer in customers"
            :key="customer.$id"
            :to="`/customer/edit/${customer.$id}`"
            class="table-row"
          >
            <div class="cell-avatar">
              <NuxtImg
                :src="customer.avatar_url || '/no-avatar.png'"
                :alt="customer.name"
                width="50"
                height="50"
                class="avatar-img"
              />
            </div>
            <p class="cell-text font-bold">{{ customer.name }}</p>
            <p class="cell-text">{{ customer.email }}</p>
            <p class="cell-text">
              <span class="source-tag">{{
                customer.from_source || "Невідомо"
              }}</span>
            </p>
          </NuxtLink>
        </div>

        <div v-else class="empty-state">
          <Icon name="material-symbols:inbox" class="empty-icon" />
          <p>
            {{
              searchQuery.trim()
                ? "Клієнтів не знайдено за вашим запитом"
                : "Клієнтів не знайдено"
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { ICustomer } from "~/types/deals.types";

const { $appwrite } = useNuxtApp();
const config = useRuntimeConfig();

const databaseId = config.public.dbId;
const collectionCustomers = config.public.collectionCustomers;

const searchQuery = ref("");

const { data, isLoading } = useQuery({
  queryKey: ["customers"],
  queryFn: async () => {
    if (!databaseId || !collectionCustomers) {
      throw new Error("Appwrite config for customers is missing");
    }
    return await $appwrite.databases.listDocuments(
      databaseId,
      collectionCustomers,
    );
  },
});

const customers = computed(() => {
  const allCustomers = (data.value?.documents as unknown as ICustomer[]) || [];

  if (!searchQuery.value.trim()) {
    return allCustomers;
  }

  const query = searchQuery.value.trim().toLowerCase();
  return allCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query),
  );
});
</script>

<style scoped lang="css">
.customers-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  padding: 20px;
}
.customers-page {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  box-shadow: var(--shadow-card);
  width: 100%;
  padding: 20px;
}
.customers-page {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  box-shadow: var(--shadow-card);
}

.header-row {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.counter {
  font-size: 1.25rem;
  color: var(--accent-primary);
  font-weight: 600;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.search-bar {
  position: relative;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  transition: all 0.2s;
  font-family: "Lato", sans-serif;
}

.search-input::placeholder {
  color: var(--text-subtle);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--accent-primary) 10%, transparent);
}

.loader-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-muted);
  text-align: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid color-mix(in srgb, var(--accent-primary) 20%, transparent);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.customers-table {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.table-header {
  display: grid;
  grid-template-columns: 100px repeat(3, 1fr);
  background-color: var(--bg-primary);
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-primary);
}

.table-header p {
  margin: 0;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 100px repeat(3, 1fr);
  padding: 0.75rem 1rem;
  align-items: center;
  border-bottom: 1px solid var(--border-primary);
  transition: all 0.2s;
  text-decoration: none;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: color-mix(in srgb, var(--accent-primary) 10%, transparent);
  border-color: var(--accent-primary);
}

.cell-avatar {
  display: flex;
  align-items: center;
}

.avatar-img {
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-primary);
  box-shadow: 0 0 0 2px var(--accent-primary);
}

.cell-text {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
}

.font-bold {
  font-weight: 600;
  color: var(--text-primary);
}

.source-tag {
  display: inline-block;
  color: var(--text-secondary);
  background-color: color-mix(in srgb, var(--accent-primary) 10%, transparent);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.85rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-muted);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
}

@media (max-width: 768px) {
  .customers-page {
    padding: 1rem;
  }

  .header-row {
    text-align: center;
    gap: 12px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr;
  }

  .table-header p:nth-child(3),
  .table-header p:nth-child(4),
  .table-row .cell-text:nth-child(3),
  .table-row .cell-text:nth-child(4) {
    display: none;
  }

  .search-bar {
    max-width: 100%;
  }

  h1 {
    font-size: 1.5rem;
  }
}
@media (max-width: 480px) {
  .customers-wrapper {
    padding: 8px;
  }
  .customers-page {
    padding: 8px;
  }
  .table-header {
    grid-template-columns: 105px 1fr;
  }
}
</style>

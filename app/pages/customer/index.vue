<template>
  <div class="customers-page">
    <h1>Клієнти</h1>
    
    <div v-if="isLoading" class="loader">Завантаження даних...</div>
    
    <div v-else class="customers-table">
      <div class="table-header">
        <p>Зображення</p>
        <p>Назва</p>
        <p>Email</p>
        <p>Звідки прийшов</p>
      </div>
      
      <div v-if="customers?.length" class="table-body">
        <!-- 
          ВИПРАВЛЕНО: Рядок тепер є компонентом NuxtLink.
          Він веде на сторінку редагування конкретного клієнта.
        -->
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
          <p class="cell-text source-tag">{{ customer.from_source || 'Невідомо' }}</p>
        </NuxtLink>
      </div>

      <div v-else class="empty-state">
        Клієнтів не знайдено.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { ICustomer } from "~/types/deals.types";

const { $appwrite } = useNuxtApp();
const config = useRuntimeConfig();

const databaseId = config.public.dbId;
// Виправлено: тепер використовуємо правильну колекцію клієнтів
const collectionCustomers = config.public.collectionCustomers; 

const { data, isLoading } = useQuery({
  queryKey: ["customers"],
  queryFn: async () => {
    if (!databaseId || !collectionCustomers) {
      throw new Error("Appwrite config for customers is missing");
    }
    // Виправлено: додано return для повернення промісу з Appwrite
    return await $appwrite.databases.listDocuments(databaseId, collectionCustomers);
  },
});

// Виправлено: загорнуто в computed для збереження реактивності у Vue 3
const customers = computed(() => {
  return (data.value?.documents as unknown as ICustomer[]) || [];
});
</script>

<style scoped>
.customers-page {
  padding: 2rem;
  background-color: #f9fafb;
  min-height: 100%;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

.customers-table {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 100px repeat(3, 1fr);
  background: #f3f4f6;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  border-bottom: 1px solid #e5e7eb;
}

.table-row {
  display: grid;
  grid-template-columns: 100px repeat(3, 1fr);
  padding: 0.75rem 1rem;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f9fafb;
}

.avatar-img {
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.cell-text {
  font-size: 0.95rem;
  color: #4b5563;
  margin: 0;
}

.font-bold {
  font-weight: 600;
  color: #111827;
}

.source-tag {
  display: inline-block;
  color: #2563eb;
  font-weight: 500;
}

.loader, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}
</style>
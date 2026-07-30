<template>
  <ClientOnly>
    <div class="company-wrapper">
      <div class="company-card">
        <div class="company-header">
          <button class="back-btn" @click="navigateTo('/services')">
            <Icon name="material-symbols:arrow-back" />
            До послуг
          </button>

          <div v-if="isLoading" class="company-loading">
            <div class="spinner"></div>
            <span>Завантаження...</span>
          </div>

          <template v-else-if="companyDeals.length">
            <div class="company-title-row">
              <div class="company-icon" :style="{ background: getColor(companyName) }">
                {{ companyName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h1 class="company-name">{{ companyName }}</h1>
                <p class="company-subtitle">{{ companyDeals.length }} {{ dealWord(companyDeals.length) }}</p>
              </div>
            </div>

            <div class="company-stats-row">
              <div class="company-stat">
                <span class="company-stat-value">{{ companyDeals.length }}</span>
                <span class="company-stat-label">Угод</span>
              </div>
              <div class="company-stat">
                <span class="company-stat-value">{{ formatPrice(totalPrice) }}</span>
                <span class="company-stat-label">Загальна сума</span>
              </div>
              <div class="company-stat">
                <span class="company-stat-value">{{ formatPrice(minPrice) }}</span>
                <span class="company-stat-label">Мінімум</span>
              </div>
              <div class="company-stat">
                <span class="company-stat-value">{{ formatPrice(maxPrice) }}</span>
                <span class="company-stat-label">Максимум</span>
              </div>
            </div>
          </template>
        </div>

        <div v-if="isLoading" class="company-loading">
          <div class="spinner"></div>
          <span>Завантаження угод...</span>
        </div>

        <div v-else-if="error" class="company-error">
          <Icon name="material-symbols:error" />
          <span>Помилка завантаження</span>
        </div>

        <div v-else-if="!companyDeals.length" class="company-empty">
          <Icon name="material-symbols:inbox" class="empty-icon" />
          <p>Угод для цієї компанії не знайдено</p>
        </div>

        <div v-else class="deals-grid">
          <div
            v-for="deal in companyDeals"
            :key="deal.$id"
            class="deal-card"
            @click="openDeal(deal)"
          >
            <div class="deal-card-header">
              <h3 class="deal-name">{{ deal.name }}</h3>
              <span
                class="deal-status"
                :class="'deal-status--' + deal.status"
              >
                {{ statusLabels[deal.status] || deal.status }}
              </span>
            </div>

            <div class="deal-card-body">
              <div class="deal-price">{{ formatPrice(deal.price) }}</div>
              <div class="deal-date">
                <Icon name="material-symbols:calendar-today" />
                {{ formatDate(deal.$createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <KanbanSlideover />
    </div>

    <template #fallback>
      <div class="company-wrapper">
        <div class="company-card">
          <div class="company-loading">
            <div class="spinner"></div>
            <span>Завантаження...</span>
          </div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { IDeal } from "~/types/deals.types";
import { getCompanyName, buildCustomerNameMap } from "~/utils/get-company-name";
import { useDealsSlideStore } from "~/store/deal-slide.store";

const route = useRoute();
const { $appwrite } = useNuxtApp();
const config = useRuntimeConfig();
const slideStore = useDealsSlideStore();

const customerId = route.params.customerId as string;

const dbId = config.public.dbId;
const collectionId = config.public.collectionDeals;
const customerCollectionId =
  (config.public as Record<string, string>).collectionCustomers || "customers";

const statusLabels: Record<string, string> = {
  todo: "Вхідні",
  "to-be-agreed": "На погодженні",
  "in-progress": "У виробництві",
  produced: "Виготовлено",
  done: "До відвантаження",
};

const { data, isLoading, error } = useQuery({
  queryKey: ["deals", "company", customerId],
  queryFn: async () => {
    const result = await $appwrite.databases.listDocuments(dbId, collectionId);
    const deals = result.documents as unknown as IDeal[];
    const customerNameMap = await buildCustomerNameMap($appwrite, dbId, customerCollectionId);

    const enriched = deals.map((deal) => ({
      deal,
      companyName: getCompanyName(deal, customerNameMap),
    }));

    return enriched.filter((item) => {
      const deal = item.deal as IDeal & { customer?: unknown };
      const customerRef = deal.customer;
      if (typeof customerRef === "string") return customerRef === customerId;
      if (customerRef && typeof customerRef === "object") {
        const obj = customerRef as Record<string, unknown>;
        return (obj.$id || obj.id) === customerId;
      }
      return false;
    });
  },
  staleTime: 60000,
});

const companyDeals = computed(() => data.value?.map((d) => d.deal) || []);
const companyName = computed(() => data.value?.[0]?.companyName || "Компанія");
const totalPrice = computed(() => companyDeals.value.reduce((sum, d) => sum + (d.price || 0), 0));
const minPrice = computed(() => companyDeals.value.length ? Math.min(...companyDeals.value.map((d) => d.price || 0)) : 0);
const maxPrice = computed(() => companyDeals.value.length ? Math.max(...companyDeals.value.map((d) => d.price || 0)) : 0);

const openDeal = (deal: IDeal) => {
  slideStore.set({
    id: deal.$id,
    name: deal.name,
    price: deal.price || 0,
    $createdAt: deal.$createdAt,
    companyName: companyName.value,
    status: deal.status,
  });
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const dealWord = (count: number): string => {
  const lastTwo = count % 100;
  const lastOne = count % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return "угод";
  if (lastOne === 1) return "угода";
  if (lastOne >= 2 && lastOne <= 4) return "угоди";
  return "угод";
};

const getColor = (name: string): string => {
  const colors = [
    "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
  ];
  const index = name.length % colors.length;
  return colors[index];
};
</script>

<style scoped>
.company-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  padding: 20px;
}

.company-card {
  background-color: #140e24;
  border: 1px solid #2b1f47;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 1200px;
  box-shadow:
    0 20px 40px rgba(5, 3, 10, 0.8),
    0 1px 3px rgba(139, 92, 246, 0.1);
}

.company-header {
  margin-bottom: 32px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  background: transparent;
  border: 1px solid #2b1f47;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.back-btn:hover {
  color: #e2daf5;
  border-color: #3e2d63;
}

.back-btn svg {
  font-size: 16px;
}

.company-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.company-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}

.company-name {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.company-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.company-stats-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.company-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 10px;
  min-width: 120px;
}

.company-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #e2daf5;
}

.company-stat-label {
  font-size: 12px;
  color: #94a3b8;
}

.company-loading,
.company-error,
.company-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #94a3b8;
  text-align: center;
}

.company-error {
  color: #ef4444;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.deals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.deal-card {
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.deal-card:hover {
  border-color: #8b5cf6;
  transform: translateY(-2px);
}

.deal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.deal-name {
  font-size: 15px;
  font-weight: 600;
  color: #e2daf5;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.deal-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.deal-status--todo {
  background-color: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.deal-status--to-be-agreed {
  background-color: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.deal-status--in-progress {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.deal-status--produced {
  background-color: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.deal-status--done {
  background-color: rgba(236, 72, 153, 0.2);
  color: #f472b6;
}

.deal-card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.deal-price {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.deal-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.deal-date svg {
  font-size: 14px;
}

@media (max-width: 768px) {
  .company-card {
    padding: 24px;
  }

  .deals-grid {
    grid-template-columns: 1fr;
  }

  .company-stats-row {
    flex-direction: column;
  }

  .company-stat {
    min-width: unset;
  }
}
</style>

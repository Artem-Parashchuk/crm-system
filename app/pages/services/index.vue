<template>
  <ClientOnly>
    <div class="services-wrapper">
      <div class="services-card">
        <div class="services-header">
          <h1 class="services-title">Послуги</h1>
          <p class="services-subtitle">Аналіз послуг та компаній на основі ваших угод</p>
        </div>

        <div class="tabs">
          <button
            class="tab-btn"
            :class="{ 'tab-btn--active': viewMode === 'services' }"
            @click="viewMode = 'services'"
          >
            По послугах
          </button>
          <button
            class="tab-btn"
            :class="{ 'tab-btn--active': viewMode === 'companies' }"
            @click="viewMode = 'companies'"
          >
            По компаніях
          </button>
        </div>

        <div v-if="isAnyLoading" class="services-loading">
          <div class="spinner"></div>
          <span>Завантаження даних...</span>
        </div>

        <div v-else-if="isAnyError" class="services-error">
          <Icon name="material-symbols:error" />
          <span>Помилка завантаження</span>
        </div>

        <template v-else>
          <div v-if="viewMode === 'services'">
            <div v-if="!servicesData?.length" class="services-empty">
              <Icon name="material-symbols:inbox" class="empty-icon" />
              <p>Наразі немає послуг</p>
              <p class="empty-hint">Створіть угоду на головній сторінці</p>
            </div>

            <div v-else class="services-content">
              <div class="sort-bar">
                <span class="sort-label">Сортувати:</span>
                <button
                  class="sort-btn"
                  :class="{ 'sort-btn--active': sortBy === 'name' }"
                  @click="toggleSort('name')"
                >
                  За назвою
                  <Icon
                    v-if="sortBy === 'name'"
                    :name="sortDir === 'asc' ? 'material-symbols:arrow-upward' : 'material-symbols:arrow-downward'"
                  />
                </button>
                <button
                  class="sort-btn"
                  :class="{ 'sort-btn--active': sortBy === 'date' }"
                  @click="toggleSort('date')"
                >
                  За часом
                  <Icon
                    v-if="sortBy === 'date'"
                    :name="sortDir === 'asc' ? 'material-symbols:arrow-upward' : 'material-symbols:arrow-downward'"
                  />
                </button>
                <button
                  class="sort-btn"
                  :class="{ 'sort-btn--active': sortBy === 'price' }"
                  @click="toggleSort('price')"
                >
                  За ціною
                  <Icon
                    v-if="sortBy === 'price'"
                    :name="sortDir === 'asc' ? 'material-symbols:arrow-upward' : 'material-symbols:arrow-downward'"
                  />
                </button>
              </div>

              <div class="services-grid">
                <div v-for="service in sortedServices" :key="service.name" class="service-card">
                  <div class="service-icon" :style="{ background: getColor(service.name) }">
                    {{ service.name.charAt(0).toUpperCase() }}
                  </div>

                  <div class="service-info">
                    <h3 class="service-name">{{ service.name }}</h3>

                    <div v-if="service.companies.length" class="service-companies">
                      <span
                        v-for="company in service.companies"
                        :key="company"
                        class="service-company-tag"
                      >
                        {{ company }}
                      </span>
                    </div>

                    <div class="service-stats">
                      <div class="stat-item">
                        <span class="stat-label">Угод:</span>
                        <span class="stat-value">{{ service.count }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Ціна:</span>
                        <span class="stat-value">{{ formatPrice(service.lastPrice) }}</span>
                      </div>
                    </div>

                    <div class="service-date">
                      <Icon name="material-symbols:calendar-today" />
                      <span>Остання: {{ formatDate(service.latestDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <div v-if="!companiesData?.length" class="services-empty">
              <Icon name="material-symbols:business-center" class="empty-icon" />
              <p>Наразі немає компаній</p>
              <p class="empty-hint">Створіть угоду з клієнтом на головній сторінці</p>
            </div>

            <div v-else class="services-content">
              <div class="sort-bar">
                <span class="sort-label">Сортувати:</span>
                <button
                  class="sort-btn"
                  :class="{ 'sort-btn--active': companySortBy === 'name' }"
                  @click="toggleCompanySort('name')"
                >
                  За назвою
                  <Icon
                    v-if="companySortBy === 'name'"
                    :name="companySortDir === 'asc' ? 'material-symbols:arrow-upward' : 'material-symbols:arrow-downward'"
                  />
                </button>
                <button
                  class="sort-btn"
                  :class="{ 'sort-btn--active': companySortBy === 'count' }"
                  @click="toggleCompanySort('count')"
                >
                  За кількістю
                  <Icon
                    v-if="companySortBy === 'count'"
                    :name="companySortDir === 'asc' ? 'material-symbols:arrow-upward' : 'material-symbols:arrow-downward'"
                  />
                </button>
                <button
                  class="sort-btn"
                  :class="{ 'sort-btn--active': companySortBy === 'total' }"
                  @click="toggleCompanySort('total')"
                >
                  За сумою
                  <Icon
                    v-if="companySortBy === 'total'"
                    :name="companySortDir === 'asc' ? 'material-symbols:arrow-upward' : 'material-symbols:arrow-downward'"
                  />
                </button>
                <button
                  class="sort-btn"
                  :class="{ 'sort-btn--active': companySortBy === 'date' }"
                  @click="toggleCompanySort('date')"
                >
                  За часом
                  <Icon
                    v-if="companySortBy === 'date'"
                    :name="companySortDir === 'asc' ? 'material-symbols:arrow-upward' : 'material-symbols:arrow-downward'"
                  />
                </button>
              </div>

              <div class="services-grid">
                <div
                  v-for="company in sortedCompanies"
                  :key="company.customerId"
                  class="service-card company-card"
                  @click="navigateToCompany(company.customerId)"
                >
                  <div class="service-icon" :style="{ background: getColor(company.name) }">
                    {{ company.name.charAt(0).toUpperCase() }}
                  </div>

                  <div class="service-info">
                    <h3 class="service-name">{{ company.name }}</h3>

                    <div class="service-stats">
                      <div class="stat-item">
                        <span class="stat-label">Угод:</span>
                        <span class="stat-value">{{ company.count }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Загальна сума:</span>
                        <span class="stat-value">{{ formatPrice(company.totalPrice) }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Від:</span>
                        <span class="stat-value">{{ formatPrice(company.minPrice) }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">До:</span>
                        <span class="stat-value">{{ formatPrice(company.maxPrice) }}</span>
                      </div>
                    </div>

                    <div class="service-date">
                      <Icon name="material-symbols:calendar-today" />
                      <span>Остання: {{ formatDate(company.latestDate) }}</span>
                    </div>
                  </div>

                  <div class="company-arrow">
                    <Icon name="material-symbols:chevron-right" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <template #fallback>
      <div class="services-wrapper">
        <div class="services-card">
          <div class="services-header">
            <h1 class="services-title">Послуги</h1>
            <p class="services-subtitle">Завантаження...</p>
          </div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { IDeal } from "~/types/deals.types";
import { getCompanyName, buildCustomerNameMap, getCustomerId } from "~/utils/get-company-name";

const { $appwrite } = useNuxtApp();
const config = useRuntimeConfig();

type ViewMode = "services" | "companies";
type SortField = "name" | "date" | "price";
type CompanySortField = "name" | "count" | "total" | "date";
type SortDir = "asc" | "desc";

const viewMode = ref<ViewMode>("services");
const sortBy = ref<SortField>("name");
const sortDir = ref<SortDir>("asc");
const companySortBy = ref<CompanySortField>("name");
const companySortDir = ref<SortDir>("asc");

const dbId = config.public.dbId;
const collectionId = config.public.collectionDeals;
const customerCollectionId =
  (config.public as Record<string, string>).collectionCustomers || "customers";

interface AggregatedService {
  name: string;
  count: number;
  lastPrice: number;
  latestDate: string;
  companies: string[];
}

interface AggregatedCompany {
  customerId: string;
  name: string;
  count: number;
  totalPrice: number;
  minPrice: number;
  maxPrice: number;
  latestDate: string;
}

const { data: rawDeals, isLoading: dealsLoading, error: dealsError } = useQuery({
  queryKey: ["deals", "services"],
  queryFn: async () => {
    if (!dbId || !collectionId) {
      throw new Error("Appwrite configuration missing");
    }

    const result = await $appwrite.databases.listDocuments(dbId, collectionId);
    const deals = result.documents as unknown as IDeal[];
    const customerNameMap = await buildCustomerNameMap($appwrite, dbId, customerCollectionId);

    const dealsWithCompany = deals.map((deal) => ({
      deal,
      companyName: getCompanyName(deal, customerNameMap),
      customerId: getCustomerId(deal) || "unknown",
    }));

    return dealsWithCompany;
  },
  staleTime: 60000,
});

const servicesData = computed<AggregatedService[]>(() => {
  if (!rawDeals.value) return [];

  const grouped: Record<string, {
    count: number;
    lastPrice: number;
    latestDate: string;
    companies: string[];
  }> = {};

  for (const { deal, companyName } of rawDeals.value) {
    const name = deal.name;

    if (!grouped[name]) {
      grouped[name] = {
        count: 0,
        lastPrice: 0,
        latestDate: "",
        companies: [],
      };
    }

    grouped[name].count += 1;

    if (!grouped[name].latestDate || deal.$createdAt > grouped[name].latestDate) {
      grouped[name].latestDate = deal.$createdAt;
      grouped[name].lastPrice = deal.price;
    }

    if (companyName && !grouped[name].companies.includes(companyName)) {
      grouped[name].companies.push(companyName);
    }
  }

  return Object.entries(grouped).map(([name, data]) => ({
    name,
    count: data.count,
    lastPrice: data.lastPrice,
    latestDate: data.latestDate,
    companies: data.companies,
  }));
});

const companiesData = computed<AggregatedCompany[]>(() => {
  if (!rawDeals.value) return [];

  const grouped: Record<string, {
    name: string;
    count: number;
    totalPrice: number;
    minPrice: number;
    maxPrice: number;
    latestDate: string;
  }> = {};

  for (const { deal, companyName, customerId } of rawDeals.value) {
    if (!grouped[customerId]) {
      grouped[customerId] = {
        name: companyName,
        count: 0,
        totalPrice: 0,
        minPrice: Infinity,
        maxPrice: -Infinity,
        latestDate: "",
      };
    }

    grouped[customerId].count += 1;
    grouped[customerId].totalPrice += deal.price;
    grouped[customerId].minPrice = Math.min(grouped[customerId].minPrice, deal.price);
    grouped[customerId].maxPrice = Math.max(grouped[customerId].maxPrice, deal.price);

    if (!grouped[customerId].latestDate || deal.$createdAt > grouped[customerId].latestDate) {
      grouped[customerId].latestDate = deal.$createdAt;
    }
  }

  return Object.entries(grouped).map(([customerId, data]) => ({
    customerId,
    ...data,
  }));
});

const sortedServices = computed(() => {
  if (!servicesData.value) return [];

  const list = [...servicesData.value];
  const dir = sortDir.value === "asc" ? 1 : -1;

  return list.sort((a, b) => {
    switch (sortBy.value) {
      case "name":
        return a.name.localeCompare(b.name, "uk") * dir;
      case "date":
        return (new Date(a.latestDate).getTime() - new Date(b.latestDate).getTime()) * dir;
      case "price":
        return (a.lastPrice - b.lastPrice) * dir;
      default:
        return 0;
    }
  });
});

const sortedCompanies = computed(() => {
  if (!companiesData.value) return [];

  const list = [...companiesData.value];
  const dir = companySortDir.value === "asc" ? 1 : -1;

  return list.sort((a, b) => {
    switch (companySortBy.value) {
      case "name":
        return a.name.localeCompare(b.name, "uk") * dir;
      case "count":
        return (a.count - b.count) * dir;
      case "total":
        return (a.totalPrice - b.totalPrice) * dir;
      case "date":
        return (new Date(a.latestDate).getTime() - new Date(b.latestDate).getTime()) * dir;
      default:
        return 0;
    }
  });
});

const isAnyLoading = computed(() => dealsLoading.value);
const isAnyError = computed(() => !!dealsError.value);

const toggleSort = (field: SortField) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDir.value = "asc";
  }
};

const toggleCompanySort = (field: CompanySortField) => {
  if (companySortBy.value === field) {
    companySortDir.value = companySortDir.value === "asc" ? "desc" : "asc";
  } else {
    companySortBy.value = field;
    companySortDir.value = "asc";
  }
};

const navigateToCompany = (customerId: string) => {
  navigateTo(`/services/company/${customerId}`);
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
.services-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  padding: 20px;
}

.services-card {
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

.services-header {
  text-align: center;
  margin-bottom: 24px;
}

.services-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.services-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 32px;
  padding: 4px;
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 12px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.tab-btn {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #e2daf5;
  background-color: rgba(139, 92, 246, 0.1);
}

.tab-btn--active {
  color: #ffffff;
  background-color: #2b1f47;
  border-color: #8b5cf6;
}

.services-loading,
.services-error,
.services-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #94a3b8;
  text-align: center;
}

.services-error {
  color: #ef4444;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-hint {
  font-size: 13px;
  color: #64748b;
  margin: 0;
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

.services-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sort-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sort-label {
  font-size: 13px;
  color: #94a3b8;
  margin-right: 4px;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover {
  color: #e2daf5;
  border-color: #3e2d63;
}

.sort-btn--active {
  color: #ffffff;
  background-color: #2b1f47;
  border-color: #8b5cf6;
}

.sort-btn svg {
  font-size: 14px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.service-card {
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  transition: border-color 0.2s, transform 0.2s;
}

.service-card:hover {
  border-color: #8b5cf6;
  transform: translateY(-2px);
}

.company-card {
  cursor: pointer;
}

.service-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}

.service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  color: #e2daf5;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  color: #94a3b8;
}

.stat-value {
  font-size: 13px;
  font-weight: 600;
  color: #e2daf5;
}

.service-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  padding-top: 12px;
  border-top: 1px solid #2b1f47;
}

.service-date svg {
  font-size: 14px;
}

.company-arrow {
  display: flex;
  align-items: center;
  color: #4a3870;
  flex-shrink: 0;
  transition: color 0.2s;
}

.company-card:hover .company-arrow {
  color: #8b5cf6;
}

.company-arrow svg {
  font-size: 20px;
}

@media (max-width: 768px) {
  .services-card {
    padding: 24px;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .service-card {
    padding: 16px;
  }

  .tabs {
    width: 100%;
  }

  .tab-btn {
    flex: 1;
  }
}
</style>

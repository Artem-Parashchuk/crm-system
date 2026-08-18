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
          <div class="spinner" />
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
                    :name="
                      sortDir === 'asc'
                        ? 'material-symbols:arrow-upward'
                        : 'material-symbols:arrow-downward'
                    "
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
                    :name="
                      sortDir === 'asc'
                        ? 'material-symbols:arrow-upward'
                        : 'material-symbols:arrow-downward'
                    "
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
                    :name="
                      sortDir === 'asc'
                        ? 'material-symbols:arrow-upward'
                        : 'material-symbols:arrow-downward'
                    "
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
                    :name="
                      companySortDir === 'asc'
                        ? 'material-symbols:arrow-upward'
                        : 'material-symbols:arrow-downward'
                    "
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
                    :name="
                      companySortDir === 'asc'
                        ? 'material-symbols:arrow-upward'
                        : 'material-symbols:arrow-downward'
                    "
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
                    :name="
                      companySortDir === 'asc'
                        ? 'material-symbols:arrow-upward'
                        : 'material-symbols:arrow-downward'
                    "
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
                    :name="
                      companySortDir === 'asc'
                        ? 'material-symbols:arrow-upward'
                        : 'material-symbols:arrow-downward'
                    "
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
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { IDeal } from '~/types/deals.types'
import { getCompanyName, buildCustomerNameMap, getCustomerId } from '~/utils/get-company-name'

const { $appwrite } = useNuxtApp()
const config = useRuntimeConfig()

type ViewMode = 'services' | 'companies'
type SortField = 'name' | 'date' | 'price'
type CompanySortField = 'name' | 'count' | 'total' | 'date'
type SortDir = 'asc' | 'desc'

const viewMode = ref<ViewMode>('services')
const sortBy = ref<SortField>('name')
const sortDir = ref<SortDir>('asc')
const companySortBy = ref<CompanySortField>('name')
const companySortDir = ref<SortDir>('asc')

const dbId = config.public.dbId
const collectionId = config.public.collectionDeals
const customerCollectionId =
  (config.public as Record<string, string>).collectionCustomers || 'customers'

interface AggregatedService {
  name: string
  count: number
  lastPrice: number
  latestDate: string
  companies: string[]
}

interface AggregatedCompany {
  customerId: string
  name: string
  count: number
  totalPrice: number
  minPrice: number
  maxPrice: number
  latestDate: string
}

const {
  data: rawDeals,
  isLoading: dealsLoading,
  error: dealsError,
} = useQuery({
  queryKey: ['deals', 'services'],
  queryFn: async () => {
    if (!dbId || !collectionId) {
      throw new Error('Appwrite configuration missing')
    }

    const result = await $appwrite.databases.listDocuments(dbId, collectionId)
    const deals = result.documents as unknown as IDeal[]
    const customerNameMap = await buildCustomerNameMap($appwrite, dbId, customerCollectionId)

    const dealsWithCompany = deals.map((deal) => ({
      deal,
      companyName: getCompanyName(deal, customerNameMap),
      customerId: getCustomerId(deal) || 'unknown',
    }))

    return dealsWithCompany
  },
  staleTime: 60000,
})

const servicesData = computed<AggregatedService[]>(() => {
  if (!rawDeals.value) return []

  const grouped: Record<
    string,
    {
      count: number
      lastPrice: number
      latestDate: string
      companies: string[]
    }
  > = {}

  for (const { deal, companyName } of rawDeals.value) {
    const name = deal.name

    if (!grouped[name]) {
      grouped[name] = {
        count: 0,
        lastPrice: 0,
        latestDate: '',
        companies: [],
      }
    }

    grouped[name].count += 1

    if (!grouped[name].latestDate || deal.$createdAt > grouped[name].latestDate) {
      grouped[name].latestDate = deal.$createdAt
      grouped[name].lastPrice = deal.price
    }

    if (companyName && !grouped[name].companies.includes(companyName)) {
      grouped[name].companies.push(companyName)
    }
  }

  return Object.entries(grouped).map(([name, data]) => ({
    name,
    count: data.count,
    lastPrice: data.lastPrice,
    latestDate: data.latestDate,
    companies: data.companies,
  }))
})

const companiesData = computed<AggregatedCompany[]>(() => {
  if (!rawDeals.value) return []

  const grouped: Record<
    string,
    {
      name: string
      count: number
      totalPrice: number
      minPrice: number
      maxPrice: number
      latestDate: string
    }
  > = {}

  for (const { deal, companyName, customerId } of rawDeals.value) {
    if (!grouped[customerId]) {
      grouped[customerId] = {
        name: companyName,
        count: 0,
        totalPrice: 0,
        minPrice: Infinity,
        maxPrice: -Infinity,
        latestDate: '',
      }
    }

    grouped[customerId].count += 1
    grouped[customerId].totalPrice += deal.price
    grouped[customerId].minPrice = Math.min(grouped[customerId].minPrice, deal.price)
    grouped[customerId].maxPrice = Math.max(grouped[customerId].maxPrice, deal.price)

    if (!grouped[customerId].latestDate || deal.$createdAt > grouped[customerId].latestDate) {
      grouped[customerId].latestDate = deal.$createdAt
    }
  }

  return Object.entries(grouped).map(([customerId, data]) => ({
    customerId,
    ...data,
  }))
})

const sortedServices = computed(() => {
  if (!servicesData.value) return []

  const list = [...servicesData.value]
  const dir = sortDir.value === 'asc' ? 1 : -1

  return list.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name, 'uk') * dir
      case 'date':
        return (new Date(a.latestDate).getTime() - new Date(b.latestDate).getTime()) * dir
      case 'price':
        return (a.lastPrice - b.lastPrice) * dir
      default:
        return 0
    }
  })
})

const sortedCompanies = computed(() => {
  if (!companiesData.value) return []

  const list = [...companiesData.value]
  const dir = companySortDir.value === 'asc' ? 1 : -1

  return list.sort((a, b) => {
    switch (companySortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name, 'uk') * dir
      case 'count':
        return (a.count - b.count) * dir
      case 'total':
        return (a.totalPrice - b.totalPrice) * dir
      case 'date':
        return (new Date(a.latestDate).getTime() - new Date(b.latestDate).getTime()) * dir
      default:
        return 0
    }
  })
})

const isAnyLoading = computed(() => dealsLoading.value)
const isAnyError = computed(() => !!dealsError.value)

const toggleSort = (field: SortField) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'asc'
  }
}

const toggleCompanySort = (field: CompanySortField) => {
  if (companySortBy.value === field) {
    companySortDir.value = companySortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    companySortBy.value = field
    companySortDir.value = 'asc'
  }
}

const navigateToCompany = (customerId: string) => {
  navigateTo(`/services/company/${customerId}`)
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
  }).format(price)
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getColor = (name: string): string => {
  const colors = [
    'var(--accent-gradient)',
    'linear-gradient(135deg, var(--status-blue) 0%, var(--accent-primary) 100%)',
    'linear-gradient(135deg, var(--success-primary) 0%, var(--status-blue) 100%)',
    'linear-gradient(135deg, var(--status-amber) 0%, var(--error-primary) 100%)',
    'linear-gradient(135deg, var(--status-pink) 0%, var(--accent-primary) 100%)',
  ]

  const index = name.length % colors.length
  return colors[index]
}
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
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 1200px;
  box-shadow: var(--shadow-card);
}

.services-header {
  text-align: center;
  margin-bottom: 24px;
}

.services-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.services-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 32px;
  padding: 4px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.tab-btn {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text-secondary);
  background-color: color-mix(in srgb, var(--accent-primary) 10%, transparent);
}

.tab-btn--active {
  color: var(--text-primary);
  background-color: var(--border-primary);
  border-color: var(--accent-primary);
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
  color: var(--text-muted);
  text-align: center;
}

.services-error {
  color: var(--error-primary);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-hint {
  font-size: 13px;
  color: var(--text-subtle);
  margin: 0;
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
  color: var(--text-muted);
  margin-right: 4px;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover {
  color: var(--text-secondary);
  border-color: var(--border-secondary);
}

.sort-btn--active {
  color: var(--text-primary);
  background-color: var(--border-primary);
  border-color: var(--accent-primary);
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
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.service-card:hover {
  border-color: var(--accent-primary);
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
  color: #fff;
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
  color: var(--text-secondary);
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
  color: var(--text-muted);
}

.stat-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.service-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-subtle);
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
}

.service-date svg {
  font-size: 14px;
}

.company-arrow {
  display: flex;
  align-items: center;
  color: var(--text-accent);
  flex-shrink: 0;
  transition: color 0.2s;
}

.company-card:hover .company-arrow {
  color: var(--accent-primary);
}

.company-arrow svg {
  font-size: 20px;
}

@media (max-width: 768px) {
  .services-wrapper {
    padding: 24px;
  }

  .services-card {
    padding: 16px;
    border-radius: 12px;
  }

  .services-header {
    margin-bottom: 16px;
  }

  .services-title {
    font-size: 22px;
  }

  .services-subtitle {
    font-size: 13px;
  }

  .tabs {
    width: 100%;
    margin-bottom: 20px;
  }

  .tab-btn {
    flex: 1;
    padding: 10px 12px;
    font-size: 13px;
  }

  .services-grid {
    /* grid-template-columns: 1fr; */
    gap: 12px;
  }

  .service-card {
    padding: 14px;
    gap: 12px;
  }

  .service-icon {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .service-name {
    font-size: 15px;
  }

  .sort-bar {
    gap: 6px;
  }

  .sort-btn {
    min-height: 36px;
    padding: 6px 10px;
    font-size: 12px;
  }

  .services-loading,
  .services-error,
  .services-empty {
    padding: 40px 16px;
  }

  .empty-icon {
    font-size: 40px;
  }
}

@media (max-width: 480px) {
  .services-wrapper {
    padding: 8px;
  }

  .services-card {
    padding: 12px;
    border-radius: 10px;
  }

  .services-title {
    font-size: 20px;
  }

  .services-subtitle {
    font-size: 12px;
  }

  .tab-btn {
    padding: 8px 8px;
    font-size: 12px;
  }

  .services-grid {
    gap: 10px;
  }

  .service-card {
    padding: 12px;
    gap: 10px;
  }

  .service-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
    border-radius: 10px;
  }

  .service-info {
    gap: 8px;
  }

  .service-name {
    font-size: 14px;
  }

  .service-stats {
    gap: 4px;
  }

  .stat-item {
    gap: 4px;
  }

  .stat-label,
  .stat-value {
    font-size: 12px;
  }

  .service-date {
    font-size: 11px;
    padding-top: 8px;
  }

  .company-arrow svg {
    font-size: 18px;
  }

  .sort-bar {
    gap: 4px;
  }

  .sort-btn {
    padding: 6px 8px;
    font-size: 11px;
  }
}
</style>

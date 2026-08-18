<template>
  <ClientOnly>
    <div class="orders-wrapper">
      <div class="orders-card">
        <div class="orders-header">
          <h1 class="orders-title">Замовлення</h1>
          <p class="orders-subtitle">Хронологія угод</p>
        </div>

        <div v-if="isLoading" class="orders-loading">
          <div class="spinner" />
          <span>Завантаження даних...</span>
        </div>

        <div v-else-if="error" class="orders-error">
          <Icon name="material-symbols:error" />
          <span>Помилка завантаження: {{ error.message }}</span>
        </div>

        <div v-else-if="!timeline.length" class="orders-empty">
          <Icon name="material-symbols:inbox" class="empty-icon" />
          <p>Немає замовлень</p>
          <p class="empty-hint">Створіть угоду на головній сторінці</p>
        </div>

        <div v-else class="timeline">
          <div class="filter-bar">
            <button
              v-for="filter in filters"
              :key="filter.value"
              :class="['filter-btn', { active: activeFilter === filter.value }]"
              @click="setFilter(filter.value)"
            >
              {{ filter.label }}
            </button>
          </div>

          <div v-if="!filteredTimeline.length" class="orders-empty">
            <Icon name="material-symbols:filter-list" class="empty-icon" />
            <p>Немає замовлень з таким статусом</p>
            <p class="empty-hint">Спробуйте інший фільтр</p>
          </div>

          <div v-for="group in filteredTimeline" :key="group.dateISO" class="timeline-group">
            <div class="timeline-date">
              <div class="timeline-dot" />
              <span class="date-label"
                >{{ group.date }} — {{ group.deals.length }}
                {{
                  group.deals.length === 1 ? 'угода' : group.deals.length < 5 ? 'угоди' : 'угод'
                }}</span
              >
            </div>

            <div class="timeline-deals">
              <div v-for="deal in group.deals" :key="deal.$id" class="deal-card">
                <div class="deal-header">
                  <h3 class="deal-name">{{ deal.name }}</h3>
                  <span class="deal-status" :style="{ background: deal.statusColor }">
                    {{ deal.statusLabel }}
                  </span>
                </div>

                <div class="deal-details">
                  <div class="deal-price">{{ formatPrice(deal.price) }}</div>
                  <div class="deal-customer">{{ deal.customerName }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #fallback>
      <div class="orders-wrapper">
        <div class="orders-card">
          <div class="orders-header">
            <h1 class="orders-title">Замовлення</h1>
            <p class="orders-subtitle">Завантаження...</p>
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
import { EnumStatus } from '~/types/deals.types'
import { getCompanyName, buildCustomerNameMap } from '~/utils/get-company-name'

const { $appwrite } = useNuxtApp()
const config = useRuntimeConfig()

const dbId = config.public.dbId
const collectionId = config.public.collectionDeals
const customerCollectionId =
  (config.public as Record<string, string>).collectionCustomers || 'customers'

interface TimelineDeal {
  $id: string
  name: string
  price: number
  status: string
  statusLabel: string
  statusColor: string
  customerName: string
  $createdAt: string
}

interface TimelineGroup {
  date: string
  dateISO: string
  deals: TimelineDeal[]
}

const statusLabels: Record<string, string> = {
  [EnumStatus.todo]: 'Вхідні',
  [EnumStatus['to-be-agreed']]: 'На погодженні',
  [EnumStatus['in-progress']]: 'У виробництві',
  [EnumStatus.produced]: 'Виготовлено',
  [EnumStatus.done]: 'Передано клієнту',
}

const statusColors: Record<string, string> = {
  [EnumStatus.todo]: 'var(--accent-gradient)',
  [EnumStatus['to-be-agreed']]:
    'linear-gradient(135deg, var(--status-blue) 0%, var(--accent-primary) 100%)',
  [EnumStatus['in-progress']]:
    'linear-gradient(135deg, var(--success-primary) 0%, var(--status-blue) 100%)',
  [EnumStatus.produced]:
    'linear-gradient(135deg, var(--status-green-light) 0%, var(--status-green-light) 100%)',
  [EnumStatus.done]: 'linear-gradient(135deg, var(--status-pink) 0%, var(--accent-primary) 100%)',
}

const activeFilter = ref<string>('all')

const filters = [
  { value: 'all', label: 'Всі' },
  { value: EnumStatus.todo, label: 'Вхідні' },
  { value: EnumStatus['to-be-agreed'], label: 'На погодженні' },
  { value: EnumStatus['in-progress'], label: 'У виробництві' },
  { value: EnumStatus.produced, label: 'Виготовлено' },
  { value: EnumStatus.done, label: 'Передано клієнту' },
]

const setFilter = (status: string) => {
  activeFilter.value = status
}

const {
  data: timeline,
  isLoading,
  error,
} = useQuery({
  queryKey: ['deals', 'timeline'],
  queryFn: async () => {
    if (!dbId || !collectionId) {
      throw new Error('Appwrite configuration missing')
    }

    const result = await $appwrite.databases.listDocuments(dbId, collectionId)
    const deals = result.documents as unknown as IDeal[]
    const customerNameMap = await buildCustomerNameMap($appwrite, dbId, customerCollectionId)

    const enriched = deals.map((deal) => ({
      deal,
      companyName: getCompanyName(deal, customerNameMap),
    }))

    return enriched
  },
  select: (enriched) => {
    const grouped: Record<string, TimelineGroup> = {}

    for (const { deal, companyName } of enriched) {
      const dateObj = new Date(deal.$createdAt)
      const dateLabel = dateObj.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      const dateISO = dateObj.toISOString().split('T')[0]

      if (!grouped[dateISO]) {
        grouped[dateISO] = {
          date: dateLabel,
          dateISO,
          deals: [],
        }
      }

      grouped[dateISO].deals.push({
        $id: deal.$id,
        name: deal.name,
        price: deal.price,
        status: deal.status,
        statusLabel: statusLabels[deal.status] || deal.status,
        statusColor:
          statusColors[deal.status] ||
          'linear-gradient(135deg, var(--text-subtle) 0%, var(--text-muted) 100%)',
        customerName: companyName || '—',
        $createdAt: deal.$createdAt,
      })
    }

    return Object.values(grouped).sort((a, b) => {
      return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    })
  },
  staleTime: 60000,
})

const filteredTimeline = computed(() => {
  if (!timeline.value) return []

  if (activeFilter.value === 'all') {
    return timeline.value
  }

  return timeline.value
    .map((group) => ({
      ...group,
      deals: group.deals.filter((deal) => deal.status === activeFilter.value),
    }))
    .filter((group) => group.deals.length > 0)
})

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
  }).format(price)
}
</script>

<style scoped>
.orders-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  padding: 20px;
}

.orders-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 900px;
  box-shadow: var(--shadow-card);
}

.orders-header {
  text-align: center;
  margin-bottom: 32px;
}

.orders-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.orders-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.orders-loading,
.orders-error,
.orders-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-muted);
  text-align: center;
}

.orders-error {
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

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-primary);
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--accent-primary);
  color: var(--text-secondary);
}

.filter-btn.active {
  background: var(--accent-gradient);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.timeline-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-date {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-gradient);
  flex-shrink: 0;
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent-primary) 40%, transparent);
}

.date-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.timeline-deals {
  margin-left: 5px;
  padding-left: 18px;
  border-left: 2px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deal-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 16px;
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.deal-card:hover {
  border-color: var(--accent-primary);
  transform: translateX(4px);
}

.deal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.deal-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deal-status {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.deal-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.deal-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--success-primary);
}

.deal-customer {
  font-size: 14px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .orders-card {
    padding: 24px;
  }

  .deal-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .deal-details {
    flex-direction: column;
    align-items: flex-start;
  }
}
@media (max-width: 480px) {
  .orders-wrapper {
    padding: 8px;
  }
  .orders-card {
    padding: 8px;
  }
}
</style>

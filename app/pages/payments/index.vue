<template>
  <ClientOnly>
    <div class="finance-wrapper">
      <div class="finance-card">
        <div class="finance-header">
          <h1 class="finance-title">Фінанси</h1>
          <p class="finance-subtitle">Аналіз на основі угод</p>
        </div>

        <div v-if="isLoading" class="finance-loading">
          <div class="spinner" />
          <span>Завантаження даних...</span>
        </div>

        <div v-else-if="error" class="finance-error">
          <Icon name="material-symbols:error" />
          <span>Помилка завантаження: {{ error.message }}</span>
        </div>

        <div v-else-if="!data" class="finance-empty">
          <Icon name="material-symbols:inbox" class="empty-icon" />
          <p>Немає даних для аналізу</p>
          <p class="empty-hint">Створіть угоду на головній сторінці</p>
        </div>

        <div v-else class="finance-content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="material-symbols:payments" />
              </div>
              <div class="stat-info">
                <span class="stat-label">Загальна сума</span>
                <span class="stat-value">{{ formatPrice(data.total) }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="material-symbols:analytics" />
              </div>
              <div class="stat-info">
                <span class="stat-label">Середній чек</span>
                <span class="stat-value">{{ formatPrice(data.avg) }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="material-symbols:receipt-long" />
              </div>
              <div class="stat-info">
                <span class="stat-label">Угод всього</span>
                <span class="stat-value">{{ data.count }}</span>
              </div>
            </div>
          </div>

          <div class="status-breakdown">
            <h2 class="section-title">Сума за статусами</h2>
            <div class="status-bars">
              <div v-for="item in data.byStatus" :key="item.status" class="status-bar-item">
                <div class="status-bar-header">
                  <span class="status-name">{{ item.label }}</span>
                  <span class="status-amount">{{ formatPrice(item.total) }}</span>
                </div>
                <div class="status-bar-track">
                  <div
                    class="status-bar-fill"
                    :style="{
                      width: item.percentage + '%',
                      background: item.color,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="top-deals">
            <h2 class="section-title">Топ-5 угод за ціною</h2>
            <div class="deals-list">
              <div v-for="(deal, index) in data.topDeals" :key="deal.$id" class="deal-item">
                <div class="deal-rank">#{{ index + 1 }}</div>
                <div class="deal-info">
                  <span class="deal-name">{{ deal.name }}</span>
                  <span class="deal-client">{{ deal.companyName || 'Без клієнта' }}</span>
                </div>
                <div class="deal-price">{{ formatPrice(deal.price) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #fallback>
      <div class="finance-wrapper">
        <div class="finance-card">
          <div class="finance-header">
            <h1 class="finance-title">Фінанси</h1>
            <p class="finance-subtitle">Завантаження...</p>
          </div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
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

interface FinanceData {
  total: number
  avg: number
  count: number
  byStatus: Array<{
    status: string
    label: string
    total: number
    percentage: number
    color: string
  }>
  topDeals: Array<IDeal & { companyName: string }>
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
    'linear-gradient(90deg, var(--status-blue) 0%, var(--accent-primary) 100%)',
  [EnumStatus['in-progress']]:
    'linear-gradient(90deg, var(--success-primary) 0%, var(--status-blue) 100%)',
  [EnumStatus.produced]:
    'linear-gradient(90deg, var(--status-amber) 0%, var(--error-primary) 100%)',
  [EnumStatus.done]: 'linear-gradient(90deg, var(--status-pink) 0%, var(--accent-primary) 100%)',
}

const { data, isLoading, error } = useQuery({
  queryKey: ['deals', 'finance'],
  queryFn: async () => {
    if (!dbId || !collectionId) {
      throw new Error('Appwrite configuration missing')
    }

    const result = await $appwrite.databases.listDocuments(dbId, collectionId)
    const deals = result.documents as unknown as IDeal[]
    const customerNameMap = await buildCustomerNameMap($appwrite, dbId, customerCollectionId)

    return deals.map((deal) => ({
      ...deal,
      companyName: getCompanyName(deal, customerNameMap),
    }))
  },
  select: (enrichedDeals): FinanceData => {
    const deals = enrichedDeals as Array<IDeal & { companyName: string }>
    const total = deals.reduce((sum, deal) => sum + deal.price, 0)
    const count = deals.length
    const avg = count > 0 ? total / count : 0

    const statusGroups: Record<string, number> = {}
    for (const deal of deals) {
      const status = deal.status
      statusGroups[status] = (statusGroups[status] || 0) + deal.price
    }

    const maxStatusTotal = Math.max(...Object.values(statusGroups), 1)
    const byStatus = Object.entries(statusGroups).map(([status, statusTotal]) => ({
      status,
      label: statusLabels[status] || status,
      total: statusTotal,
      percentage: (statusTotal / maxStatusTotal) * 100,
      color:
        statusColors[status] ||
        'linear-gradient(90deg, var(--text-subtle) 0%, var(--text-muted) 100%)',
    }))

    const topDeals = [...deals].sort((a, b) => b.price - a.price).slice(0, 5)

    return { total, avg, count, byStatus, topDeals }
  },
  staleTime: 60000,
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
.finance-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  padding: 20px;
}

.finance-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 1200px;
  box-shadow: var(--shadow-card);
}

.finance-header {
  text-align: center;
  margin-bottom: 32px;
}

.finance-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.finance-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.finance-loading,
.finance-error,
.finance-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-muted);
  text-align: center;
}

.finance-error {
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

.finance-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
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

.stat-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  background: var(--accent-gradient);
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}

.status-breakdown {
  display: flex;
  flex-direction: column;
}

.status-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-bar-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-name {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.status-amount {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 600;
}

.status-bar-track {
  width: 100%;
  height: 8px;
  background-color: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.status-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.top-deals {
  display: flex;
  flex-direction: column;
}

.deals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deal-item {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: border-color 0.2s;
}

.deal-item:hover {
  border-color: var(--accent-primary);
}

.deal-rank {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-primary);
  width: 32px;
  flex-shrink: 0;
}

.deal-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.deal-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deal-client {
  font-size: 13px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deal-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--success-primary);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .finance-card {
    padding: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
  }

  .deal-item {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .finance-card {
    padding: 8px;
  }
  .finance-wrapper {
    padding: 8px;
  }
}
</style>

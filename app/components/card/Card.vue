<template>
  <div class="crm-card" :draggable="true">
    <div class="crm-card__header">
      <h3 class="crm-card__title">{{ card.name }}</h3>
      <button
        class="crm-card__delete"
        :disabled="isDeletePending"
        @click.stop="onDelete(card.id)"
        title="Видалити угоду"
      >
        <Icon name="material-symbols:delete-outline" />
      </button>
    </div>

    <div class="crm-card__details">
      <div class="crm-card__field">
        <span class="crm-card__label">Компанія:</span>
        <span class="crm-card__value crm-card__value--company">{{ card.companyName }}</span>
      </div>

      <div class="crm-card__field">
        <span class="crm-card__label">Вартість:</span>
        <span class="crm-card__value crm-card__value--price">{{ formatPrice(card.price) }}</span>
      </div>
    </div>

    <div class="crm-card__footer">
      <span class="crm-card__date">{{ formatDate(card.$createdAt) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICard } from '../kanban/kanban.types'

const props = defineProps<{
  card: ICard
  onDelete: (cardId: string) => void
  isDeletePending: boolean
}>()

const formatPrice = (price?: number) => {
  const numericPrice = typeof price === 'number' ? price : Number(price ?? 0)

  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
  }).format(Number.isFinite(numericPrice) ? numericPrice : 0)
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'

  const parsedDate = new Date(date)

  return Number.isNaN(parsedDate.getTime()) ? 'N/A' : parsedDate.toLocaleDateString('uk-UA')
}

</script>

<style lang="css" scoped>
.crm-card {
  background-color: #140e24;
  border: 1px solid #2b1f47;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(5, 3, 10, 0.5);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
}

.crm-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(5, 3, 10, 0.7);
  border-color: #8b5cf6;
}

.crm-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.crm-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #e2daf5;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.crm-card__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #4a3870;
  transition: color 0.2s, background-color 0.2s;
  flex-shrink: 0;
}

.crm-card__delete:hover {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.crm-card__delete:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.crm-card__delete svg {
  font-size: 18px;
}

.crm-card__details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.crm-card__field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.crm-card__label {
  color: #64748b;
  font-weight: 500;
}

.crm-card__value {
  color: #e2daf5;
  font-weight: 500;
}

.crm-card__value--company {
  color: #ffffff;
  font-weight: 600;
}

.crm-card__value--price {
  color: #10b981;
  font-weight: 700;
  background-color: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
}

.crm-card__footer {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed #2b1f47;
  display: flex;
  justify-content: flex-end;
}

.crm-card__date {
  font-size: 12px;
  color: #64748b;
}
</style>
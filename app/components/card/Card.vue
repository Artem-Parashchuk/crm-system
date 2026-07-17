<template>
  <div class="crm-card" :draggable="true">
    <h3 class="crm-card__title">{{ card.name }}</h3>
    
    <div class="crm-card__details">
      <div class="crm-card__field">
        <span class="crm-card__label">Компанія:</span>
        <span class="crm-card__value crm-card__value--company">{{card.companyName }}</span>
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
  background-color: #ffffff;
  border: 1px solid #e2e8f0; /* легкий сірий бордер */
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px; /* Оптимальна ширина для Kanban-колонки */
}

.crm-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.crm-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b; /* темний графітовий */
  line-height: 1.4;
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
  color: #64748b; /* приглушений сірий */
  font-weight: 500;
}

.crm-card__value {
  color: #334155;
  font-weight: 500;
}

.crm-card__value--company {
  color: #0f172a;
  font-weight: 600;
}

.crm-card__value--price {
  color: #10b981; /* смарагдово-зелений для грошей */
  font-weight: 700;
  background-color: #ecfdf5; /* дуже легкий зелений бекграунд */
  padding: 2px 8px;
  border-radius: 6px;
}

.crm-card__footer {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed #f1f5f9; /* акуратна пунктирна лінія */
  display: flex;
  justify-content: flex-end;
}

.crm-card__date {
  font-size: 12px;
  color: #94a3b8; /* світло-сірий для другорядних даних */
}
</style>
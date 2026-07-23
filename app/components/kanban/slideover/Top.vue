<template>
  <div class="deal-details">
    <h3 class="deal-summary">Про угоду</h3>

    <template v-if="store.card">
      <KanbanSlideoverLabel label-text="Назва">
        <h2 class="detail-title">{{ store.card.name }}</h2>
      </KanbanSlideoverLabel>

      <KanbanSlideoverLabel label-text="Сума">
        <h2 class="detail-value">{{ convertCurrency(store.card.price || 0) }}</h2>
      </KanbanSlideoverLabel>

      <KanbanSlideoverLabel label-text="Статус">
        <h2 class="detail-value">{{ statusLabels[store.card.status] || store.card.status }}</h2>
      </KanbanSlideoverLabel>

      <KanbanSlideoverLabel label-text="Клієнт">
        <h2 class="detail-value">{{ store.card.companyName }}</h2>
      </KanbanSlideoverLabel>

      <KanbanSlideoverLabel label-text="Дата створення">
        <span class="detail-value">{{ dayjs(store.card.$createdAt).format("DD MMMM YYYY") }}</span>
      </KanbanSlideoverLabel>
    </template>

    <div v-else class="empty-state">
      <p>Оберіть угоду з kanban-дошки</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { useDealsSlideStore } from "~/store/deal-slide.store";

const store = useDealsSlideStore();

const statusLabels: Record<string, string> = {
  todo: "Вхідні",
  "to-be-agreed": "На погодженні",
  "in-progress": "У виробництві",
  produced: "Виготовлено",
  done: "До відвантаження",
};

const convertCurrency = (value: number) => {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(value);
};
</script>

<style lang="css" scoped>
.deal-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.deal-summary {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #6b7280;
  font-weight: 700;
}

.detail-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.detail-value {
  margin: 0;
  font-size: 0.95rem;
  color: #111827;
}

.empty-state {
  padding: 1rem;
  border: 1px dashed #d1d5db;
  border-radius: 0.75rem;
  color: #6b7280;
  background: #f9fafb;
}
</style>

<template>
  <div class="crm-board">
    <h1 class="crm-board__title">CRM Kanban Board</h1>

    <div v-if="isLoading" class="crm-board__loader">
      <div class="spinner"></div>
      <span>Завантаження даних з Appwrite...</span>
    </div>

    <div v-else-if="error" class="crm-board__error">
      Помилка завантаження: {{ error.message }}
    </div>

    <div v-else class="crm-board__columns">
      <div
        v-for="(column, index) in data"
        :key="column.id"
        class="crm-column"
        @dragover="handleDragOver"
        @drop="() => handleDrop(column)"
      >
        <div
          class="crm-column__header"
          :style="generateColumnStyle(index, data?.length)"
        >
          <span class="crm-column__name">{{ column.name }}</span>
          <span class="crm-column__count">{{ column.items?.length || 0 }}</span>
        </div>
        <KanbanCreateDeal :status="column.id" :refetch="refetch" />
        <div class="crm-column__list">
          <Card
            v-for="card in column.items"
            :key="card.id"
            :card="card"
            :onDelete="(id) => deleteDeal(id)"
            :isDeletePending="isDeletePending"
            @dragstart="
              (event: DragEvent) => handleDragStart(event, card, column)
            "
            @click="store.set(card)"
          />

          <div v-if="!column.items?.length" class="crm-column__empty">
            Немає угод
          </div>
        </div>
      </div>
    </div>
    <KanbanSlideover />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useKanbanQuery } from "~/components/kanban/useKanbanQuery";
import { useDeleteDeal } from "~/components/kanban/useDeleteDeal";
import type { ICard, IColumn } from "~/components/kanban/kanban.types";
import Card from "../components/card/Card.vue";
import type { EnumStatus } from "~/types/deals.types.js";
import { useMutation } from "@tanstack/vue-query";
import { generateColumnStyle } from "~/components/kanban/generate-gradient.js";
import { useDealsSlideStore } from "~/store/deal-slide.store.js";

type TypeMutationVariables = {
  docId: string;
  status?: EnumStatus;
};

const store = useDealsSlideStore();
const dragCard = ref<ICard | null>(null);
const sourceColumn = ref<IColumn | null>(null);
const { $appwrite } = useNuxtApp();
const config = useRuntimeConfig();

const { data, isLoading, error, refetch } = useKanbanQuery();

const { deleteDeal, isDeletePending } = useDeleteDeal({ refetch });

const { mutate } = useMutation({
  mutationKey: ["move card"],
  mutationFn: async ({ docId, status }: TypeMutationVariables) => {
    const databaseId = config.public.dbId;
    const collectionId = config.public.collectionDeals;

    if (!databaseId || !collectionId) {
      throw new Error("Appwrite config is missing");
    }

    return $appwrite.databases.updateDocument(databaseId, collectionId, docId, {
      status,
    });
  },
  onSuccess: async () => {
    await refetch();
  },
});

function handleDragStart(event: DragEvent, card: ICard, column: IColumn) {
  dragCard.value = card;
  sourceColumn.value = column;

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.id);
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
}
function handleDrop(targetColumn: IColumn) {
  if (dragCard.value && sourceColumn.value) {
    mutate({ docId: dragCard.value.id, status: targetColumn.id });
  }
}
</script>

<style scoped>
/* Головний контейнер сторінки */
.crm-board {
  padding: 24px;
}

/* Головний заголовок сторінки */
.crm-board__title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 24px;
}

/* Контейнер для колонок (заміна grid grid-cols-5) */
.crm-board__columns {
  display: grid;
  grid-template-columns: repeat(
    5,
    minmax(250px, 1fr)
  ); /* 5 рівних колонок з мін. шириною */
  gap: 20px;
  align-items: start;
  overflow-x: auto; /* Якщо екран малий, з'явиться горизонтальний скролл */
  padding-bottom: 16px;
}

/* Стиль окремої колонки */
.crm-column {
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 80vh; /* Щоб колонка не розтягувалася безкінечно вниз */
}

/* Шапка колонки */
.crm-column__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e293b; /* гарний темно-графітовий колір */
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
}

/* Кількість карток у шапці */
.crm-column__count {
  background-color: #475569;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Список карток всередині колонки */
.crm-column__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto; /* Внутрішній скролл, якщо карток забагато */
  min-height: 150px; /* Зона, куди зручно буде кидати картки при Drag and Drop */
}

/* Текст, якщо колонка пуста */
.crm-column__empty {
  text-align: center;
  color: #64748b;
  font-size: 13px;
  border: 2px dashed #2b1f47;
  border-radius: 8px;
  padding: 20px;
}

/* Стан помилки */
.crm-board__error {
  color: #ef4444;
  font-weight: bold;
  padding: 16px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  max-width: 500px;
}

/* Гарний лоадер */
.crm-board__loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
  margin-top: 40px;
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
</style>

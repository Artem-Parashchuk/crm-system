<template>
  <div class="crm-board">
    <h1 class="crm-board__title">CRM Kanban Board</h1>

    <div v-if="isLoading" class="crm-board__loader">
      <div class="spinner" />
      <span>Завантаження даних з Appwrite...</span>
    </div>

    <div v-else-if="error" class="crm-board__error">Помилка завантаження: {{ error.message }}</div>

    <div v-else class="crm-board__columns">
      <div
        v-for="(column, index) in data"
        :key="column.id"
        class="crm-column"
        @dragover="handleDragOver"
        @drop="() => handleDrop(column)"
      >
        <div class="crm-column__header" :style="generateColumnStyle(index, data?.length)">
          <span class="crm-column__name">{{ column.name }}</span>
          <span class="crm-column__count">{{ column.items?.length || 0 }}</span>
        </div>
        <KanbanCreateDeal
          v-if="column.id === EnumStatus.todo"
          :status="column.id"
          :refetch="refetch"
        />
        <div class="crm-column__list">
          <Card
            v-for="card in column.items"
            :key="card.id"
            :card="card"
            :on-delete="(id) => deleteDeal(id)"
            :is-delete-pending="isDeletePending"
            @dragstart="(event: DragEvent) => handleDragStart(event, card, column)"
            @click="store.set(card)"
          />

          <div v-if="!column.items?.length" class="crm-column__empty">Немає угод</div>
        </div>
      </div>
    </div>
    <KanbanSlideover />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useKanbanQuery } from '~/components/kanban/useKanbanQuery'
import { useDeleteDeal } from '~/components/kanban/useDeleteDeal'
import type { ICard, IColumn } from '~/components/kanban/kanban.types'
import Card from '../components/card/Card.vue'
import { EnumStatus } from '~/types/deals.types.js'
import { useMutation } from '@tanstack/vue-query'
import { generateColumnStyle } from '~/components/kanban/generate-gradient.js'
import { useDealsSlideStore } from '~/store/deal-slide.store.js'

type TypeMutationVariables = {
  docId: string
  status?: EnumStatus
}

const store = useDealsSlideStore()
const dragCard = ref<ICard | null>(null)
const sourceColumn = ref<IColumn | null>(null)
const { $appwrite } = useNuxtApp()
const config = useRuntimeConfig()

const { data, isLoading, error, refetch } = useKanbanQuery()

const { deleteDeal, isDeletePending } = useDeleteDeal({ refetch })

const { mutate } = useMutation({
  mutationKey: ['move card'],
  mutationFn: async ({ docId, status }: TypeMutationVariables) => {
    const databaseId = config.public.dbId
    const collectionId = config.public.collectionDeals

    if (!databaseId || !collectionId) {
      throw new Error('Appwrite config is missing')
    }

    return $appwrite.databases.updateDocument(databaseId, collectionId, docId, {
      status,
    })
  },
  onSuccess: async () => {
    await refetch()
  },
})

function handleDragStart(event: DragEvent, card: ICard, column: IColumn) {
  dragCard.value = card
  sourceColumn.value = column

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', card.id)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}
function handleDrop(targetColumn: IColumn) {
  if (dragCard.value && sourceColumn.value) {
    mutate({ docId: dragCard.value.id, status: targetColumn.id })
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
  color: var(--text-primary);
  margin-bottom: 24px;
}

/* Контейнер для колонок (заміна grid grid-cols-5) */
.crm-board__columns {
  display: grid;
  grid-template-columns: repeat(5, minmax(250px, 1fr)); /* 5 рівних колонок з мін. шириною */
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
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
}

/* Кількість карток у шапці */
.crm-column__count {
  background-color: var(--border-secondary);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Список карток всередині колонки */
.crm-column__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* overflow-y: auto; */
  min-height: 150px;
}

/* Текст, якщо колонка пуста */
.crm-column__empty {
  text-align: center;
  color: var(--text-subtle);
  font-size: 13px;
  border: 2px dashed var(--border-primary);
  border-radius: 8px;
  padding: 20px;
}

/* Стан помилки */
.crm-board__error {
  color: var(--error-primary);
  font-weight: bold;
  padding: 16px;
  background-color: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 8px;
  max-width: 500px;
}

/* Гарний лоадер */
.crm-board__loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-subtle);
  margin-top: 40px;
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

/* Адаптивність */
@media (max-width: 1280px) {
  .crm-board__columns {
    grid-template-columns: repeat(4, minmax(260px, 1fr));
  }
}

@media (max-width: 1024px) {
  .crm-board {
    padding: 16px;
  }

  .crm-board__title {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .crm-board__columns {
    grid-template-columns: repeat(3, minmax(260px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .crm-board {
    padding: 12px;
  }

  .crm-board__title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .crm-board__columns {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 12px;
  }

  .crm-column {
    flex: 0 0 280px;
    width: 280px;
    scroll-snap-align: start;
    max-height: none;
  }

  .crm-column__header {
    font-size: 13px;
  }

  .crm-column__list {
    max-height: 60vh;
  }
}

@media (max-width: 480px) {
  .crm-column {
    flex: 0 0 85vw;
    width: 85vw;
  }
}
</style>

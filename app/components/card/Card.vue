<template>
  <div
    class="crm-card"
    :draggable="true"
    @dragstart="$emit('dragstart', $event)"
  >
    <div class="crm-card__header">
      <h3 class="crm-card__title">{{ card.name }}</h3>
      <button
        class="crm-card__delete"
        :disabled="isDeletePending"
        @click.stop="isDeleteModalOpen = true"
        title="Видалити угоду"
      >
        <Icon name="material-symbols:delete-outline" />
      </button>
    </div>

    <div class="crm-card__details">
      <div class="crm-card__field">
        <span class="crm-card__label">Компанія:</span>
        <span class="crm-card__value crm-card__value--company">{{
          card.companyName
        }}</span>
      </div>

      <div class="crm-card__field">
        <span class="crm-card__label">Вартість:</span>
        <span class="crm-card__value crm-card__value--price">{{
          formatPrice(card.price)
        }}</span>
      </div>
    </div>

    <div class="crm-card__footer">
      <span class="crm-card__date">{{ formatDate(card.$createdAt) }}</span>
    </div>
  </div>

  <Teleport to="body">
    <dialog ref="dialogRef" class="delete-dialog" @click="handleBackdropClick">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal__icon">
          <Icon name="material-symbols:warning-outline" />
        </div>
        <h3 class="delete-modal__title">Видалити угоду?</h3>
        <p class="delete-modal__text">
          Ви дійсно хочете видалити угоду <strong>"{{ card.name }}"</strong>?
        </p>
        <p class="delete-modal__text">Цю дію не можна буде скасувати.</p>
        <div class="delete-modal__actions">
          <button
            class="delete-modal__btn delete-modal__btn--cancel"
            @click="closeModal"
          >
            Скасувати
          </button>
          <button
            class="delete-modal__btn delete-modal__btn--delete"
            :disabled="isDeletePending"
            @click="confirmDelete"
          >
            {{ isDeletePending ? "Видалення..." : "Видалити" }}
          </button>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { ICard } from "../kanban/kanban.types";

const props = defineProps<{
  card: ICard;
  onDelete: (cardId: string) => void;
  isDeletePending: boolean;
}>();

defineEmits<{
  dragstart: [event: DragEvent];
}>();

const isDeleteModalOpen = ref(false);
const dialogRef = ref<HTMLDialogElement | null>(null);

watch(isDeleteModalOpen, (isOpen) => {
  if (isOpen) {
    dialogRef.value?.showModal();
  } else {
    dialogRef.value?.close();
  }
});

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === dialogRef.value) {
    closeModal();
  }
};

const closeModal = () => {
  isDeleteModalOpen.value = false;
};

const confirmDelete = () => {
  console.log(
    "confirmDelete called with id:",
    props.card.id,
    "onDelete type:",
    typeof props.onDelete,
  );
  props.onDelete(props.card.id);
  isDeleteModalOpen.value = false;
};

const formatPrice = (price?: number) => {
  const numericPrice = typeof price === "number" ? price : Number(price ?? 0);

  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 0,
  }).format(Number.isFinite(numericPrice) ? numericPrice : 0);
};

const formatDate = (date?: string) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "N/A"
    : parsedDate.toLocaleDateString("uk-UA");
};
</script>

<style lang="css" scoped>
.crm-card {
  background-color: #fff;
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
  transform: translateY(-1px);
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
  color: #64748b;
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
  transition:
    color 0.2s,
    background-color 0.2s;
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

.delete-modal {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.delete-modal__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  font-size: 28px;
}

.delete-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #9b0000;
}

.delete-modal__text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.delete-modal__text strong {
  color: #9b0000;
  font-weight: 600;
}

.delete-modal__actions {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.delete-modal__btn {
  flex: 1;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-modal__btn--cancel {
  background-color: #f3f4f6;
  color: #374151;
}

.delete-modal__btn--cancel:hover {
  background-color: #e5e7eb;
}

.delete-modal__btn--delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
}

.delete-modal__btn--delete:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.delete-modal__btn--delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-dialog {
  border: none;
  border-radius: 16px;
  padding: 0;
  background: transparent;
  max-width: 400px;
  width: 90%;
  overflow: visible;
}

.delete-dialog::backdrop {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(4px);
}

.delete-dialog[open] {
  display: flex;
}
</style>

<template>
  <div
    class="crm-card"
    :draggable="true"
    @dragstart="$emit('dragstart', $event)"
    @click="$emit('click', $event)"
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
  click: [event: MouseEvent];
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
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px color-mix(in srgb, var(--bg-primary) 50%, transparent);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
}

.crm-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
  border-color: var(--accent-primary);
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
  color: var(--text-subtle);
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
  color: var(--border-secondary);
  transition:
    color 0.2s,
    background-color 0.2s;
  flex-shrink: 0;
}

.crm-card__delete:hover {
  color: var(--error-primary);
  background-color: color-mix(in srgb, var(--error-primary) 10%, transparent);
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
  color: var(--text-subtle);
  font-weight: 500;
}

.crm-card__value {
  color: var(--text-secondary);
  font-weight: 500;
}

.crm-card__value--company {
  color: var(--text-subtle);
  font-weight: 600;
}

.crm-card__value--price {
  color: var(--success-primary);
  font-weight: 700;
  background-color: color-mix(in srgb, var(--success-primary) 10%, transparent);
  padding: 2px 8px;
  border-radius: 6px;
}

.crm-card__footer {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-primary);
  display: flex;
  justify-content: flex-end;
}

.crm-card__date {
  font-size: 12px;
  color: var(--text-subtle);
}

.delete-modal {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  background-color: var(--bg-secondary);
  border-radius: 16px;
}

.delete-modal__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: color-mix(in srgb, var(--error-primary) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--error-primary);
  font-size: 28px;
}

.delete-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--error-primary);
}

.delete-modal__text {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

.delete-modal__text strong {
  color: var(--error-primary);
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
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.delete-modal__btn--cancel:hover {
  background-color: var(--border-secondary);
}

.delete-modal__btn--delete {
  background: var(--error-primary);
  color: var(--text-primary);
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
  background: var(--overlay-strong);
  backdrop-filter: blur(4px);
}

.delete-dialog[open] {
  display: flex;
}

/* Адаптивність */
@media (max-width: 768px) {
  .crm-card {
    padding: 12px;
    gap: 10px;
    max-width: 100%;
  }

  .crm-card__title {
    font-size: 14px;
  }

  .crm-card__field {
    font-size: 13px;
  }

  .crm-card__value--price {
    padding: 2px 6px;
  }

  .crm-card__date {
    font-size: 11px;
  }

  .delete-modal {
    padding: 20px;
    gap: 12px;
  }

  .delete-modal__icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .delete-modal__title {
    font-size: 16px;
  }

  .delete-modal__text {
    font-size: 13px;
  }

  .delete-modal__btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .crm-card__title {
    white-space: normal;
  }
}
</style>

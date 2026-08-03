<template>
  <div class="comments-block">
    <div v-if="isLoading" class="comments-loader">
      Завантаження коментарів...
    </div>

    <div v-else class="comments-content">
      <h3>Коментарі ({{ commentsList?.length || 0 }})</h3>
      <div class="comment-input-wrapper">
        <input
          type="text"
          v-model="newCommentText"
          placeholder="Напишіть коментар та натисніть Enter..."
          @keyup.enter="writeComment"
          class="comment-input"
        />
        <button class="btn" @click="writeComment" :disabled="isPending">
          {{ isPending ? "Відправка..." : "Додати коментар" }}
        </button>
      </div>
      <div v-if="commentsList?.length" class="comments-list">
        <div
          v-for="item in commentsList"
          :key="item.$id"
          class="comment-item"
        >
          <div class="comment-item__header">
            <span class="comment-date">
              {{ dayjs(item.$createdAt).format("DD.MM HH:mm") }}
            </span>
            <button
              class="comment-delete-btn"
              :disabled="isDeletePending"
              @click="deleteComment(item.$id)"
              title="Видалити коментар"
            >
              <Icon name="material-symbols:delete-outline" />
            </button>
          </div>
          <p class="comment-text">{{ item.text }}</p>
        </div>
      </div>

      <span v-else class="comments-empty">Наразі немає коментарів</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";
import { useComments } from "./useComments";
import { useCreateComment } from "./useCreateComment";
import { useDeleteComment } from "./useDeleteComment";

const { data: commentsList, refetch, isLoading } = useComments();

const { comment: newCommentText, writeComment, isPending } = useCreateComment({ refetch });

const { deleteComment, isDeletePending } = useDeleteComment({ refetch });
</script>

<style scoped>
.comments-block {
  margin-top: 0.5rem;
  padding: 1rem;
  border: 1px solid #2b1f47;
  border-radius: 12px;
  background: #0b0714;
}

.comments-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comments-content h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #e2daf5;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.comment-item {
  background: #140e24;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #2b1f47;
}

.comment-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.comment-date {
  font-size: 0.75rem;
  color: #64748b;
}

.comment-delete-btn {
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
}

.comment-delete-btn:hover {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.comment-delete-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.comment-delete-btn svg {
  font-size: 18px;
}

.comment-text {
  margin: 0;
  font-size: 0.9rem;
  color: #e2daf5;
  word-break: break-word;
}

.comments-empty,
.comments-loader {
  font-size: 0.9rem;
  color: #64748b;
  font-style: italic;
  text-align: center;
  padding: 10px 0;
}

.comment-input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.comment-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: 0.9rem;
  border: 1px solid #2b1f47;
  border-radius: 8px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background-color: #0b0714;
  color: #e2daf5;
  font-family: "Lato", sans-serif;
}

.comment-input::placeholder {
  color: #64748b;
}

.comment-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.btn {
  display: block;
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  white-space: nowrap;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.3);
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  background: #2b1f47;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>

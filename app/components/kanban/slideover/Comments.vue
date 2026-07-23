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
        <div v-for="item in commentsList" :key="item.$id" class="comment-item">
          <div class="comment-item__header">
            <span class="comment-date">
              {{ dayjs(item.$createdAt).format("DD.MM HH:mm") }}
            </span>
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

const { data: commentsList, refetch, isLoading } = useComments();

const { comment: newCommentText, writeComment, isPending } = useCreateComment({ refetch });
</script>

<style scoped>
.comments-block {
  margin-top: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f9fafb;
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
  color: #111827;
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
  background: #ffffff;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.comment-item__header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.25rem;
}

.comment-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.comment-text {
  margin: 0;
  font-size: 0.9rem;
  color: #374151;
  word-break: break-word;
}

.comments-empty,
.comments-loader {
  font-size: 0.9rem;
  color: #6b7280;
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
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background-color: #ffffff;
  color: #111827;
}

.comment-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.btn {
  display: block;
  width: 100%;
  border: none;
  border-radius: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
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
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.2);
  background: linear-gradient(135deg, #059669, #047857);
}

.btn:active {
  transform: translateY(0);
}
</style>

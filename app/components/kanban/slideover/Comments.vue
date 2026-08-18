<template>
  <div class="comments-block">
    <div v-if="isLoading" class="comments-loader">Завантаження коментарів...</div>

    <div v-else class="comments-content">
      <h3>Коментарі ({{ commentsList?.length || 0 }})</h3>
      <div class="comment-input-wrapper">
        <input
          v-model="newCommentText"
          type="text"
          placeholder="Напишіть коментар та натисніть Enter..."
          class="comment-input"
          @keyup.enter="writeComment"
        />
        <button class="btn" :disabled="isPending" @click="writeComment">
          {{ isPending ? 'Відправка...' : 'Додати коментар' }}
        </button>
      </div>
      <div v-if="commentsList?.length" class="comments-list">
        <div v-for="item in commentsList" :key="item.$id" class="comment-item">
          <div class="comment-item__header">
            <span class="comment-date">
              {{ dayjs(item.$createdAt).format('DD.MM HH:mm') }}
            </span>
            <button
              class="comment-delete-btn"
              :disabled="isDeletePending"
              title="Видалити коментар"
              @click="deleteComment(item.$id)"
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
import dayjs from 'dayjs'
import { useComments } from './useComments'
import { useCreateComment } from './useCreateComment'
import { useDeleteComment } from './useDeleteComment'

const { data: commentsList, refetch, isLoading } = useComments()

const { comment: newCommentText, writeComment, isPending } = useCreateComment({ refetch })

const { deleteComment, isDeletePending } = useDeleteComment({ refetch })
</script>

<style scoped>
.comments-block {
  margin-top: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  background: var(--bg-primary);
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
  color: var(--text-secondary);
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
  background: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
}

.comment-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.comment-date {
  font-size: 0.75rem;
  color: var(--text-subtle);
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
  color: var(--border-secondary);
  transition:
    color 0.2s,
    background-color 0.2s;
}

.comment-delete-btn:hover {
  color: var(--error-primary);
  background-color: color-mix(in srgb, var(--error-primary) 10%, transparent);
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
  color: var(--text-secondary);
  word-break: break-word;
}

.comments-empty,
.comments-loader {
  font-size: 0.9rem;
  color: var(--text-subtle);
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
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-family: 'Lato', sans-serif;
}

.comment-input::placeholder {
  color: var(--text-subtle);
}

.comment-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 10%, transparent);
}

.btn {
  display: block;
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1rem;
  background: var(--accent-gradient);
  color: var(--text-primary);
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
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent-primary) 30%, transparent);
  background: var(--accent-gradient);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  background: var(--border-primary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>

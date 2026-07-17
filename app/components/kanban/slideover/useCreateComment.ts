import { ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { useDealsSlideStore } from "~/store/deal-slide.store";

export function useCreateComment({ refetch }: { refetch: () => void }) {
  const store = useDealsSlideStore();
  const comment = ref<string>('');
  
  const { $appwrite } = useNuxtApp();
  const config = useRuntimeConfig();
  
  const databaseId = config.public.dbId;
  const collectionComments = config.public.collectionComments;

  const { mutate, isPending } = useMutation({
    // 1. Ключ мутації робимо статичним
    mutationKey: ['add comment'],

    // 2. Функція мутації повертає проміс запиту до Appwrite
    mutationFn: async () => {
      if (!databaseId || !collectionComments) {
        throw new Error("Appwrite configuration for comments is missing");
      }

      // Виправлено: викликаємо метод через $appwrite.databases
      return await $appwrite.databases.createDocument(
        databaseId,
        collectionComments,
        uuid(), // Генеруємо унікальний ID для документа коментаря
        {
          text: comment.value,
          deal: store.card?.id // Зв'язок коментаря з карткою угоди
        }
      );
    },

    // 3. ВИПРАВЛЕНО: onSuccess винесено на рівень конфігурації мутації
    onSuccess: () => {
      refetch();          // Перепідтягуємо коментарі
      comment.value = ''; // Очищаємо поле вводу (інпут)
    },
    onError: (error) => {
      console.error("Помилка при додаванні коментаря:", error);
    }
  });

  const writeComment = () => {
    // Валідація: не відправляємо пусті коментарі
    if (!comment.value.trim()) return;
    mutate();
  };

  return {
    writeComment,
    comment,
    isPending // Можна використати у шаблоні для блокування кнопки під час відправки (loading спинер)
  };
}
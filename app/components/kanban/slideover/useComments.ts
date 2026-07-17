import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useDealsSlideStore } from "~/store/deal-slide.store";
import { Query } from "appwrite"; // ОБОВ'ЯЗКОВО ІМПОРТУЄМО КЛАС QUERY

export function useComments() {
  const store = useDealsSlideStore();
  const { $appwrite } = useNuxtApp();
  const config = useRuntimeConfig();

  // Реактивний ID поточної картки
  const cardId = computed(() => store.card?.id || "");

  return useQuery({
    // Змінюємо ключ, щоб TanStack Query скинув старий кеш угод
    queryKey: ["deal-comments", cardId],
    
    queryFn: async () => {
      const databaseId = config.public.dbId;
      const collectionComments = config.public.collectionComments;

      if (!databaseId || !collectionComments) {
        throw new Error("Appwrite configuration for comments is missing");
      }

      // Запитуємо дані НАПРЯМУ з колекції коментарів
      const response = await $appwrite.databases.listDocuments(
        databaseId,
        collectionComments,
        [
          // Шукаємо лише ті коментарі, де поле зв'язку (deal) дорівнює ID нашої картки
          Query.equal("deal", cardId.value)
        ]
      );
      
      // listDocuments повертає об'єкт. Сам масив документів лежить у властивості .documents
      return response.documents; 
    },
    
    enabled: computed(() => !!cardId.value),
    staleTime: 0,
    gcTime: 0
  });
}
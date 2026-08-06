import { useMutation } from "@tanstack/vue-query";

export function useDeleteDeal({ refetch }: { refetch: () => void }) {
  const { $appwrite } = useNuxtApp();
  const config = useRuntimeConfig();
  const databaseId = config.public.dbId;
  const collectionId = config.public.collectionDeals;

  const { mutate, isPending } = useMutation({
    mutationKey: ["delete deal"],
    mutationFn: async (dealId: string) => {
      return await $appwrite.databases.deleteDocument(
        databaseId,
        collectionId,
        dealId,
      );
    },
    onSuccess: async () => {
      await refetch();
    },
  });

  return { deleteDeal: mutate, isDeletePending: isPending };
}

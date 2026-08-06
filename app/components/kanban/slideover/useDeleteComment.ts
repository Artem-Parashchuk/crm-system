import { useMutation } from "@tanstack/vue-query";
import { useDealsSlideStore } from "~/store/deal-slide.store";

export function useDeleteComment({ refetch }: { refetch: () => void }) {
  const store = useDealsSlideStore();
  const { $appwrite } = useNuxtApp();
  const config = useRuntimeConfig();
  const databaseId = config.public.dbId;
  const collectionComments = config.public.collectionComments;

  const { mutate, isPending } = useMutation({
    mutationKey: ["delete comment"],
    mutationFn: async (commentId: string) => {
      return await $appwrite.databases.deleteDocument(
        databaseId,
        collectionComments,
        commentId,
      );
    },
    onSuccess: () => {
      refetch();
    },
  });

  return { deleteComment: mutate, isDeletePending: isPending };
}

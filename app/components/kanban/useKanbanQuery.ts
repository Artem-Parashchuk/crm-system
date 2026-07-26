import { useQuery } from "@tanstack/vue-query";
import type { IDeal } from "~/types/deals.types";
import { getCompanyName, getCustomerId, extractStringValue } from "~/utils/get-company-name";
import { KANBAN_DATA } from "./kanban.data";
import type { IColumn } from "./kanban.types";

export function useKanbanQuery() {
  const { $appwrite } = useNuxtApp();
  const config = useRuntimeConfig();
  const customerCollectionId =
    (config.public as Record<string, string>).collectionCustomers ||
    "customers";

  const getPrice = (deal: IDeal) => {
    const rawPrice = (deal as IDeal & { price?: number | string }).price;
    const numericPrice =
      typeof rawPrice === "number" ? rawPrice : Number(rawPrice ?? 0);

    return Number.isFinite(numericPrice) ? numericPrice : 0;
  };

  return useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const res = await $appwrite.databases.listDocuments(
        config.public.dbId,
        config.public.collectionDeals,
      );

      const deals = res.documents as unknown as IDeal[];

      const dealsWithCompanyName = await Promise.all(
        deals.map(async (deal) => ({
          ...deal,
          companyName: await getCompanyName(
            deal,
            $appwrite,
            config.public.dbId,
            customerCollectionId,
          ),
        })),
      );
      return dealsWithCompanyName;
    },
    select(data) {
      const newBoard: IColumn[] = KANBAN_DATA.map((column) => ({
        ...column,
        items: [],
      }));
      const deals = data as Array<IDeal & { companyName?: string }>;

      for (const deal of deals) {
        const column = newBoard.find((col) => col.id === deal.status);

        if (column) {
          column.items.push({
            $createdAt: deal.$createdAt,
            id: deal.$id,
            name: deal.name,
            price: getPrice(deal),
            companyName: deal.companyName || "N/A",
            status: column.name,
          });
        }
      }

      return newBoard;
    },
  });
}

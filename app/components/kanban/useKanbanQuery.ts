import { useQuery } from "@tanstack/vue-query";
import type { IDeal } from "~/types/deals.types";
import { KANBAN_DATA } from "./kanban.data";
import type { IColumn } from "./kanban.types";

export function useKanbanQuery() {
  const { $appwrite } = useNuxtApp();
  const config = useRuntimeConfig();
  const customerCollectionId =
    (config.public as Record<string, string>).collectionCustomers ||
    "customers";

  const extractStringValue = (value: unknown): string | null => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    if (!value || typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    const candidates = [
      record.name,
      record.title,
      record.companyName,
      // record.company_name,
      record.customerName,
      // record.customer_name,
    ];

    for (const candidate of candidates) {
      const normalized = extractStringValue(candidate);
      if (normalized) {
        return normalized;
      }
    }

    const company = record.company;
    if (company && typeof company === "object") {
      const companyName = extractStringValue(
        (company as Record<string, unknown>).name,
      );
      if (companyName) {
        return companyName;
      }
    }

    const customer = record.customer;
    if (customer && typeof customer === "object") {
      const customerName = extractStringValue(
        (customer as Record<string, unknown>).name,
      );
      if (customerName) {
        return customerName;
      }
    }

    return null;
  };

  const getCompanyName = async (deal: IDeal) => {
    const possibleValues = [
      deal.companyName,
      // deal.company_name,
      deal.company?.name,
      deal.company?.title,
      deal.customer?.companyName,
      // deal.customer?.company_name,
      deal.customer?.name,
      deal.customer?.title,
      deal.customer?.company?.name,
      deal.customer?.company?.title,
    ];

    for (const value of possibleValues) {
      const normalized = extractStringValue(value);
      if (normalized) {
        return normalized;
      }
    }

    const customerRef = (deal as IDeal & { customer?: unknown }).customer;
    const customerId =
      typeof customerRef === "string"
        ? customerRef
        : customerRef && typeof customerRef === "object"
          ? (((customerRef as Record<string, unknown>).$id as
              | string
              | undefined) ??
            ((customerRef as Record<string, unknown>).id as string | undefined))
          : null;

    if (typeof customerId === "string" && customerId.trim()) {
      try {
        const customerDoc = await $appwrite.databases.getDocument(
          config.public.dbId,
          customerCollectionId,
          customerId,
        );
        const customerName = extractStringValue(
          (customerDoc as Record<string, unknown>).name,
        );
        if (customerName) {
          return customerName;
        }

        const customerCompanyName = extractStringValue(
          (customerDoc as Record<string, unknown>).companyName,
        );
        if (customerCompanyName) {
          return customerCompanyName;
        }
      } catch (error) {
        console.warn("Failed to resolve customer name for deal", error);
      }
    }

    return "N/A";
  };

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
          companyName: await getCompanyName(deal),
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

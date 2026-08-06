import type { IDeal } from "~/types/deals.types";

export function extractStringValue(value: unknown): string | null {
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
    record.customerName,
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
}

export function getCustomerId(deal: IDeal): string | null {
  const customerRef = (deal as IDeal & { customer?: unknown }).customer;

  if (typeof customerRef === "string") {
    return customerRef.trim() || null;
  }

  if (customerRef && typeof customerRef === "object") {
    const obj = customerRef as Record<string, unknown>;
    return (obj.$id as string | undefined) || (obj.id as string | undefined) || null;
  }

  return null;
}

export async function buildCustomerNameMap(
  appwrite: { databases: { listDocuments: Function } },
  dbId: string,
  customerCollectionId: string,
): Promise<Record<string, string>> {
  try {
    const result = await appwrite.databases.listDocuments(dbId, customerCollectionId);
    const map: Record<string, string> = {};
    for (const doc of result.documents) {
      const record = doc as Record<string, unknown>;
      const id = record.$id as string;
      if (id) {
        const name = extractStringValue(record.name) || extractStringValue(record.companyName) || "—";
        map[id] = name;
      }
    }
    return map;
  } catch {
    return {};
  }
}

export function getCompanyName(
  deal: IDeal,
  customerNameMap?: Record<string, string>,
): string {
  if (typeof deal.customer === "object" && deal.customer !== null) {
    const name = extractStringValue(
      (deal.customer as Record<string, unknown>).name,
    );
    if (name) return name;
  }

  const customerId = getCustomerId(deal);
  if (customerId && customerNameMap?.[customerId]) {
    return customerNameMap[customerId];
  }

  return "—";
}

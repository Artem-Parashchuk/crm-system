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

export async function getCompanyName(
  deal: IDeal,
  appwrite: { databases: { getDocument: Function } },
  dbId: string,
  customerCollectionId: string,
): Promise<string> {
  const possibleValues = [
    deal.companyName,
    deal.company?.name,
    deal.company?.title,
    deal.customer?.companyName,
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

  const customerId = getCustomerId(deal);

  if (customerId) {
    try {
      const customerDoc = await appwrite.databases.getDocument(
        dbId,
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
    } catch {
      // silently fail
    }
  }

  return "N/A";
}

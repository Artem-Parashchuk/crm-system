export interface StatsItem {
  key: string;
  label: string;
  icon: string;
  collectionKey: string;
}

export const STATS_CONFIG: StatsItem[] = [
  {
    key: "deals",
    label: "Угод",
    icon: "material-symbols:business-center-outline",
    collectionKey: "collectionDeals",
  },
  {
    key: "customers",
    label: "Клієнтів",
    icon: "material-symbols:group-outline",
    collectionKey: "collectionCustomers",
  },
  {
    key: "comments",
    label: "Коментарів",
    icon: "material-symbols:chat-outline",
    collectionKey: "collectionComments",
  },
];

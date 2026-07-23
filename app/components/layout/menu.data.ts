export interface MenuItem {
  name: string;
  url: string;
  icon: string;
}

export const MENU_DATA: MenuItem[] = [
  {
    name: "Головна",
    url: "/",
    icon: "material-symbols:home-outline",
  },
  {
    name: "Товари",
    url: "/products",
    icon: "gridicons:product",
  },
  {
    name: "Оплати",
    url: "/payments",
    icon: "material-symbols:payments-outline",
  },
  {
    name: "Замовлення",
    url: "/orders",
    icon: "material-symbols-light:draft-orders-outline",
  },
  {
    name: "Клієнти",
    url: "/customer",
    icon: "carbon:customer-service",
  },
  {
    name: "Відгуки",
    url: "/feedback",
    icon: "material-symbols:feedback-outline",
  },
  {
    name: "Налаштування",
    url: "/settings",
    icon: "material-symbols:settings-outline",
  },
  {
    name: "Допомога",
    url: "/help",
    icon: "material-symbols:help-outline",
  },
];

export interface MenuItem {
  name: string;
  url: string;
  icon: string;
}

export const MENU_DATA: MenuItem[] = [
  {
    name: "Home",
    url: "/",
    icon: "material-symbols:home-outline",
  },
  {
    name: "Products",
    url: "/products",
    icon: "gridicons:product",
  },
  {
    name: "Payments",
    url: "/payments",
    icon: "material-symbols:payments-outline",
  },
  {
    name: "Orders",
    url: "/orders",
    icon: "material-symbols-light:draft-orders-outline",
  },
  {
    name: "Customer",
    url: "/customer",
    icon: "carbon:customer-service",
  },
  {
    name: "Feedback",
    url: "/feedback",
    icon: "material-symbols:feedback-outline",
  },
  {
    name: "Settings",
    url: "/settings",
    icon: "material-symbols:settings-outline",
  },
  {
    name: "Help center",
    url: "/help",
    icon: "material-symbols:help-outline",
  },
];

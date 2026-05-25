import { Icons, type IconName } from "@/components/ui/AppIcon";

const STORE_NAME_ICONS: Record<string, IconName> = {
  Amazon: Icons.package,
  Walmart: Icons.cart,
  Target: Icons.tag,
  Costco: Icons.warehouse,
  "Best Buy": Icons.electronics,
  Starbucks: Icons.coffee,
};

const CATEGORY_ICONS: Record<string, IconName> = {
  "Grocery & General": Icons.cart,
  "Department Store": Icons.tag,
  "Online Retail": Icons.package,
  "Warehouse Club": Icons.warehouse,
  Electronics: Icons.electronics,
  Grocery: Icons.cart,
  Pharmacy: Icons.medical,
  "Home Improvement": Icons.hammer,
  "Dining & Coffee": Icons.coffee,
};

export function getStoreIcon(store: { name: string; category: string }): IconName {
  return STORE_NAME_ICONS[store.name] ?? CATEGORY_ICONS[store.category] ?? Icons.storefront;
}

export { TRENDING_STORE_NAMES } from "./storeBrands";

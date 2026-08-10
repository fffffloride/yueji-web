import { defineStore } from "pinia";
import { StorageKey } from "@/constants";
import store from "./index";

export interface CartItem {
  productId: string;
  skuId: string;
  name: string;
  skuName: string;
  cover: string;
  /** 单价（分） */
  price: number;
  quantity: number;
  /** 结算时是否勾选 */
  checked: boolean;
}

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));
  const checkedItems = computed(() => items.value.filter((item) => item.checked));
  const isAllChecked = computed(
    () => items.value.length > 0 && items.value.every((item) => item.checked)
  );
  /** 已勾选商品的合计金额（分）。 */
  const checkedAmount = computed(() =>
    checkedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  function findIndex(skuId: string) {
    return items.value.findIndex((item) => item.skuId === skuId);
  }

  function addItem(item: Omit<CartItem, "checked">) {
    const index = findIndex(item.skuId);
    if (index > -1) {
      items.value[index].quantity += item.quantity;
    } else {
      items.value.push({ ...item, checked: true });
    }
  }

  function updateQuantity(skuId: string, quantity: number) {
    const index = findIndex(skuId);
    if (index > -1) items.value[index].quantity = Math.max(1, quantity);
  }

  function removeItems(skuIds: string[]) {
    items.value = items.value.filter((item) => !skuIds.includes(item.skuId));
  }

  function toggleChecked(skuId: string, checked: boolean) {
    const index = findIndex(skuId);
    if (index > -1) items.value[index].checked = checked;
  }

  function toggleAllChecked(checked: boolean) {
    items.value.forEach((item) => {
      item.checked = checked;
    });
  }

  function clear() {
    items.value = [];
  }

  return {
    items,
    totalCount,
    checkedItems,
    isAllChecked,
    checkedAmount,
    addItem,
    updateQuantity,
    removeItems,
    toggleChecked,
    toggleAllChecked,
    clear,
  };
}, {
  persist: { key: StorageKey.CART, paths: ["items"] },
});

export function useCartStoreHook() {
  return useCartStore(store);
}

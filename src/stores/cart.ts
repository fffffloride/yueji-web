import { defineStore } from "pinia";
import CartAPI, { type CartItem } from "@/api/cart";
import store from "./index";

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);
  const loading = ref(false);
  let pendingFetch: Promise<void> | undefined;

  const validItems = computed(() => items.value.filter((item) => !item.invalid));
  const totalCount = computed(() =>
    validItems.value.reduce((sum, item) => sum + item.quantity, 0)
  );
  const checkedItems = computed(() => validItems.value.filter((item) => item.checked));
  const isAllChecked = computed(
    () => validItems.value.length > 0 && validItems.value.every((item) => item.checked)
  );
  const checkedAmount = computed(() =>
    checkedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  function fetch(silent = false): Promise<void> {
    if (pendingFetch) return pendingFetch;
    loading.value = true;
    pendingFetch = CartAPI.getList()
      .then((rows) => {
        items.value = rows;
      })
      .catch((error: unknown) => {
        if (!silent) throw error;
      })
      .finally(() => {
        loading.value = false;
        pendingFetch = undefined;
      });
    return pendingFetch;
  }

  async function refreshAfterMutation() {
    if (pendingFetch) await pendingFetch;
    await fetch();
  }

  async function add(skuId: string, quantity = 1) {
    await CartAPI.add({ skuId, quantity });
    await refreshAfterMutation();
  }

  async function updateQuantity(id: string, quantity: number) {
    await CartAPI.update(id, { quantity });
    await refreshAfterMutation();
  }

  async function toggleChecked(id: string, checked: boolean) {
    await CartAPI.update(id, { checked: checked ? 1 : 0 });
    await refreshAfterMutation();
  }

  async function toggleAllChecked(checked: boolean) {
    const targets = validItems.value.filter((item) => item.checked !== checked);
    await Promise.all(
      targets.map((item) => CartAPI.update(item.id, { checked: checked ? 1 : 0 }))
    );
    await refreshAfterMutation();
  }

  async function remove(id: string) {
    await CartAPI.remove(id);
    await refreshAfterMutation();
  }

  function clear() {
    items.value = [];
  }

  return {
    items,
    loading,
    totalCount,
    checkedItems,
    isAllChecked,
    checkedAmount,
    fetch,
    add,
    updateQuantity,
    toggleChecked,
    toggleAllChecked,
    remove,
    clear,
  };
});

export function useCartStoreHook() {
  return useCartStore(store);
}

export type { CartItem };

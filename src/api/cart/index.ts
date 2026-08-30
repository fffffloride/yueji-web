import { request } from "@/utils/request";
import type { CartAddForm, CartItem, CartUpdateForm } from "./types";

const CART_BASE_URL = "/app/cart";

interface ServerCartItem extends Omit<CartItem, "checked"> {
  checked: boolean | number;
}

const CartAPI = {
  async getList(): Promise<CartItem[]> {
    const rows = await request<ServerCartItem[]>({ url: CART_BASE_URL });
    return (rows ?? []).map((row) => ({ ...row, checked: Boolean(row.checked) }));
  },

  add(data: CartAddForm) {
    return request<void, CartAddForm>({ url: CART_BASE_URL, method: "POST", data });
  },

  update(id: string, data: CartUpdateForm) {
    return request<void, CartUpdateForm>({
      url: `${CART_BASE_URL}/${id}`,
      method: "PUT",
      data,
    });
  },

  remove(id: string) {
    return request<void>({ url: `${CART_BASE_URL}/${id}`, method: "DELETE" });
  },
};

export default CartAPI;
export * from "./types";

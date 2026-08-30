/** 服务端购物车项。 */
export interface CartItem {
  id: string;
  productId: string;
  skuId: string;
  quantity: number;
  checked: boolean;
  productName: string;
  productImage: string;
  skuName: string;
  /** 当前 SKU 售价（分） */
  price: number;
  stock: number;
  invalid: boolean;
}

export interface CartAddForm {
  skuId: string;
  quantity: number;
}

export interface CartUpdateForm {
  quantity?: number;
  checked?: 0 | 1;
}

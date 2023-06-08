import { Product } from "./types";
import { getProductStore } from "./store";

export interface ListProductsInput {}

export async function listProducts<P extends Product = Product>({}: ListProductsInput = {}): Promise<
  P[]
> {
  const store = getProductStore<P>();
  return store.values();
}

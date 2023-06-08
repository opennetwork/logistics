import { Product } from "./types";
import { getProductStore } from "./store";
import {isAnonymous} from "../../authentication";

export interface ListProductsInput {
  // Only return generic products
  generic?: boolean;
  // Only return public products, regardless if the user is anonymous
  public?: boolean;
}

export async function listProducts<P extends Product = Product>(options: ListProductsInput = {}): Promise<
  P[]
> {
  const store = getProductStore<P>();
  let products = await store.values();
  if (isAnonymous() || options.public) {
    // Force public only
    products = products.filter(value => value.public);
  }
  if (options.generic) {
    products = products.filter(value => value.generic);
  }
  return products;
}

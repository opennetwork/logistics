import {getOrderProductStore} from "./store";
import {OrderProduct, SetOrderProduct} from "./types";

export async function setOrderProduct(data: SetOrderProduct): Promise<OrderProduct> {
  const store = await getOrderProductStore(data.orderId);
  const updatedAt = new Date().toISOString();
  const document: OrderProduct = {
    createdAt: data.createdAt || updatedAt,
    ...data,
    quantity: data.quantity ?? 1, // Notice ?? use
    identifiers: data.identifiers ?? [],
    updatedAt,
  };
  await store.set(data.orderProductId, document);
  return document;
}

export async function setOrderProducts(products: SetOrderProduct[]): Promise<OrderProduct[]> {
  const result: OrderProduct[] = [];
  // Add in serial... it's not needing to be fast right now
  for (const data of products) {
    result.push(await setOrderProduct(data));
  }
  return result;
}
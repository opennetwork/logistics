import { v4 } from "uuid";
import { OrderProduct, OrderProductData } from "./types";
import {setOrderProduct, setOrderProducts} from "./set-order-products";

export async function addOrderProduct(data: OrderProductData): Promise<OrderProduct> {
  return setOrderProduct({
    ...data,
    orderProductId: v4()
  });
}

export async function addOrderProducts(data: OrderProductData[]): Promise<OrderProduct[]> {
  return setOrderProducts(data.map(data => ({
    ...data,
    orderProductId: v4()
  })));
}

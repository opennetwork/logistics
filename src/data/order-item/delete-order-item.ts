import {getOrderItemStore} from "./store";

export async function deleteOrderItem(orderId: string, orderItemId: string) {
    const store = getOrderItemStore(orderId);
    return store.delete(orderItemId);
}
import { getOrderStore } from "./store";
import {listOrderItems, listOrderProducts, OrderItem} from "../order-item";
import {v4, v5} from "uuid";
import {createHash} from "crypto";
import {ok} from "../../is";
import {addExpiring, deleteCached, getCached} from "../cache";
import {DAY_MS, getExpiresAt} from "../expiring-kv";
import {Order} from "./types";
import {setOrder} from "./set-order";
import {ShipmentLocation} from "../shipment";
import {isOrderShipmentLocationMatch} from "./list-orders";

const PENDING_ORDER_ID = "PendingOrder";
const PENDING_ORDER_EXPIRES_IN = 7 * DAY_MS;

export async function getOrder(id: string, location?: ShipmentLocation): Promise<Order> {
  const store = getOrderStore();
  const order = await store.get(id);
  if (!order) return undefined;
  if (location && !isOrderShipmentLocationMatch(order, location)) return undefined;
  const items = await listOrderItems(order.orderId);
  return {
    ...order,
    items,
    products: await listOrderProducts(order.orderId, true, items)
  }
}

function getUserPendingOrderCacheKey(userId: string) {
  return `${PENDING_ORDER_ID}::${userId}`;
}

// Gets an existing orderId, or creates a new one
export async function getUserPendingOrderId(userId: string): Promise<string> {
  const key = getUserPendingOrderCacheKey(userId);
  const cached = await getCached(key, true);
  if (cached) return cached;
  const { orderId } = await getUserPendingOrder(userId, false);
  return orderId;
}

export async function getUserPendingOrder(userId: string, loadItems = true): Promise<Order> {
  const key = getUserPendingOrderCacheKey(userId);
  const cached = await getCached(key, true);
  const orderId = cached ?? v4();
  let order = await getOrder(orderId, {
    userId
  });
  const items: OrderItem[] = loadItems ? await listOrderItems(orderId) : [];

  if (order) {
    if (order.status !== "pending") {
      console.log("Getting new pending order, previous no longer pending");
      await deleteCached(key, true);
      return getUserPendingOrder(userId);
    }
  } else {
    console.log("Creating new pending order");
    order = await setOrder({
      orderId,
      status: "pending",
      to: {
        userId
      }
    });

    await addExpiring({
      key,
      value: orderId,
      expiresAt: getExpiresAt(PENDING_ORDER_EXPIRES_IN),
      stable: true
    });
  }

  return {
    ...order,
    items,
    products: await listOrderProducts(orderId, true, items)
  }
}
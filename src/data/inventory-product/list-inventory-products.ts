import {InventoryProduct, InventoryProductStatus} from "./types";
import { getInventoryProductStore } from "./store";
import {listInventory, ListInventoryInput} from "../inventory";

export interface ListInventoryProductsInput extends ListInventoryInput {
  inventoryId?: string;
  productId?: string;
  status?: InventoryProductStatus;
}

export async function listInventoryProducts(options: ListInventoryProductsInput): Promise<
    InventoryProduct[]
> {
  // TODO make this not all in memory
  // Its okay for now :)
  const { inventoryId } = options;
  if (!inventoryId) {
    const inventory = await listInventory(options);
    const values = await Promise.all(
        inventory.map(
            async ({ inventoryId }) => listInventoryProducts({
              ...options,
              inventoryId
            })
        )
    );
    return values.flatMap<InventoryProduct>(value => value);
  }
  const { productId, status } = options;
  const store = getInventoryProductStore(inventoryId);
  let values = await store.values();
  if (productId) {
    values = values.filter(value => value.productId === productId);
  }
  if (status) {
    values = values.filter(value => value.status === status);
  }
  return values;
}

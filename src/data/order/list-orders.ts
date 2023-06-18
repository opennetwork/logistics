import {Order, OrderStatus} from "./types";
import { getOrderStore } from "./store";
import {ShipmentFrom, ShipmentLocation, ShipmentTo} from "../shipment";

export interface ListOrdersInput {
  status?: OrderStatus;
  from?: ShipmentFrom;
  to?: ShipmentTo;
}

export async function listOrders({ status, from, to }: ListOrdersInput = {}): Promise<
  Order[]
> {
  const store = getOrderStore();
  let values = await store.values();
  if (from) {
    values = values.filter(value => {
      if (!value.from) return false;
      return isShipmentLocationMatch(from, value.from);
    });
  }
  if (to) {
    values = values.filter(value => {
      if (!value.to) return false;
      return isShipmentLocationMatch(to, value.to);
    });
  }
  if (status) {
    values = values.filter(value => value.status === status);
  }
  return values.sort((a, b) => new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime() ? -1 : 1)


}

function isShipmentLocationMatch(base: ShipmentLocation, match: ShipmentLocation) {
  return (
      (
          !base.organisationId ||
          base.organisationId === match.organisationId
      ) &&
      (
          !base.locationId ||
          base.locationId === match.locationId
      ) &&
      (
          !base.inventoryId ||
          base.inventoryId === match.inventoryId
      ) &&
      (
          !base.inventoryProductId ||
          base.inventoryProductId === match.inventoryProductId
      ) &&
      (
          !base.countryCode ||
          base.countryCode === match.countryCode
      ) &&
      (
          !base.address ||
          (
              match.address &&
              base.address.length === match.address.length &&
              (
                  !base.address.length ||
                  base.address.every((value, index) => match.address[index] === value)
              )
          )
      )
  )
}
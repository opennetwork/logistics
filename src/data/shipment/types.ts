import {Identifier} from "../identifier";

export type ShipmentStatus = "pending" | "processing" | "sent" | "delivered";

export interface ShipmentLocation {
  organisationId?: string; // Optional fixed organisation
  locationId?: string; // Optional fixed location
  inventoryId?: string; // Optional fixed inventory set
  inventoryItemId?: string;  // Optional fixed inventory set
  address?: string[]; // Human-readable address
  countryCode?: string;
}

export interface ShipmentIdentifiers {
  identifiers?: Identifier[];
}

export interface ShipmentFrom extends ShipmentLocation, ShipmentIdentifiers {

}

export interface ShipmentTo extends ShipmentLocation, ShipmentIdentifiers {

}

export interface ShipmentData extends Record<string, unknown> {
  status: ShipmentStatus;
  // from is optional as you might receive with no info
  from?: ShipmentFrom;
  // A shipment would always have a destination
  to: ShipmentTo;
  identifiers?: Identifier[];
}

export interface Shipment extends ShipmentData {
  shipmentId: string;
  createdAt: string;
  updatedAt: string;
}

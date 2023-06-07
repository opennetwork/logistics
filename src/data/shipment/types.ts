export type ShipmentStatus = "pending" | "processing" | "sent" | "delivered";

export interface ShipmentLocation {
  locationId?: string; // Optional fixed location
  address?: string[]; // Human-readable address
  countryCode?: string;
}

export interface ShipmentFrom extends ShipmentLocation {

}

export interface ShipmentTo extends ShipmentLocation {

}

export interface ShipmentData extends Record<string, unknown> {
  status: ShipmentStatus;
  // from is optional as you might receive with no info
  from?: ShipmentFrom;
  // A shipment would always have a destination
  to: ShipmentTo;
}

export interface Shipment extends ShipmentData {
  shipmentId: string;
  createdAt: string;
  updatedAt: string;
}

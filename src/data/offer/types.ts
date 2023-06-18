import {Identifier} from "../identifier";

export interface ProductOfferItem {
  type: "product";
  productId: string;
  identifiers?: Identifier[];
}

export type OfferItem =
    | ProductOfferItem

export type OfferItemType = OfferItem["type"];

export type OfferStatus =
    | "preSale"
    | "preOrder"
    | "onlineOnly"
    | "storeOnly"
    | "available"
    | "backOrder"
    | "limitedAvailability"
    | "soldOut"
    | "void"

export type NumberString = `${number}` | number;

export interface OfferData extends Record<string, unknown> {
  status: OfferStatus;
  items: OfferItem[];
  // The user that is providing this offer
  userId?: string;
  // The organisation that is providing this offer
  organisationId?: string;
  offerName?: string;
  // Is the offer publicly visible
  public?: boolean;
  price?: NumberString;
  currency?: string;
  countryCode?: string;
}

export interface Offer extends OfferData {
  offerId: string;
  createdAt: string;
  updatedAt: string;
}

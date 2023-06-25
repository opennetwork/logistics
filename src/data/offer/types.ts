import {Identifier} from "../identifier";


export type MaybeNumberString = `${number}` | string;

export interface OfferPrice {
  price: MaybeNumberString;
  locale?: string;
  currency: string;
  currencyCode?: string;
  currencySymbol?: string;
  countryCode?: string;
}

export interface ProductOfferItem {
  type: "product";
  productId: string;
  quantity?: number;
  identifiers?: Identifier[];
}

export type OfferItem =
    | ProductOfferItem

export type OfferItemType = OfferItem["type"];

export type OfferStatus =
    | "speculative"
    | "preSale"
    | "preOrder"
    | "onlineOnly"
    | "storeOnly"
    | "available"
    | "backOrder"
    | "limitedAvailability"
    | "soldOut"
    | "void";

export interface OfferData extends Record<string, unknown>, Partial<OfferPrice> {
  status: OfferStatus;
  items: OfferItem[];
  // The user that is providing this offer
  userId?: string;
  // The organisation that is providing this offer
  organisationId?: string;
  offerName?: string;
  // Is the offer publicly visible
  public?: boolean;
  countryCode?: string;
}

export interface Offer extends OfferData {
  offerId: string;
  createdAt: string;
  updatedAt: string;
}

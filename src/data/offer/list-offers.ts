import { Offer } from "./types";
import { getOfferStore } from "./store";

export interface ListOffersInput {
  // Only return public offers, regardless if the user is anonymous
  public?: boolean;
}

export async function listOffers<P extends Offer = Offer>(options: ListOffersInput = {}): Promise<
  P[]
> {
  const store = getOfferStore<P>();
  let offers = await store.values();
  if (options.public) {
    // Force public only
    offers = offers.filter(value => value.public);
  }
  return offers;
}

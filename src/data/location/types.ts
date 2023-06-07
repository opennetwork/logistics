export interface LocationData extends Record<string, unknown> {
  locationName: string;
  address?: string[];
  countryCode?: string;
}

export interface Location extends LocationData {
  locationId: string;
  createdAt: string;
  updatedAt: string;
}

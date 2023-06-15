export interface AttendeeData {
    reference: string;
    name?: string;
    email?: string;
}

export interface Attendee extends AttendeeData {
    attendeeId: string;
    createdAt: string;
}

export type PartialAttendee = AttendeeData & Partial<Attendee>;

export type SystemRole = "system";

export type AuthenticationRole =
  | "moderator"
  | "admin"
  | "owner"
  | "member"
  | "booster"
  | "industry"
  | "developer"
  | "coordinator"
  | "partner"
  | SystemRole;

export type AttendeeAuthorisationType = "attendee";
export type HappeningAuthorisationType = "happening";

export type AuthorisationType = AttendeeAuthorisationType | HappeningAuthorisationType;

export interface AuthorisationData {
    type: AuthorisationType;
    attendeeId?: string;
    happeningId?: string;
    notifications?: AuthorisationNotificationData[];
}

export interface Authorisation extends AuthorisationData {
    authorisationId: string;
    createdAt: string;
    updatedAt: string;
    notifiedAt?: string;
    declinedAt?: string;
    authorisedAt?: string;
}

export type AuthorisationNotificationType = (
    | "payment"
    | "message"
);

export interface AuthorisationNotificationData extends Record<string, unknown> {
    type: AuthorisationNotificationType;
}

export interface AuthorisationNotification extends AuthorisationNotificationData {
    notificationId: string;
    authorisationId: string;
    createdAt: string;
    stateId?: string;
}

export interface Expiring {
    expiresAt?: string;
}

export type BaseFileStoreType = "product" | "inventory" | "productFile" | "inventoryFile"
export type BaseFileRemoteSourceName = "discord" | BaseFileStoreType;
export type RemoteFileSourceName = BaseFileRemoteSourceName | `${BaseFileRemoteSourceName}_${number}`;

export type FileUploadedSynced = "r2" | "disk";
export type FileType = BaseFileStoreType | `${RemoteFileSourceName}_import`;

export interface ResolvedFilePart extends Record<string, unknown> {

}

export interface FileImageSize extends Expiring {
  width: number;
  height: number;
  signed?: boolean;
  fileName?: string;
  checksum?: Record<string, string>
}

export interface FileSize extends FileImageSize {
  url: string;
  synced: FileUploadedSynced;
  syncedAt: string;
  version: number;
  watermark?: boolean;
  copyright?: string;
  license?: string;
  fileName?: string;
  signed?: boolean;
}

export interface FileErrorDescription {
  stack?: string;
  message: string;
  createdAt: string;
  repeated?: number;
}

export interface FileData extends Record<string, unknown>, Partial<FileImageSize> {
  fileName: string;
  contentType: string;
  size?: number;
  path?: string;
  url?: string;
  pinned?: boolean;
  uploadedAt?: string;
  uploadedByUsername?: string;
  source?: RemoteFileSourceName;
  sourceId?: string;
  synced?: FileUploadedSynced;
  syncedAt?: string;
  version?: number;
  type?: FileType | string;
  sizes?: FileSize[];
  /** @deprecated use remoteUrl */
  externalUrl?: string;
  remoteUrl?: string;
  reactionCounts?: Record<string, number>;
  reactionCountsUpdatedAt?: string;
  resolved?: ResolvedFilePart[];
  resolvedAt?: string;
  errors?: FileErrorDescription[];
}

export interface File extends FileData {
  fileId: string;
  createdAt: string;
  updatedAt: string;
  uploadedAt: string;
}

export interface ResolvedFile extends File {
  url: string;
  synced: FileUploadedSynced;
}

export interface FormMetaData extends Record<string, unknown> {}

export interface FormMeta extends FormMetaData {
  formMetaId: string;
  userId?: string;
  partnerId?: string;
  createdAt: string;
  updatedAt: string;
}

export type HappeningType = (
    | "event"
    | "ticket"
    | "appointment"
    | "poll"
    | "payment"
    | "bill"
    | "activity"
    | "report"
    | "availability"
    | "intent"
    | "swap"
);

export interface HappeningTreeData extends HappeningEventData {
    type?: HappeningType | string;
    attendees?: (string | AttendeeData)[]
    children?: (string | HappeningTreeData)[]
}

export interface HappeningOptionData extends Record<string, unknown> {
    type?: HappeningType | string;
}

export interface HappeningEventData extends Record<string, unknown> {
    startAt?: string // Intended start time
    startedAt?: string // Actual start time
    endAt?: string // Intended end time
    endedAt?: string // Actual end time
    createdAt?: string
    type?: HappeningType | string;
    reference?: string;
    url?: string;
    title?: string;
    description?: string;
    options?: HappeningOptionData[];
}

export interface HappeningData extends HappeningEventData {
    type?: HappeningType | string;
    parent?: string
    children?: string[];
    attendees?: string[];
    timezone?: string;
}

export interface Happening extends HappeningData {
    type: HappeningType | string;
    happeningId: string;
    partnerId?: string;
    userId?: string;
}

export type PartialHappening = HappeningData & Partial<Happening>

export interface HappeningTree extends HappeningEventData {
    happeningId: string;
    type: HappeningType | string;
    parent?: HappeningTree;
    children: HappeningTree[];
    attendees: Attendee[];
    partnerId?: string;
    partner?: Partner;
    userId?: string;
}

export interface Identifier {
    type: string;
    identifier: string;
    identifiedAt: string;
}

export interface InventoryData {
  products: (InventoryProductIdentifierData & Partial<InventoryProduct>)[];
}

export interface Inventory extends InventoryData {
  inventoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryProductIdentifierData {
  productId: string;
  quantity?: number; // Default 1
  identifiers?: Identifier[]; // Default []
}

export interface InventoryProductData extends InventoryProductIdentifierData {
  inventoryId: string;
}

export interface InventoryProduct extends InventoryProductData {
  inventoryProductId: string;
  createdAt: string;
  updatedAt: string;
}

export type SetInventoryProduct = InventoryProductData & Pick<InventoryProduct, "inventoryId" | "inventoryProductId"> & Partial<InventoryProduct>;

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

export type OrderStatus = "pending" | "submitted" | "processing" | "complete";

export interface OrderData {
  status: OrderStatus;
  products?: (OrderProductIdentifierData & Partial<OrderProduct>)[];
}

export interface Order extends OrderData {
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderProductIdentifierData {
  productId: string;
  quantity?: number; // Default 1
  identifiers?: Identifier[]; // Default []
}

export interface OrderProductData extends OrderProductIdentifierData {
  orderId: string;
}

export interface OrderProduct extends OrderProductData {
  orderProductId: string;
  createdAt: string;
  updatedAt: string;
}

export type SetOrderProduct = OrderProductData & Pick<OrderProduct, "orderId" | "orderProductId"> & Partial<OrderProduct>;

export interface OrganisationBaseData extends Record<string, unknown> {
  countryCode?: string; // "NZ"
  location?: string;
  remote?: boolean;
  onsite?: boolean;
  pharmacy?: boolean;
  delivery?: boolean;
  clinic?: boolean;
  website?: string;
  associatedBrandingTerms?: string[]; // Eg common names used to refer to the organisation by way of brand
}

export interface OrganisationData extends OrganisationBaseData {
  organisationName: string;
  partnerId?: string;
  approved?: boolean;
  approvedAt?: string;
}

export interface Organisation extends OrganisationData {
  organisationId: string;
  createdAt: string;
  updatedAt: string;
  approvedByUserId?: string;
}

export interface PartnerData extends Record<string, unknown> {
  partnerName: string;
  countryCode?: string;
}

export interface AddPartnerData extends PartnerData, OrganisationBaseData {}

export interface Partner extends PartnerData {
  partnerId: string;
  organisationId: string;
  accessToken?: string;
  createdAt: string;
  updatedAt: string;
  approved?: boolean;
  approvedAt?: string;
  approvedByUserId?: string;
}

export interface ProductData extends Record<string, unknown> {
  productName: string;
  // Is the product publicly visible
  public?: boolean;
  // Is the related not to a specific brand
  generic?: boolean;

  // User provided organisation name associated with this product
  organisationText?: string;
  // System resolved organisation name associated with this product
  organisationName?: string;
  // System associated organisation name associated with this product
  organisationId?: string;
}

export interface Product extends ProductData {
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export type ShipmentStatus = "pending" | "processing" | "sent" | "delivered";

export interface ShipmentLocation {
  locationId?: string; // Optional fixed location
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
}

export interface Shipment extends ShipmentData {
  shipmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemLogData extends Record<string, unknown> {
    uniqueCode?: string;
    value?: number;
    partnerId: string;
    message: string;
    timestamp?: string;
    action?: string;
}

export interface SystemLog extends SystemLogData {
    systemLogId: string;
    timestamp: string;
}
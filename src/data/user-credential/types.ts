import {Expiring} from "../expiring";

export interface UserCredentialData extends Expiring {
  userId: string;
  credentialId: string;
  deviceId?: string;
  name?: string;
  verifiedAt?: string;
  authenticatorUserId?: string;
}

export interface UserCredential extends UserCredentialData {
  userCredentialId: string;
  createdAt: string;
  updatedAt: string;
}

export type SetUserCredential = UserCredentialData & Pick<UserCredential, "userId"> & Partial<UserCredential>;
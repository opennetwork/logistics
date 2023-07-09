import {Expiring} from "../expiring";

export interface ChangeOptionData extends Record<string, unknown> {
  type?: string;
}

export interface ChangeTargetType {
  type: string;
}

export interface ChangeTarget extends ChangeTargetType {
  id: string;
}


export interface ChangeTargetIdentifier {
  type: string;
  target: ChangeTargetType;
}

export interface ChangeData extends ChangeTargetIdentifier, Expiring {
  target: ChangeTarget;
  userId?: string;
  options?: ChangeOptionData;
  data?: Record<string, unknown>;
}

export interface Change extends ChangeData {
  changeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeIdentifier extends ChangeTargetIdentifier {
  changeId: string;
}

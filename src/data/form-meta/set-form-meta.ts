import { getFormMetaStore } from "./store";
import { FormMeta, FormMetaData } from "./types";
import { v4 } from "uuid";
import {getMaybePartner, getMaybeUser} from "../../authentication";

export async function setFormMeta(
  data: FormMetaData & Partial<FormMeta>
): Promise<FormMeta> {
  const store = getFormMetaStore();
  const formMetaId = data.formMetaId || v4();
  const createdAt = data.createdAt || new Date().toISOString();
  const userId = getMaybeUser()?.userId;
  const partnerId = getMaybePartner()?.partnerId;
  const meta: FormMeta = {
    updatedAt: createdAt,
    createdAt,
    ...data,
    partnerId,
    userId,
    formMetaId,
  };
  await store.set(formMetaId, meta);
  return meta;
}

import {getFileStore, getNamedFileStore, isNamedFileType} from "./store";
import { File, FileData } from "./types";
import { v4 } from "uuid";
import {KeyValueStore} from "../storage";

export async function setFile(
  data: FileData & Partial<File>,
  givenStore?: KeyValueStore<File>
): Promise<File> {
  const fileId = data.fileId || v4();
  const createdAt = data.createdAt || new Date().toISOString();
  const meta: File = {
    updatedAt: createdAt,
    createdAt,
    ...data,
    uploadedAt: data.uploadedAt || createdAt,
    fileId,
  };
  const store = getStore();
  await store.set(fileId, meta);
  return meta;

  function getStore() {
    if (givenStore) {
      return givenStore;
    }
    if (isNamedFileType(meta.type)) {
      const typedId = meta[`${meta.type}Id`];
      if (typedId && typeof typedId === "string") {
        return getNamedFileStore(meta.type, typedId);
      }
    }
    return getFileStore();
  }
}

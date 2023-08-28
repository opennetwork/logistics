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
  if (givenStore) {
    await givenStore.set(fileId, meta);
  } else if (isNamedFileType(meta.type)) {
    const typedId = meta[`${meta.type}Id`];
    if (typedId && typeof typedId === "string") {
      const namedStore = getNamedFileStore(meta.type, typedId);
      await namedStore.set(fileId, meta);
      return meta;
    }
  } else {
    const store = getFileStore();
    await store.set(fileId, meta);
  }
  return meta;
}

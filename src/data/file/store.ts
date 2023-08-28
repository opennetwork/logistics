import { getKeyValueStore } from "../storage";
import {File, FileType} from "./types";
import {ok} from "../../is";
import {isRemoteFileSourceName} from "./source";

const STORE_NAME = "file";
// productFile, namedFile
const NAMED_STORE_SUFFIX = "File";

export const NAMED_FILE_TYPE: FileType[] = [
    "product",
    "inventory",
    "service",
    "order",
    "offer"
];
const FILE_NAMES: string[] = NAMED_FILE_TYPE;

export function isNamedImportFileType(type?: string): type is FileType & `${string}_import` {
  if (!type) {
    return false;
  }
  return type.endsWith("_import");
}

export function isNamedFileType(type?: string): type is FileType {
  if (!type) {
    return false;
  }
  if (FILE_NAMES.includes(type)) {
    return true;
  }
  if (isRemoteFileSourceName(type)) {
    return true;
  }
  if (!isNamedImportFileType(type)) {
    return false;
  }
  return isRemoteFileSourceName(type.replace(/_import$/, ""));
}

export function getFileStore() {
  return getKeyValueStore<File>(STORE_NAME, {
    counter: false,
  });
}

export function getNamedFileStore(name: string, prefix?: string) {
  return getKeyValueStore<File>(`${name}${NAMED_STORE_SUFFIX}`, {
    counter: false,
    prefix
  });
}

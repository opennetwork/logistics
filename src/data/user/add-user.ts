import {
  ExternalUserReferenceData,
  User,
  UserData,
} from "./types";
import {setExternalReference, setUser} from "./set-user";
import {getExternalUser} from "./get-user";

export async function addUser(data: UserData) {
  return setUser(data);
}

export async function addExternalUser(
  data: UserData & ExternalUserReferenceData,
  existingUser?: User
) {
  const { externalId, externalType, ...rest } = data;

  const user = existingUser ?? await addUser({
    ...rest,
    externalType,
  });

  await setExternalReference({
    externalType,
    externalId,
    userId: user.userId,
    expiresAt: user.expiresAt,
  });

  return user;
}

export async function addAnonymousUser() {
  const user = await addUser({
    externalType: "anonymous",
  });
  await getExternalUser(user.externalType, user.userId, user);
  return user;
}
import { writeStoresToProject, generateStores } from "./generate-stores";

const sourceTypesProject = "@opennetwork/environments-schema-org-logistics"

await writeStoresToProject("./src/storage/stores/generated", generateStores(sourceTypesProject));

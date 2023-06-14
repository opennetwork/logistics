import {File, getRemoteSourceKey, getRemoteSources, TYPE_BASE_NAMES} from "../data";
import {importRemoteSource} from "../remote/import";
import {getResolvedUrl} from "../data/file/resolve-file";
import {ok} from "../is";
import {readFile} from "node:fs/promises";

const sources = getRemoteSources();

console.log({ sources });

const typed = sources.filter(source => getRemoteSourceKey(source, "url").includes(":typeId"));
const bases = sources.filter(source => !typed.includes(source));

const imported: File[] = [];

for (const source of bases) {
    const file = await importRemoteSource({
        source,
        json: true,
        async handler(input: unknown) {
            // console.log(input);
            return input;
        }
    });
    console.log(file);
    imported.push(file);
}


for (const withType of typed) {
    const type = TYPE_BASE_NAMES.find(name => withType.startsWith(name));
    const base = imported.find(file => file.source === type);
    console.log({ base, type });
    if (!base?.synced) continue;
    const ids = base.resolved.map(value => value[`${type}Id`] || value["id"]).filter(Boolean);
    console.log({ ids, json: base.resolved, type });
    if (!ids.length) continue;
    for (const typeId of ids) {
        ok(typeof typeId === "string");
        const file = await importRemoteSource({
            source: withType,
            typeId,
            json: true,
            files: withType.endsWith("File"),
            async handler(input: unknown) {
                // console.log(input);
                return input;
            }
        });
        console.log(file);
        imported.push(file);
    }
}
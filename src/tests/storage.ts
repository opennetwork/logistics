import {
    addHappening,
    addHappeningTree,
    deleteHappeningTree,
    getHappening,
    getHappeningTree,
    getTopHappeningTree, Happening, HappeningType, setAttendee
} from "../data";
import {ok} from "../is";
import {v4} from "uuid";
import {Chance} from "chance";
import {DAY_MS} from "../data/expiring-kv";
import {builder, use} from "../data/storage/hook";

const chance = new Chance();

{

    const store = builder<"value">()
        .use("set", (key, value) => {
            return undefined;
        })
        .use("get", (key, value) => {

        }, { stage: "after" })
        .use("has", (key, value) => {

        }, { stage: "after" })
        .build("storeName")


}
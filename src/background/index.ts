import {
    getBackground,
    seed,
} from "../data";
import {isLike} from "../is";

export interface BackgroundInput extends Record<string, unknown> {

}

export interface QueryInput extends BackgroundInput {
    query: Record<string, string>
}

function isQueryInput(input: BackgroundInput): input is QueryInput {
    return isLike<QueryInput>(input) && !!input.query;
}

export async function background(input: BackgroundInput = {}) {

    console.log(`Running background tasks`, input);

    const complete = await getBackground({
        // someInitialData: "start"
    });

    if (isQueryInput(input) && input.query.seed) {
        await seed();
    }

    // TODO add background tasks here

    await complete({
        // someCompletedData: "complete"
    });

}
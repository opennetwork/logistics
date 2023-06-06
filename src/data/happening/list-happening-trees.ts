import {createGetHappeningTreeContext, getHappeningTree} from "./get-happening-tree";
import {ListHappeningInput, listHappenings} from "./list-happenings";
import {getAttendee} from "../attendee";

export interface ListHappeningTreesInput extends ListHappeningInput {

}

export async function listHappeningTrees(options?: ListHappeningTreesInput) {
    const happenings = await listHappenings(options);
    const attendeeIds = [...new Set(happenings.flatMap(happening => happening.attendees))];
    const attendees = await Promise.all(attendeeIds.map(getAttendee));
    const context = createGetHappeningTreeContext(happenings, attendees);

    const nonUniqueTrees = await Promise.all(
        happenings.map(
            ({ happeningId }) => getHappeningTree(happeningId, context)
        )
    );

    // These trees without parents will contain all trees in nonUniqueTrees
    return nonUniqueTrees.filter(
        tree => !tree.parent
    );
}
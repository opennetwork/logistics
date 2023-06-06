import {HappeningData, HappeningTreeData, PartialHappening} from "./types";
import {setHappening} from "./set-happening";
import {v4} from "uuid";
import {createGetHappeningTreeContext, getHappeningTree} from "./get-happening-tree";
import {attr} from "cheerio/lib/api/attributes";
import {Attendee, AttendeeData, setAttendee} from "../attendee";
import {getHappening} from "./get-happening";

export async function addHappening(data: HappeningData) {
   return setHappening(data);
}

export async function addHappeningTree(data: HappeningTreeData) {
   const attendeeInput = createAttendees(data);
   const attendees = attendeeInput.length ? await Promise.all(
       attendeeInput.map(setAttendee)
   ) : [];
   const attendeeMap = new Map(
       attendees.map(attendee => [attendee.reference, attendee])
   );
   const input = createHappenings(data);
   const [parent] = input;
   const output = await Promise.all(input.map(setHappening));
   return getHappeningTree(
       parent.happeningId,
       createGetHappeningTreeContext(output, attendees)
   );

   function createAttendees(tree: HappeningTreeData): AttendeeData[] {
      const { children, attendees } = tree;

      return [
          ...(attendees ?? []).map(attendee => {
              if (typeof attendee === "string") {
                  return { reference: attendee }
              }
              return attendee;
          }),
          ...(children ?? []).flatMap<AttendeeData>(createAttendees)
      ]
          .filter(
              (value, index, array) => {
                 const before = array.slice(0, index);
                 return !before.find(other => other.reference === value.reference);
              }
          )
   }

   function createHappenings(tree: HappeningTreeData, parent?: string): PartialHappening[] {
      const { children, attendees, ...data } = tree;
      const happeningId = v4();
      const EXISTING_TYPE = "existing-happening-ignore-for-db";
      const nextPartial: PartialHappening[] = children?.length ?
          children.flatMap<PartialHappening>(child => {
              if (typeof child === "string") {
                  return {
                      type: EXISTING_TYPE,
                      parent: happeningId,
                      happeningId: child
                  }
              }
              return createHappenings(child, happeningId)
          }) :
          [];

      const partial: PartialHappening = {
         ...data,
         parent,
         attendees: (attendees ?? [])
             .map(attendee => {
                if (typeof attendee === "string") {
                   return attendee
                }
                return attendee.reference;
             })
             .map(reference => attendeeMap.get(reference).attendeeId),
         children: nextPartial
             .filter(value => value.parent === happeningId)
             .map(value => value.happeningId),
         happeningId
      };

      return [
         partial,
         ...nextPartial.filter(value => value.type !== EXISTING_TYPE)
      ];
   }

}
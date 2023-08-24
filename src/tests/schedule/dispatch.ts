import {cron, dispatchEvent, on} from "../../events/schedule";
import {v4} from "uuid";
import {spy} from "sinon";
import {dispatchScheduledDurableEvents} from "../../events/schedule/dispatch-scheduled";
import {ok} from "../../is";
import {getDurableEvent} from "../../data";

{
    const cronKey = v4();
    const fn = spy()

    const remove = cron(cronKey, fn);

    await dispatchScheduledDurableEvents({
        cron: cronKey
    });

    ok(fn.called);
    remove();
}

{
    const type = v4();
    const fn = spy();

    await dispatchEvent({
        type
    });

    const remove = on(type, fn);

    await dispatchScheduledDurableEvents({
        event: {
            type
        }
    });

    ok(fn.called);
    remove();
}


{
    const type = v4();
    const fn = spy();

    const value = v4()

    await dispatchEvent({
        type,
        value
    });

    const remove = on(type, fn);

    await dispatchScheduledDurableEvents({
        event: {
            type,
        }
    });

    ok(fn.called);
    remove();

    const [[event]] = fn.args;

    ok(event);
    ok(event.value === value);

}

{
    const type = v4();
    const eventId = v4();
    const fn = spy();

    const value = v4()

    const initial = {
        type,
        eventId,
        value
    };
    ok(!await getDurableEvent(initial));

    await dispatchEvent(initial);

    ok(await getDurableEvent(initial));

    const remove = on(type, fn);

    await dispatchScheduledDurableEvents({
        event: {
            type,
            eventId
        }
    });

    ok(fn.called);
    remove();

    const [[event]] = fn.args;

    ok(event);
    ok(event.eventId === eventId);
    ok(event.value === value);

    const schedule = await getDurableEvent(event);
    ok(!schedule);
}
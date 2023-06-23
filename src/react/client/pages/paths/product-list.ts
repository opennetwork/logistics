import {ok} from "../../utils";

export async function productList() {

    const list = document.getElementById("product-list");
    ok(list);

    const knownAnchors = new WeakSet();

    setup();

    function setup() {
        const anchors = list.querySelectorAll("a[href^='/api']");
        console.log(anchors.length);

        for (let i = 0; i < anchors.length; i += 1) {
            const anchor = anchors.item(i);
            setupAnchor(anchor);
        }

        function setupAnchor(anchor: Element) {
            if (knownAnchors.has(anchor)) return;
            knownAnchors.add(anchor);

            anchor.addEventListener("click", (event) => {
                event.preventDefault();
                ok<HTMLAnchorElement>(anchor);

                anchor.classList.add("loading");
                anchor.classList.remove("error");
                anchor.classList.remove("loaded");

                void run()
                    .then(() => {
                        anchor.classList.add("loaded");
                        anchor.classList.remove("error");
                    })
                    .catch((error) => {
                        console.error(`Error loading ${anchor.href}`);
                        console.error(error);
                        anchor.classList.add("error");
                    })
                    .finally(() => {
                        anchor.classList.remove("loading");
                    })
            });

            async function run() {
                ok<HTMLAnchorElement>(anchor);
                const { href } = anchor;
                const url = new URL(href);
                // Remove any redirect functionality
                url.searchParams.delete("redirect");
                const response = await fetch(href);
                ok(response.ok);
                // Let it be empty but resolved... ? idk
                await response.text();
                const parent = anchor.closest("[id]");
                if (!parent) return location.reload(); // Fallback
                await reload(parent.getAttribute("id"));
            }
        }

        async function reload(id: string) {

            const url = new URL(location.href);

            url.pathname = url.pathname.replace(/\/$/, "");

            if (!url.pathname.endsWith("/fragment")) {
                url.pathname = `${url.pathname}/fragment`;
            }

            const response = await fetch(url);
            ok(response.ok);
            const text = await response.text();

            const template = document.createElement("template");

            template.innerHTML = text;
            const element = template.content.getElementById(id);

            if (!element) {
                console.log(`Expected ${id} to be in returned fragment`);
                return location.reload();
            }

            const cloned = element.cloneNode(true);

            const target = document.getElementById(id);

            ok(target, "Expected target");

            target.replaceWith(cloned);

            setup();
        }
    }

}
import SortableJS from "./sortable.complete.esm.js";

const CLOCK_MAX_SIZE = 32;
const CLOCK_SIZES = [2, 3, 4, 5, 6, 8, 10, 12];

export class ClockPanel extends Application {
    refresh = foundry.utils.debounce(this.render, 100);
    lastRendered = [];

    constructor(db, options) {
        super(options)
        this.db = db;
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: "clock-panel",
            popOut: false,
            template: "modules/global-progress-clocks/templates/clock-panel.hbs",
        };
    }

    get verticalEdge() {
        const position = game.settings.get("global-progress-clocks", "location");
        return position === "topRight" ? "top" : "bottom";
    }

    async getData(options) {
        const data = await super.getData(options);
        const clocks = await this.prepareClocks();
        return {
            ...data,
            options: {
                editable: game.user.isGM,
            },
            verticalEdge: this.verticalEdge,
            clocks: this.verticalEdge === "bottom" ? clocks.reverse() : clocks,
        };
    }

    async prepareClocks() {
        const clocks = this.db.contents;
        return clocks.map((data) => ({
            ...data,
            value: Math.clamped(data.value, 0, data.max),
            spokes: Array(data.max).keys(),
        }))
    }

    static registerDropdownListeners($html) {
        const inputElement = $html.find(".dropdown-wrapper input");

        $html.find(".dropdown li").on("mousedown", (event) => {
            inputElement.val(event.target.getAttribute("data-value"));
        });
    }

    activateListeners($html) {
        // Fade in all new rendered clocks
        const rendered = [...$html.get(0).querySelectorAll("[data-id]")].map((el) => el.dataset.id);
        const newlyRendered = rendered.filter((r) => !this.lastRendered.includes(r));
        for (const newId of newlyRendered) {
            gsap.fromTo($html.find(`[data-id=${newId}]`), { opacity: 0 }, { opacity: 1, duration: 0.25 });
        }

        // Update the last rendered list (to get ready for next cycle)
        this.lastRendered = rendered;

        $html.find(".clock").on("click", (event) => {
            const clockId = event.target.closest("[data-id]").dataset.id;
            const clock = this.db.get(clockId);
            if (!clock) return;

            clock.value = Math.min(clock.value + 1, clock.max);
            this.db.update(clock);
        });

        $html.find(".clock").on("contextmenu", (event) => {
            const clockId = event.target.closest("[data-id]").dataset.id;
            const clock = this.db.get(clockId);
            if (!clock) return;

            clock.value = Math.max(clock.value - 1, 0);
            this.db.update(clock);
        });

        $html.find("[data-action=add-clock]").on("click", async () => {
            const content = await renderTemplate("modules/global-progress-clocks/templates/clock-add-dialog.hbs", {
                max_size: CLOCK_MAX_SIZE,
                preset_sizes: CLOCK_SIZES,
            });

            await Dialog.prompt({
                title: game.i18n.localize("GlobalProgressClocks.CreateDialog.Title"),
                content,
                callback: async ($html) => {
                    const form = $html[0].querySelector("form");
                    const fd = new FormDataExtended(form);
                    this.db.addClock(fd.object);
                },
                rejectClose: false,
                render: ClockPanel.registerDropdownListeners,
            });
        });

        $html.find("[data-action=edit-clock]").on("click", async (event) => {
            const clockId = event.target.closest("[data-id]").dataset.id;
            const clock = this.db.get(clockId);
            if (!clock) return;

            const content = await renderTemplate("modules/global-progress-clocks/templates/clock-add-dialog.hbs", {
                clock,
                max_size: CLOCK_MAX_SIZE,
                preset_sizes: CLOCK_SIZES,
            });

            await Dialog.prompt({
                title: game.i18n.localize("GlobalProgressClocks.CreateDialog.Title"),
                content,
                callback: async ($html) => {
                    const form = $html[0].querySelector("form");
                    const fd = new FormDataExtended(form);
                    const updateData = { id: clock.id, ...fd.object };
                    updateData.value = Math.clamped(clock.value, 0, updateData.max);
                    this.db.update(updateData);
                },
                rejectClose: false,
                render: ClockPanel.registerDropdownListeners,
            });
        });

        $html.find("[data-action=delete-clock]").on("click", async (event) => {
            const clockId = event.target.closest("[data-id]").dataset.id;
            const clock = this.db.get(clockId);
            if (!clock) return;

            const deleting = await Dialog.confirm({
                title: game.i18n.localize("GlobalProgressClocks.DeleteDialog.Title"),
                content: game.i18n.format("GlobalProgressClocks.DeleteDialog.Message", { name: clock.name }),
            });
            
            if (deleting) {
                this.db.delete(clockId);
            }
        });

        // Drag/drop reordering
        new SortableJS($html.find(".clock-list").get(0), {
            animation: 200,
            direction: "vertical",
            draggable: ".clock-entry",
            dragClass: "drag-preview",
            ghostClass: "drag-gap",
            onEnd: (event) => {
                const id = event.item.dataset.id;
                const newIndex = event.newDraggableIndex;
                const numItems = $html.find(".clock-entry").length;
                this.db.move(id, this.verticalEdge === "top" ? newIndex : numItems - newIndex - 1);
            }
        });
    }
}
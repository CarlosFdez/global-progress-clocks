import { ClockAddDialog } from "./dialog.js";
import { MODULE_ID } from "./settings.js";
import SortableJS from "./sortable.complete.esm.js";

const fapi = foundry.applications.api;

export class ClockPanel extends fapi.HandlebarsApplicationMixin(fapi.Application) {
    refresh = foundry.utils.debounce(this.render.bind(this), 100);
    lastRendered = [];
    #sortable = null;

    constructor(db, options) {
        super(options)
        this.db = db;
    }

    static DEFAULT_OPTIONS = {
        id: "clock-panel",
        window: {
            frame: false,
            positioned: false,
        },
        actions: {
            addClock: ClockPanel.#onAddClock,
            addPoints: ClockPanel.#onAddPoints,
            editEntry: ClockPanel.#onEditEntry,
            deleteEntry: ClockPanel.#onDeleteEntry,
        }
    };

    static PARTS = {
        main: {
            template: "modules/global-progress-clocks/templates/clock-panel.hbs",
            scrollable: [".clock-list"],
        },
    };

    get horizontalEdge() {
        const location = game.settings.get(MODULE_ID, "location");
        return location === "topRight" ? "right" : "left";
    }

    get verticalEdge() {
        const location = game.settings.get(MODULE_ID, "location");
        return location === "topRight" ? "top" : "bottom";
    }

    async _prepareContext() {
        const clocks = await this.prepareClocks();
        
        return {
            options: {
                editable: game.user.isGM,
            },
            horizontalEdge: this.horizontalEdge,
            verticalEdge: this.verticalEdge,
            clocks: this.verticalEdge === "bottom" ? clocks.reverse() : clocks,
            verticalOffset: `${game.settings.get(MODULE_ID, "offset")}px`,
        };
    }

    async prepareClocks() {
        const clocks = this.db.contents;
        const clockColors = game.settings.get(MODULE_ID, "clockColors");
        const defaultColor = game.settings.get(MODULE_ID, "defaultColor");
        const backgroundColor = game.settings.get(MODULE_ID, "defaultBackgroundColor");
        const maxSpokes = 28; // limit when to render spokes to not fill with black
        return clocks.map((data) => ({
            ...data,
            value: Math.clamp(data.value, 0, data.max),
            backgroundColor,
            color: clockColors.find((c) => c.id === data.colorId)?.color ?? defaultColor,
            spokes: data.max > maxSpokes ? [] : Array(data.max).keys(),
        }))
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = this.element;

        // Place in correct location, based on the location property
        if (options.force) {
            const location = game.settings.get(MODULE_ID, "location");
            html.dataset.location = location;
            if (location === "topRight") {
                const element = document.querySelector("#ui-right-column-1");
                if (!element.contains(html)) element.prepend(html);
            } else {
                const element = document.querySelector("#ui-left-column-1");
                if (!element.contains(html)) {
                    const players = element.querySelector("#players");
                    element.insertBefore(html, players);
                }
            }
        }

        // Fade in all new rendered clocks
        const rendered = [...html.querySelectorAll("[data-id]")].map((el) => el.dataset.id);
        const newlyRendered = rendered.filter((r) => !this.lastRendered.includes(r));
        for (const newId of newlyRendered) {
            gsap.fromTo(html.querySelector(`[data-id="${newId}"]`), { opacity: 0 }, { opacity: 1, duration: 0.25 });
        }

        // Update the last rendered list (to get ready for next cycle)
        this.lastRendered = rendered;

        for (const clock of html.querySelectorAll(".clock, .points")) {
            clock.addEventListener("click", (event) => {
                const clockId = event.target.closest("[data-id]").dataset.id;
                const clock = this.db.get(clockId);
                if (!clock) return;
    
                clock.value = clock.value >= clock.max ? 0 : clock.value + 1;
                this.db.update(clock);
            });
    
            clock.addEventListener("contextmenu", (event) => {
                const clockId = event.target.closest("[data-id]").dataset.id;
                const clock = this.db.get(clockId);
                if (!clock) return;
    
                clock.value = clock.value <= 0 ? clock.max : clock.value - 1;
                this.db.update(clock);
            });
        }

        // Drag/drop reordering, make sure an item exists first
        this.#sortable?.destroy();
        this.#sortable = null;
        const clockList = html.querySelector(".clock-list");
        if (clockList) {
            this.#sortable = new SortableJS(clockList, {
                animation: 200,
                direction: "vertical",
                draggable: ".clock-entry",
                dragClass: "drag-preview",
                ghostClass: "drag-gap",
                onEnd: (event) => {
                    const id = event.item.dataset.id;
                    const newIndex = event.newDraggableIndex;
                    const numItems = html.querySelectorAll(".clock-entry").length;
                    this.db.move(id, this.verticalEdge === "top" ? newIndex : numItems - newIndex - 1);
                }
            });
        }
    }

    static #onAddClock() {
        new ClockAddDialog({
            complete: (data) => this.db.addClock(data)
        }).render({ force: true });
    }

    static #onAddPoints() {
        new ClockAddDialog({
            type: "points",
            complete: (data) => this.db.addClock(data)
        }).render({ force: true });
    }

    static #onEditEntry(event) {
        const clockId = event.target.closest("[data-id]").dataset.id;
        const entry = this.db.get(clockId);
        if (!entry) return;

        new ClockAddDialog({
            entry, 
            complete: (data) => this.db.update(data)
        }).render({ force: true });
    }

    static async #onDeleteEntry(event) {
        const clockId = event.target.closest("[data-id]").dataset.id;
        const clock = this.db.get(clockId);
        if (!clock) return;

        const deleting = await foundry.applications.api.Dialog.confirm({
            window: {
                title: game.i18n.localize("GlobalProgressClocks.DeleteDialog.Title"),
            },
            content: game.i18n.format("GlobalProgressClocks.DeleteDialog.Message", { name: clock.name }),
        });
        
        if (deleting) {
            this.db.delete(clockId);
        }
    }
}
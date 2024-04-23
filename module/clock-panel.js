import { ClockAddDialog } from "./dialog.js";
import { MODULE_ID } from "./settings.js";
import SortableJS from "./sortable.complete.esm.js";

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
            scrollY: [".clock-list"],
        };
    }

    get verticalEdge() {
        const position = game.settings.get(MODULE_ID, "location");
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
            offset: `${game.settings.get(MODULE_ID, "offset") / 16}rem`,
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
            value: Math.clamped(data.value, 0, data.max),
            backgroundColor,
            color: clockColors.find((c) => c.id === data.colorId)?.color ?? defaultColor,
            spokes: data.max > maxSpokes ? [] : Array(data.max).keys(),
        }))
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

            clock.value = clock.value >= clock.max ? 0 : clock.value + 1;
            this.db.update(clock);
        });

        $html.find(".clock").on("contextmenu", (event) => {
            const clockId = event.target.closest("[data-id]").dataset.id;
            const clock = this.db.get(clockId);
            if (!clock) return;

            clock.value = clock.value <= 0 ? clock.max : clock.value - 1;
            this.db.update(clock);
        });

        $html.find("[data-action=add-clock]").on("click", async () => {
            new ClockAddDialog(null, (data) => this.db.addClock(data)).render(true);
        });

        $html.find("[data-action=edit-clock]").on("click", async (event) => {
            const clockId = event.target.closest("[data-id]").dataset.id;
            const clock = this.db.get(clockId);
            if (!clock) return;

            new ClockAddDialog(clock, (data) => this.db.update(data)).render(true);
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
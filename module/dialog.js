import { MODULE_ID } from "./settings.js";

const CLOCK_MAX_SIZE = 32;
const CLOCK_SIZES = [2, 3, 4, 5, 6, 8, 10, 12];

export class ClockAddDialog extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: "GlobalProgressClocks.CreateDialog.Title",
            template: "modules/global-progress-clocks/templates/clock-add-dialog.hbs",
            classes: ["dialog"],
            width: 400,
            submitOnChange: false,
        });
    }

    get id() {
        return this.clock ? `${this.clock.id}-edit-global-prog-clock` : `add-global-prog-clock`;
    }

    get title() {
        return game.i18n.localize(`GlobalProgressClocks.CreateDialog.${this.clock ? "EditTitle" : "Title"}`);
    }

    constructor(clock, complete) {
        super(clock);
        this.clock = clock;
        this.complete = complete;
    }

    async getData(options) {
        const data = await super.getData(options);
        return {
            ...data,
            clock: this.clock,
            maxSize: CLOCK_MAX_SIZE,
            presetSizes: CLOCK_SIZES,
            clockColors: game.settings.get(MODULE_ID, "clockColors"),
        }
    }

    activateListeners($html) {
        super.activateListeners($html);

        const inputElement = $html.find(".dropdown-wrapper input");
        $html.find(".dropdown li").on("mousedown", (event) => {
            inputElement.val(event.target.getAttribute("data-value"));
        });
    }

    _updateObject(event, data) {
        if (event.submitter.dataset.button !== "yes") {
            return;
        }

        data.max = Math.max(data.max, 1);
        if (this.clock) {
            data.id = this.clock.id;
            data.value = Math.clamped(data.value, 0, data.max);
        }

        this.complete(data);
    }
}
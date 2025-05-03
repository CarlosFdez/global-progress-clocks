import { MODULE_ID } from "./settings.js";

const CLOCK_MAX_SIZE = 32;
const CLOCK_SIZES = [2, 3, 4, 5, 6, 8, 10, 12];

const fapi = foundry.applications.api;

export class ClockAddDialog extends fapi.HandlebarsApplicationMixin(fapi.Application) {
    static DEFAULT_OPTIONS = {
        classes: ["dialog", "add-clock-form", "standard-form"],
        tag: "form",
        position: {
            width: 400,
        },
        window: {
            icon: "fa-solid fa-clock",
            title: "GlobalProgressClocks.CreateDialog.Title",
        },
        form: {
            handler: ClockAddDialog.#onUpdateObject,
            closeOnSubmit: true,
        }
    };

    static PARTS = {
        main: {
            template: "modules/global-progress-clocks/templates/clock-add-dialog.hbs",
            root: true,
        },
    };

    get id() {
        return this.entry ? `${this.entry.id}-edit-global-prog-clock` : `add-global-prog-clock`;
    }

    get title() {
        const key = (this.entry ? "EditTitle" : "Title") + (this.type === "points" ? "Points" : "");
        return game.i18n.localize(`GlobalProgressClocks.CreateDialog.${key}`);
    }

    constructor(options) {
        super(options);
        this.entry = options.entry ?? null;
        this.type = options.type ?? options.entry?.type ?? "clock";
        this.complete = options.complete;
    }

    async _prepareContext() {
        return {
            type: this.type,
            entry: this.entry,
            maxSize: CLOCK_MAX_SIZE,
            presetSizes: CLOCK_SIZES,
            clockColors: game.settings.get(MODULE_ID, "clockColors"),
        }
    }

    _onRender(...args) {
        super._onRender(...args);
        const html = this.element;
        const inputElement = html.querySelector(".dropdown-wrapper input");
        for (const dropdownElement of html.querySelectorAll(".dropdown li")) {
            dropdownElement.addEventListener("mousedown", (event) => {
                inputElement.value = event.target.getAttribute("data-value");
            });
        }
    }

    static #onUpdateObject(event, _form, formData) {
        if (event.type !== "submit" || event.submitter.dataset.button !== "yes") {
            return;
        }

        const data = formData.object;
        data.type ??= this.type;
        data.max = this.type === "points" ? 99 : Math.max(data.max, 1);
        if (this.entry) {
            data.id = this.entry.id;
            data.value = Math.clamp(data.value, 0, data.max);
        }

        this.complete(data);
    }
}
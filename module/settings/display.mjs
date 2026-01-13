import { MODULE_ID } from "../values.mjs";
const fapi = foundry.applications.api;

class DisplaySettings extends fapi.HandlebarsApplicationMixin(fapi.Application) {
    static DEFAULT_OPTIONS = {
        tag: "form",
        id: `${MODULE_ID}-display-settings`,
        classes: [MODULE_ID, "settings", "theme"],
        window: {
            icon: "fa-solid fa-palette",
            title: "GlobalProgressClocks.Settings.ClockTheme.label",
            contentClasses: ["standard-form"],
        },
        position: {
            width: 500,
            height: "auto",
        },
        actions: {
            resetProperty: DisplaySettings.#onResetProperty,
            addClockColor: DisplaySettings.#onAddClockColor,
            removeClockColor: DisplaySettings.#onRemoveClockColor,
            reset: DisplaySettings.#onReset,
        },
        form: {
            closeOnSubmit: false,
            submitOnChange: true,
            handler: DisplaySettings.#updateObject,
        },
    }

    static PARTS = {
        main: {
            template: "modules/global-progress-clocks/templates/settings/display.hbs",
            root: true,
        }
    };

    static registerSettings() {
        game.settings.register(MODULE_ID, "defaultColor", {
            name: game.i18n.localize("GlobalProgressClocks.Settings.defaultColor.name"),
            hint: game.i18n.localize("GlobalProgressClocks.Settings.defaultColor.hint"),
            config: false,
            default: "#ff0000",
            type: String,
            scope: "world",
            onChange: () => {
                window.clockPanel.render(true);
            }
        });

        game.settings.register(MODULE_ID, "defaultBackgroundColor", {
            name: game.i18n.localize("GlobalProgressClocks.Settings.defaultBackgroundColor.name"),
            hint: game.i18n.localize("GlobalProgressClocks.Settings.defaultBackgroundColor.hint"),
            config: false,
            default: "#ffffff",
            type: String,
            scope: "world",
            onChange: () => {
                window.clockPanel.render(true);
            }
        });

        game.settings.register(MODULE_ID, "clockColors", {
            name: game.i18n.localize("GlobalProgressClocks.Settings.clockColors.name"),
            hint: game.i18n.localize("GlobalProgressClocks.Settings.clockColors.hint"),
            config: false,
            default: [],
            type: Array,
            scope: "world",
            onChange: () => {
                window.clockPanel.render(true);
            }
        });
    }

    cache = {};

    async _prepareContext(options) {
        if (Object.keys(this.cache).length === 0) {
            this.cache = {
                defaultColor: game.settings.get(MODULE_ID, "defaultColor"),
                defaultBackgroundColor: game.settings.get(MODULE_ID, "defaultBackgroundColor"),
                clockColors: game.settings.get(MODULE_ID, "clockColors"),
            };
        }

        return {
            ...(await super._prepareContext(options)),
            ...this.cache,
        };
    }

    static async #onResetProperty(_event, target) {
        const property = target.dataset.property;
        this.cache[property] = property === "defaultColor" ? "#ff0000" : "#ffffff";
        this.render();
    }

    static async #onAddClockColor() {
        this.cache.clockColors ??= [];
        this.cache.clockColors.push({
            id: foundry.utils.randomID(),
            name: "New Clock Type",
            color: "#ff0000"
        });
        this.render();
    }

    static async #onRemoveClockColor(_event, target) {
        const clockId = target.closest("[data-clock-id]").dataset.clockId;
        const idx = this.cache.clockColors.findIndex((c) => c.id === clockId);
        if (idx >= 0) {
            this.cache.clockColors.splice(idx, 1);
        }
        this.render();
    }

    static async #onReset() {
        this.cache = {};
        this.render();
    }

    static async #updateObject(event, _form, formData) {
        const data = foundry.utils.expandObject(formData.object);
        this.cache.defaultColor = data.defaultColor;
        this.cache.defaultBackgroundColor = data.defaultBackgroundColor;
        this.cache.clockColors = Object.values(data.clockColors ?? {});

        if (event.type === "submit") {
            await game.settings.set(MODULE_ID, "defaultColor", this.cache.defaultColor);
            await game.settings.set(MODULE_ID, "defaultBackgroundColor", this.cache.defaultBackgroundColor);
            await game.settings.set(MODULE_ID, "clockColors", this.cache.clockColors);
            this.close();
        } else {
            this.render();
        }
    }
}

export { DisplaySettings };

import { MODULE_ID } from "../values.mjs";
const fields = foundry.data.fields;
const fapi = foundry.applications.api;

class EnabledTypesSettings extends fapi.HandlebarsApplicationMixin(fapi.Application) {
    static DEFAULT_OPTIONS = {
        tag: "form",
        window: {
            icon: "fa-solid fa-gears",
            title: "GlobalProgressClocks.Settings.EnabledTypes.label",
            contentClasses: ["standard-form"],
        },
        position: {
            width: "auto",
            height: "auto",
        },
        form: {
            closeOnSubmit: true,
            handler: EnabledTypesSettings.#onSubmit,
        },
    }

    static PARTS = {
        main: {
            template: "modules/global-progress-clocks/templates/settings/enabled.hbs",
            root: true,
        },
    };

    static registerSettings() {
        foundry.helpers.Localization.localizeDataModel(EnabledTypes);

        game.settings.register(MODULE_ID, "enabledTypes", {
            config: false,
            scope: "world",
            onChange: () => window.clockPanel.render(true),
            type: EnabledTypes,
        });
    }

    constructor(options) {
        super(options);
        this.settings = new EnabledTypes(game.settings.get(MODULE_ID, "enabledTypes"));
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.settingFields = this.settings;
        return context;
    }

    static async #onSubmit(_event, _element, formData) {
        const updatedSettings = foundry.utils.expandObject(formData.object);
        await game.settings.set(MODULE_ID, "enabledTypes", updatedSettings);
    }
}

class EnabledTypes extends foundry.abstract.DataModel {
    static LOCALIZATION_PREFIXES = ["GlobalProgressClocks.Settings.enabledTypes"];

    static defineSchema() {
        return {
            clocks: new fields.BooleanField({ 
                nullable: false, 
                initial: true,
                label: "GlobalProgressClocks.Settings.enabledTypes.FIELDS.clocks.label",
                hint: "GlobalProgressClocks.Settings.enabledTypes.FIELDS.clocks.hint",
            }),
            points: new fields.BooleanField({ 
                nullable: false, 
                initial: true,
                label: "GlobalProgressClocks.Settings.enabledTypes.FIELDS.points.label",
                hint: "GlobalProgressClocks.Settings.enabledTypes.FIELDS.points.hint",
            }),
            trackers: new fields.BooleanField({ 
                nullable: false, 
                initial: false,
                label: "GlobalProgressClocks.Settings.enabledTypes.FIELDS.trackers.label",
                hint: "GlobalProgressClocks.Settings.enabledTypes.FIELDS.trackers.hint",
            }),
        }
    }
}

export { EnabledTypesSettings };

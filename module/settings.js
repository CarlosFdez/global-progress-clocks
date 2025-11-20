const MODULE_ID = "global-progress-clocks";

function registerSettings() {
    game.settings.register(MODULE_ID, "location", {
        name: game.i18n.localize("GlobalProgressClocks.Settings.location.name"),
        hint: game.i18n.localize("GlobalProgressClocks.Settings.location.hint"),
        config: true,
        choices: {
            topRight: game.i18n.localize("GlobalProgressClocks.Settings.location.Choices.topRight"),
            bottomLeft: game.i18n.localize("GlobalProgressClocks.Settings.location.Choices.bottomLeft"),
        },
        default: "topRight",
        scope: "world",
        onChange: () => window.clockPanel.render(true),
        type: String,
    });

    game.settings.register(MODULE_ID, "offset", {
        name: game.i18n.localize("GlobalProgressClocks.Settings.offset.name"),
        hint: game.i18n.localize("GlobalProgressClocks.Settings.offset.hint"),
        config: true,
        default: 0,
        scope: "world",
        onChange: () => window.clockPanel.render(true),
        type: Number,
    });

    game.settings.registerMenu(MODULE_ID, "settings", {
        name: "GlobalProgressClocks.Settings.ClockTheme.name",
        hint: "GlobalProgressClocks.Settings.ClockTheme.hint",
        label: "GlobalProgressClocks.Settings.ClockTheme.label",
        icon: "fa-solid fa-cog",
        type: DisplaySettings,
        restricted: true,
    });
    DisplaySettings.registerSettings();

    game.settings.register(MODULE_ID, "activeClocks", {
        name: "Active Clocks",
        scope: "world",
        type: Object,
        default: {},
        config: false,
        onChange: () => window.clockDatabase.refresh(),
    });

    game.settings.register(MODULE_ID, "minimumEditorRole", {
        name: "GlobalProgressClocks.Settings.minimumEditorRole.name",
        hint: "GlobalProgressClocks.Settings.minimumEditorRole.hint",
        scope: "world",
        config: true,
        default: CONST.USER_ROLES.GAMEMASTER,
        type: Number,
        choices: {
            1: "USER.RolePlayer",
            2: "USER.RoleTrusted",
            3: "USER.RoleAssistant",
            4: "USER.RoleGamemaster",
        },
        onChange: () => window.clockDatabase.refresh(),
    })

        game.settings.register(MODULE_ID, "enableTrackers", {
        name: "GlobalProgressClocks.Settings.enableTrackers.name",
        hint: "GlobalProgressClocks.Settings.enableTrackers.hint",
        config: true,
        default: false,
        scope: "world",
        onChange: () => window.clockPanel.render(true),
        type: Boolean,
    });
}

class DisplaySettings extends FormApplication {
    cache = {}

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = "GlobalProgressClocks.Settings.ClockTheme.label";
        options.id = `${MODULE_ID}-display-settings`;
        options.classes = [MODULE_ID, "settings", "theme"];
        options.template = "modules/global-progress-clocks/templates/settings.hbs";
        options.width = 500;
        options.height = "auto";
        options.closeOnSubmit = false;
        options.submitOnChange = true;
        return options;
    }

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

    async getData() {
        if (Object.keys(this.cache).length === 0) {
            this.cache = {
                defaultColor: game.settings.get(MODULE_ID, "defaultColor"),
                defaultBackgroundColor: game.settings.get(MODULE_ID, "defaultBackgroundColor"),
                clockColors: game.settings.get(MODULE_ID, "clockColors"),
            };
        }

        return {
            ...(await super.getData()),
            ...this.cache,
        };
    }

    activateListeners($html) {
        super.activateListeners($html);
        $html.find("a[data-action=reset-property][data-property=defaultColor]").on("click", () => {
            this.cache.defaultColor = "#ff0000";
            this.render();
        });

        $html.find("a[data-action=reset-property][data-property=defaultBackgroundColor]").on("click", () => {
            this.cache.defaultBackgroundColor = "#ffffff";
            this.render();
        });

        $html.find("a[data-action=add-clock-color]").on("click", () => {
            this.cache.clockColors ??= [];
            this.cache.clockColors.push({
                id: foundry.utils.randomID(),
                name: "New Clock Type",
                color: "#ff0000"
            });
            this.render();
        });

        $html.find("a[data-action=remove-clock-color]").on("click", (evt) => {
            const clockId = evt.target.closest("[data-clock-id]").dataset.clockId;
            const idx = this.cache.clockColors.findIndex((c) => c.id === clockId);
            if (idx >= 0) {
                this.cache.clockColors.splice(idx, 1);
            }
            this.render();
        });

        $html.find("button[type=reset]").on("click", () => {
            for (const key of Object.keys(this.cache)) {
                delete this.cache[key];
            }
            this.render();
        });
    }

    async _updateObject(event, data) {
        data = foundry.utils.expandObject(data);
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

export { MODULE_ID, registerSettings };
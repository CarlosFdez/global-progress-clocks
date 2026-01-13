import { MODULE_ID } from "../values.mjs";
import { DisplaySettings } from "./display.mjs";
import { EnabledTypesSettings } from "./enabled.mjs";

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
        icon: "fa-solid fa-palette",
        type: DisplaySettings,
        restricted: true,
    });
    DisplaySettings.registerSettings();

    game.settings.registerMenu(MODULE_ID, "enabledTypesMenu", {
        name: "GlobalProgressClocks.Settings.EnabledTypes.name",
        hint: "GlobalProgressClocks.Settings.EnabledTypes.hint",
        label: "GlobalProgressClocks.Settings.EnabledTypes.label",
        icon: "fa-solid fa-cog",
        type: EnabledTypesSettings,
        restricted: true,
    });
    EnabledTypesSettings.registerSettings();

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
    });
}

export { registerSettings };

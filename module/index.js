import { ClockPanel } from "./clock-panel.js";
import { ClockDatabase } from "./database.js";
import { registerHandlebarsHelper } from './handlebars-helpers.js'

Hooks.once("init", () => {
    game.settings.register("global-progress-clocks", "location", {
        name: game.i18n.localize("GlobalProgressClocks.Settings.location.name"),
        hint: game.i18n.localize("GlobalProgressClocks.Settings.location.hint"),
        config: true,
        choices: {
            topRight: "Top Right",
            bottomRight: "Bottom Right"
        },
        default: "bottomRight",
        scope: "world",
        onChange: () => window.clockPanel.render(true),
        type: String,
    });

    game.settings.register("global-progress-clocks", "activeClocks", {
        name: "Active Clocks",
        scope: "world",
        type: Object,
        default: {},
        config: false
    });

    window.clockDatabase = new ClockDatabase();
    window.clockPanel = new ClockPanel(window.clockDatabase);
    window.clockDatabase.refresh();

    // Create a spot for the clock panel to render into
    const top = document.querySelector("#ui-top");
    if (top) {
        const template = document.createElement("template");
        template.setAttribute("id", "clock-panel");
        top?.insertAdjacentElement("afterend", template);
    }

    registerHandlebarsHelper();
});

Hooks.on("canvasReady", () => {
    window.clockPanel.render(true);
});

Hooks.on("createSetting", (setting) => {
    if (setting.key === "global-progress-clocks.activeClocks") {
        window.clockDatabase.refresh();
    }
});

Hooks.on("updateSetting", (setting) => {
    if (setting.key === "global-progress-clocks.activeClocks") {
        window.clockDatabase.refresh();
    }
});
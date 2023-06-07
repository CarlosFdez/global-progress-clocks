import { ClockPanel } from "./clock-panel.js";
import { ClockDatabase } from "./database.js";

Hooks.once("init", () => {
    game.settings.register("global-progress-clocks", "location", {
        name: "Clock Screen Location",
        hint: "Where in the screen the clocks are shown",
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
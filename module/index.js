import { ClockPanel } from "./clock-panel.js";
import { ClockDatabase } from "./database.js";
import { registerSettings } from "./settings.js";

Hooks.once("init", () => {
    registerSettings();

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
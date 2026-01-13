import { ClockPanel } from "./clock-panel.mjs";
import { ClockDatabase } from "./database.mjs";
import { registerSettings } from "./settings/index.mjs";

Hooks.once("init", () => {
    registerSettings();

    window.clockDatabase = new ClockDatabase();
    window.clockPanel = new ClockPanel(window.clockDatabase);
    window.clockDatabase.refresh();
});

Hooks.once("setup", () => {
    CONFIG.queries["global-progress-clocks"] = window.clockDatabase.handleQuery;
})

Hooks.on("canvasReady", () => {
    window.clockPanel.render(true);
});

Hooks.on("createSetting", (setting) => {
    if (setting.key === "global-progress-clocks.activeClocks") {
        window.clockDatabase.refresh();
    }
});

import { MODULE_ID} from "./values.mjs";

const DEFAULT_CLOCK = {
    type: "clock",
    value: 0,
    max: 4,
    name: "New Clock",
    private: false
};

/**
 * Implementation that saves/delete clocks from config settings.
 * Any system that wishes to copy this module's ui should replace this to use world actors
 * or custom journal pages (perhaps with the ability to register the journal entry).
 * This function expects that hooks are registered to call the refresh method.
 */
export class ClockDatabase extends Collection {
    addClock(data={}) {
        if (!this.#verifyClockData(data)) return;

        const clocks = this.#getClockData();
        const newData = { ...DEFAULT_CLOCK, ...data };
        newData.id ??= foundry.utils.randomID();
        clocks[newData.id] = newData;
        game.settings.set("global-progress-clocks", "activeClocks", clocks);
    }

    delete(id) {
        const clocks = this.#getClockData();
        delete clocks[id];
        game.settings.set(MODULE_ID, "activeClocks", clocks);
    }

    async update(data) {
        if (!this.#verifyClockData(data)) return;

        const clocks = this.#getClockData();
        const existing = clocks[data.id];
        if (!existing) return;

        const newData = foundry.utils.mergeObject(foundry.utils.duplicate(existing), data);
        const newValue = Math.clamp(newData.value, 0, newData.max);
        if (game.user.hasPermission('SETTINGS_MODIFY')) {
            Object.assign(existing, newData);
            existing.value = newValue;
            await game.settings.set(MODULE_ID, "activeClocks", clocks);
        } else if (this.canUserEdit(game.user)) {
            const gm = game.users.activeGM;
            if (gm) {
                await gm.query("global-progress-clocks", { action: "update", clock: { id: newData.id, value: newValue } });
            } else {
                ui.notifications.warn("GlobalProgressClocks.Warnings.NoActiveGM", { localize: true });
            }
        }
    }

    move(id, idx) {
        const clocks = Object.values(this.#getClockData());
        const item = clocks.find((c) => c.id === id);
        if (!item) return;

        clocks.splice(clocks.indexOf(item), 1);
        clocks.splice(idx, 0, item);

        const newData = Object.fromEntries(clocks.map((c) => [c.id, c]));
        game.settings.set(MODULE_ID, "activeClocks", newData);
    }

    canUserEdit(user) {
        // return user.hasPermission('SETTINGS_MODIFY');
        const requiredPermission = game.settings.get(MODULE_ID, "minimumEditorRole");
        return user.role >= requiredPermission;
    }

    #getClockData() {
        const entries = game.settings.get(MODULE_ID, "activeClocks");
        for (const key of Object.keys(entries)) {
            entries[key] = { ...DEFAULT_CLOCK, ...entries[key] };
        }
        return entries;
    }

    refresh() {
        this.clear();
        for (const clock of Object.values(this.#getClockData())) {
            this.set(clock.id, clock);
        }

        if (canvas.ready) {
            window.clockPanel.render(true);
        }
    }

    handleQuery = async (data) => {
        const action = data.action;
        if (action === "update") {
            if (!game.user.isGM) return;
            const clock = data.clock;
            await this.update({ id: clock.id, value: clock.value });
            return { ok: true };
        }
    }

    // Limit the clock max size to 128
    #verifyClockData(data) {
        const maxSize = data.type === "points" ? 99 : data.type === "tracker" ? 12 : 128;
        if (data.max > maxSize) {
            ui.notifications.error(game.i18n.format("GlobalProgressClocks.SizeTooBigError", { maxSize }));
            return false;
        }

        return true;
    }
}
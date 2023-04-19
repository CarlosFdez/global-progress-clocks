/** 
 * Implementation that saves/delete clocks from config settings.
 * Any system that wishes to poach this module should replace this to use world actors
 * or custom journal pages (perhaps with the ability to register the journal entry).
 * This function expects that hooks are registered to call the refresh method.
 */
export class ClockDatabase extends Collection {
    addClock(data={}) {
        const clocks = this.#getClockData();
        const defaultClock = { value: 0, max: 4, name: "New Clock", id: randomID() };
        const newData = mergeObject(defaultClock, data);
        clocks[newData.id] = newData;
        game.settings.set("global-progress-clocks", "activeClocks", clocks);
    }

    delete(id) {
        const clocks = this.#getClockData();
        delete clocks[id];
        game.settings.set("global-progress-clocks", "activeClocks", clocks);
    }

    update(data) {
        const clocks = this.#getClockData();
        const existing = clocks[data.id];
        if (!existing) return;

        mergeObject(existing, data);
        game.settings.set("global-progress-clocks", "activeClocks", clocks);
    }

    move(id, idx) {
        const clocks = Object.values(this.#getClockData());
        const item = clocks.find((c) => c.id === id);
        if (!item) return;

        clocks.splice(clocks.indexOf(item), 1);
        clocks.splice(idx, 0, item);
        
        const newData = Object.fromEntries(clocks.map((c) => [c.id, c]));
        game.settings.set("global-progress-clocks", "activeClocks", newData);
    }

    #getClockData() {
        return game.settings.get("global-progress-clocks", "activeClocks");
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
}
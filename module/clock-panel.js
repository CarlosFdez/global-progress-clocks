export class ClockPanel extends Application {
    refresh = foundry.utils.debounce(this.render, 100);
    lastRendered = [];

    constructor(db, options) {
        super(options)
        this.db = db;
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: "clock-panel",
            popOut: false,
            template: "modules/global-progress-clocks/templates/clock-panel.hbs",
        };
    }

    async getData(options) {
        const data = await super.getData(options);
        return {
            ...data,
            options: {
                editable: game.user.isGM,
            },
            clocks: (await this.prepareClocks()),
        };
    }

    async prepareClocks() {
        const clocks = this.db.contents;
        return clocks.map((data) => ({
            ...data,
            value: Math.clamped(data.value, 0, data.max),
            img: `modules/global-progress-clocks/images/clocks/clock${data.max}-${Math.min(data.max, data.value)}.png`,
        }))
    }

    activateListeners($html) {
        // Fade in all new rendered clocks
        const rendered = [...$html.get(0).querySelectorAll("[data-id]")].map((el) => el.dataset.id);
        console.log(rendered);
        const newlyRendered = rendered.filter((r) => !this.lastRendered.includes(r));
        for (const newId of newlyRendered) {
            gsap.fromTo($html.find(`[data-id=${newId}]`), { opacity: 0 }, { opacity: 1, duration: 0.25 });
        }

        // Update the last rendered list (to get ready for next cycle)
        this.lastRendered = rendered;

        $html.find(".clock").on("click", (event) => {
            const clockId = event.target.closest("[data-id]").dataset.id;
            const clock = this.db.get(clockId);
            if (!clock) return;

            clock.value = Math.min(clock.value + 1, clock.max);
            this.db.update(clock);
        });

        $html.find(".clock").on("contextmenu", (event) => {
            const clockId = event.target.closest("[data-id]").dataset.id;
            const clock = this.db.get(clockId);
            if (!clock) return;

            clock.value = Math.max(clock.value - 1, 0);
            this.db.update(clock);
        });

        $html.find("[data-action=add-clock]").on("click", async () => {
            const content = await renderTemplate("modules/global-progress-clocks/templates/clock-add-dialog.hbs", {
                sizes: [4, 6, 8, 10, 12]
            });

            await Dialog.prompt({
                title: "Create Clock",
                content,
                callback: async ($html) => {
                    const form = $html[0].querySelector("form");
                    const fd = new FormDataExtended(form);
                    this.db.addClock(fd.object);
                },
                rejectClose: false,
            });
        });

        $html.find("[data-action=edit-clock]").on("click", async (event) => {
            const clockId = event.target.closest("[data-id]").dataset.id;
            const clock = this.db.get(clockId);
            if (!clock) return;

            const content = await renderTemplate("modules/global-progress-clocks/templates/clock-add-dialog.hbs", {
                clock,
                sizes: [4, 6, 8, 10, 12]
            });

            await Dialog.prompt({
                title: "Create Clock",
                content,
                callback: async ($html) => {
                    const form = $html[0].querySelector("form");
                    const fd = new FormDataExtended(form);
                    const updateData = { id: clock.id, ...fd.object };
                    updateData.value = Math.clamped(clock.value, 0, updateData.max);
                    this.db.update(updateData);
                },
                rejectClose: false,
            });
        });

        $html.find("[data-action=delete-clock]").on("click", async (event) => {
            const clockId = event.target.closest("[data-id]").dataset.id;
            const clock = this.db.get(clockId);
            if (!clock) return;

            const deleting = await Dialog.confirm({
                title: "Delete clock",
                content: `Are you sure you want to delete ${clock.name}?`,
            });
            
            if (deleting) {
                this.db.delete(clockId);
            }
        });
    }
}
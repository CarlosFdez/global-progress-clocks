const CLOCK_MAX_SIZE = 32;
const CLOCK_SIZES = [2, 3, 4, 5, 6, 8, 10, 12];

export class ClockAddDialog extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: "GlobalProgressClocks.CreateDialog.Title",
            template: "modules/global-progress-clocks/templates/clock-add-dialog.hbs",
            classes: ["dialog"],
            width: 400,
        });
    }

    constructor(clock, complete) {
        super();
        this.clock = clock;
        this.complete = complete;
    }

    async getData() {
        const data = await super.getData();
        return {
            ...data,
            clock: this.clock,
            maxSize: CLOCK_MAX_SIZE,
            presetSizes: CLOCK_SIZES,
        }
    }

    activateListeners($html) {
        super.activateListeners($html);

        // Autofocus the name. Move to _injectHTML if we need to re-render
        $html.find("[autofocus]")[0]?.focus();

        const inputElement = $html.find(".dropdown-wrapper input");
        $html.find(".dropdown li").on("mousedown", (event) => {
            inputElement.val(event.target.getAttribute("data-value"));
        });

        $html.find(".dialog-button").on("click", (evt) => {
            evt.preventDefault();
            const button = evt.target.dataset.button;
            if (button === "yes") {
                const form = $html[0].querySelector("form");
                const data = new FormDataExtended(form).object;
                if (this.clock) {
                    data.id = this.clock.id;
                    data.value = Math.clamped(this.clock.value, 0, data.max);
                }

                this.complete(data);
            }

            this.close();
        });
    }
}
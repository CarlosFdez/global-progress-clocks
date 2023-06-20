export const registerHandlebarsHelper = async () => {
    Handlebars.registerHelper('times', function(n, options) {
        let content = '';
        let data;

        if (options.data) {
            data = Handlebars.createFrame(options.data);
        }

        for(let i = 0; i < n; i++) {
            if (data) {
                data.index = i;
            }

            content += options.fn(this, { data: data });
        }

        return content;
    });
}

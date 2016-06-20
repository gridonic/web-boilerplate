import Keyboard from './scripts/Keyboard';

class App {
    constructor() {
        this.requiredComponents = [];
        this.componentsPath = 'assets/components';

        switch (document.readyState) {

            // The document is still loading.
            case 'loading':
                document.onreadystatechange = () => {
                    if (document.readyState == 'interactive') {
                        this.init();
                    }
                }
                break;

            // The document has finished loading. We can now access the DOM elements.
            case 'interactive':
            case 'complete':
                this.init();
                break;
        }

    }

    init() {

        // See if there are any components to require from HTML markup
        this.detectComponentsFromMarkup();

        // Register debugging keyboard shortcut
        new Keyboard()
            .register(':debug', () => {
                document.documentElement.classList.toggle('debug-mode');
            });
    }

    /**
     *
     */
    detectComponentsFromMarkup() {

        // @ is indicating it's requiring CSS, $ is for requiring JS
        let components = document.querySelectorAll('[class*="@"], [class*="$"]');

        for (let i = 0; i < components.length; i++) {
            let el = components[i];
            let match = el.className.match(/[@$]+([\w-]+)/);
            let component = match[1];
            let needsCSS = match[0].indexOf('@') >= 0;
            let needsJS = match[0].indexOf('$') >= 0;

            // Activate it by using the correct class
            el.className = el.className.replace(match[0], match[1]);

            // Component has already been required, neext!
            if (this.requiredComponents.indexOf(component) >= 0) {
                continue;
            }

            // Remember component
            this.requiredComponents.push(component);

            if (needsCSS) {
                this.requireCSS(`${this.componentsPath}/${component}/index`);
            }

            if (needsJS) {
                // HOW?
            }
        }
    }

    /**
     * Requires a CSS files.
     *
     * @param {string} File The path to the CSS file.
     */
    requireCSS(file) {
        let head = document.getElementsByTagName('head')[0];

        head.insertAdjacentHTML(
            'beforeend',
            `<link rel="stylesheet" href="${file}.css">`
        );
    }
}

new App();

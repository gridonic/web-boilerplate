![Ingredients of the web boilerplate](https://mzdr.github.io/web-boilerplate/ingredients.png)

Simple, fast and lightweight web boilerplate serving as my basis for developing web apps. By default you'll get the following features:

- Supports ES6 JavaScript which is transpiled and bundled by [Babel](https://babeljs.io/) / [browserify](http://browserify.org/) (See [src/js](src/js) for a simple example)
- Generates SVG sprites automatically
- Optimization of images on the fly
- Version string based cache busting

---

Setup is dead simple. Just run:

1. `npm install`

3. `npm run build`

That's it. You might want to check the `project.json` for customizing the build process.

---

 Available npm tasks:

`npm run build`  
`npm run build:html`  
`npm run build:images`  
`npm run build:scripts`  
`npm run build:sprites`  
`npm run build:styles`  
`npm run clean`  
`npm run watch`  
`npm run watch:html`  
`npm run watch:images`  
`npm run watch:scripts`  
`npm run watch:sprites`  
`npm run watch:styles`  

---

Third party frameworks/libraries enabled by default: [normalize.css](https://necolas.github.io/normalize.css/).

---

v1.0.0

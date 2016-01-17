![Ingredients of the web boilerplate](https://mzdr.github.io/web-boilerplate/ingredients.png)

Simple, fast and lightweight web boilerplate serving as my basis for developing webapps and websites. By default you'll get the following features:

- Supports ES6 JavaScript which is transpiled and bundled by [Babel](https://babeljs.io/) / [browserify](http://browserify.org/) (See [src/js](src/js) for a simple example)
- Generates SVG sprites automatically based on sub-directories
- Optimization of images on the fly, supports JPG, PNG, GIF and SVG
- Version string based cache busting
- Desktop notifications when errors occur

**But why ?**

I know, it's a pretty custom boilerplate and mostly written to fit my personal flavor, but on the other hand it's based on lots of years working in web development agencies, as a freelancer with other freelancers or just on personal projects. So it's pretty much the latest shit, at least I try my best to keep up with the community.

I used to work with Grunt and Gulp, also with Bower and other package managers. That's one of the reasons why I came up with this. I just wanted to get rid of those managers as NPM solely is just fine enough to handle this kind of work. Also articles like “[Why we should stop using Grunt & Gulp](http://blog.keithcirkel.co.uk/why-we-should-stop-using-grunt/)” inspired me to do this.

If you have any suggestions, problems or feedback. Feel free to [create issues](https://github.com/mzdr/web-boilerplate/issues/new), [pull request](https://github.com/mzdr/web-boilerplate/pulls) or get in touch with me via my twitter account ([@mrprein](https://twitter.com/mrprein)).


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

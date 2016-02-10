![Ingredients of the web boilerplate](https://mzdr.github.io/web-boilerplate/ingredients.png)

Simple, fast and lightweight web boilerplate serving as my basis for developing webapps and websites. By default you'll get the following features:

- Bundling of JavaScript by [browserify](http://browserify.org/)
- Support of [ECMAScript 2015](http://www.ecma-international.org/publications/standards/Ecma-262.htm) (ES6) features which are transpiled by [Babel](https://babeljs.io/) (See [src/js](src/js) for a simple example)
- Configurable linting with [ESLint](http://eslint.org/docs/user-guide/configuring)
- Automatic SVG Sprite generation based on sub-directories
- Optimization of images on the fly (supports JPG, PNG, GIF and SVG) with [imagemin](https://github.com/imagemin/imagemin)
- Version string based cache busting
- Desktop notifications when errors occur
- [Sass](http://sass-lang.com/) Style Sheets with PostCSS [autoprefixing](https://github.com/postcss/autoprefixer)
- Time-saving synchronised browser testing with [Browsersync](https://www.browsersync.io/)

Pretty cool, huh?

# What, where and why?

**But Basti…**

I know, it's pretty custom and mostly written to fit my personal flavor, but on the other hand it's based on lots of years working in web development agencies, as a freelancer with other freelancers or just on personal projects. So it's pretty much the latest shit, at least I try my best to keep up with the community and I think you really could love it like I do.

I used to work with Grunt and Gulp, also with Bower/Bundler and other package managers. That's one of the reasons why I came up with this. I just wanted to get rid of those managers as [NPM](https://www.npmjs.com/)/[Node.js](https://nodejs.org/) solely is just fine enough to handle this kind of work. Also articles like “[Why we should stop using Grunt & Gulp](http://blog.keithcirkel.co.uk/why-we-should-stop-using-grunt/)” or “[Why I Left Gulp and Grunt for npm Scripts](https://medium.com/@housecor/why-i-left-gulp-and-grunt-for-npm-scripts-3d6853dd22b8)” inspired me to do this.

Anyway, I had a fun time creating this. If you have any suggestions, problems or feedback. Feel free to [create issues](https://github.com/mzdr/web-boilerplate/issues/new), [pull request](https://github.com/mzdr/web-boilerplate/pulls) or get in touch with me via my twitter account ([@mrprein](https://twitter.com/mrprein)).


# Installation

Setup is dead simple. Just run: `npm install` within the [terminal](https://en.wikipedia.org/wiki/Terminal_%28OS_X%29) of your choice.

That's it!

# Usage

Right now there are three basic tasks `build`, `clean` and `watch`. You can run them like this:

Command    | Description
--------------------| -----------
`node build`        | Builds the whole project by running all tasks which are enabled in the `build.js` file.
`node clean`        | Will clean up your project by deleting everything that has been built before.<br>(By default the `./build` folder will be deleted)
`node watch`        | Starts a process that watches all relevant files and once a file has been changed<br> the corresponding task will be started.
`node server`       | This is an alias to `node watch --sync` which will start Browsersync as well.

If you want to build/watch for specific things only, you may pass the **sub-task** as a **second parameter**. Right now there is `fonts`, `html`, `images`, `scripts`, `sprites` and `styles`.

So if you care about your styles only, you may use:

`node build styles` *or*   
`node watch styles`

Also all `watch` tasks have a `--sync` parameter to enable [Browsersync](https://www.browsersync.io/).

By default this parameter will start the Browsersync's built-in static server which will serve files from the project destination (`dest` in `project.json` which is `./build` by default) directory. In case you already have a vhost running and want to proxy it, have a look at the [documentation](https://www.browsersync.io/docs/options/).

And **don't forget** to check out the [project.json](project.json) for customizing the whole build process!

# Frameworks/Libraries

By default this boilerplate comes enabled with [normalize.css](https://necolas.github.io/normalize.css/) and [picturefill](https://scottjehl.github.io/picturefill/).

v1.1.1

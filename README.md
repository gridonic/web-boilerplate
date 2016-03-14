![Ingredients of the web boilerplate](https://mzdr.github.io/web-boilerplate/ingredients.png)

Simple, fast and lightweight web boilerplate serving as our basis for developing webapps and websites. You'll get the following features:

- Bundling of JavaScript with [browserify](http://browserify.org/)
- Support of [ECMAScript 2015](http://www.ecma-international.org/publications/standards/Ecma-262.htm) (ES6) features which are transpiled by [Babel](https://babeljs.io/) (See [src/js](src/js) for a simple example)
- Configurable linting with [ESLint](http://eslint.org/docs/user-guide/configuring)
- Automatic SVG Sprite generation based on sub-directories
- Optimization of images on the fly (supports JPG, PNG, GIF and SVG) with [imagemin](https://github.com/imagemin/imagemin)
- Version string based cache busting
- Desktop notifications when errors occur
- [Sass](http://sass-lang.com/) Style Sheets with PostCSS [autoprefixing](https://github.com/postcss/autoprefixer)
- Time-saving synchronised browser testing with [Browsersync](https://www.browsersync.io/)

# Installation

Setup is dead simple. Just run: `npm install -g web-boilerplate` within the [terminal](https://en.wikipedia.org/wiki/Terminal_%28OS_X%29) of your choice.

That's it!

# Usage

After installation there is a new command line interface available in your terminal for the web boilerplate. It's called `webbp`.

When you run `webbp`, it looks for a `project.json` within the current folder and gathers all necessary information about the project in order to build it successfully.

## Use cases

Let us demonstrate a few use cases you might have:

1. You want to **create a new web project** and **build it**. Therefore you run those commands in that order:

    ```shell
webbp new my-epic-app  
cd my-epic-app  
webbp build  
    ```

2. You have an **existing project** and start working on it. Any **changes** you make **will be built immediately**. Those lines will do the magic:

    ```shell
cd your-existing-project
webbp watch
    ```

3. You want to **show your project** to your client **without setting up complicated web servers**. You can use the **built in webserver** (by default its [Browsersync](https://www.browsersync.io/)) to quickly demonstrate your project. Just run:

    ```shell
cd your-existing-project
webbp server
    ```

## Overview

All in all the CLI currently supports those commands and options:

<table>
    <tr>
        <th width="26%">Command</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>webbp build</code></td>
        <td>Builds the whole project by running all tasks which are enabled in the <code>project.json</code> file.</td>
    </tr>
    <tr>
        <td><code>webbp watch</code></td>
        <td>Starts a process that watches all relevant files and once a file has been changed the corresponding task will be started.</td>
    </tr>
    <tr>
        <td><code>webbp server</code></td>
        <td>Will start the built-in/configured web server which will serve files from the project destination (<code>dest</code> in <code>project.json</code> which is <code>./build</code> by default) directory. In case you already have a vhost running and want to proxy it, have a look at the Browsersync <a href="https://www.browsersync.io/docs/options/">documentation</a>.</td>
    </tr>
</table>

If you only want to take care of specific things, you may pass the **sub-task** as a **second parameter**.

```shell
webbp build|watch|server <task>
```

Some examples:

```shell
webbp build styles
webbp watch styles,scripts -e prod
```

Finally **don't forget** to check out the [project.json](project.json) for customizing the whole project and build process.

## Frameworks/Libraries

Including and using frameworks is pretty easy as well. Just install your desired library via [npm](https://www.npmjs.com/) (`npm install <package> --save-dev`) and include/require it in Sass/JS or where ever you need files of this package.

Don't forget to share/commit your `package.json` so that collaborators/co-workers can install them as well.

---
v2.0.0

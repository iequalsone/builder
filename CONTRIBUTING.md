# Contributing to Visual Composer Website Builder
You can contribute and help make Visual Composer better. Follow the guidelines:
 - [Code of Conduct](#code-of-conduct)
 - [Submission Guidelines](#submission-guidelines)
 - [Coding Rules](#coding-rules)
 - [Installation instruction](#installation-instruction)

## Code of Conduct
Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Submission Guidelines

### Forking workflow
Keep the `master` branch tests passing at all times.

If you send a pull request, please do it against the master branch. We maintain stable branches for major versions separately (Example: `12.x`). Instead of accepting pull requests to the version branches directly, we cherry-pick non-breaking changes from `master` to the version.

Make fork for of VCWB repo in GitHub. Go to your active WordPress `wp-content/plugins` directory.

```sh
$ git clone git@github.com:<Username>/builder.git
$ cd builder
$ git remote add upstream git@gihub.com:Visualcomposer/builder.git
$ git remote set-url --push upstream no_push
$ git remote -v
origin	git@github.com:<Username>/builder.git (fetch)
origin	git@github.com:<Username>/builder.git (push)
upstream	git@github.com:Visualcomposer/builder.git (fetch)
upstream	no_push (push)
```

### Creating features
Use [Feature Branch workflow](https://es.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow). If you want to send you data to upstream you need to [create pull request in GitHub](https://help.github.com/en/articles/creating-a-pull-request-from-a-fork).

```sh
$ git checkout -b <VC-ID-feature-branch-in-kebab-case>
# Edit some code
$ git commit -m "Message for change"
$ git push -u origin <feature-branch-in-kebab-case>
```

### Bring builder up to date
```sh
$ git checkout master && git pull upstream master # checkout
$ git push
```

### Cleanup after pull request
```sh
$ git branch -d <branch name>
$ git push origin master
```

## Coding Rules

### Javascript

#### Code Style
Use StandardJS to validate code-style `yarn standard`.

#### Supported Language
Use ES6 version for Javascript code. https://standardjs.com

#### Variables and Classes
For all var, let, const and method names you should use camelCase.

Exceptions to the rule:
* Class names for ES6 with camelCase and first Uppercase letter.
* Constructors for ES5 with camelCase and first Uppercase letter.

#### No jQuery
Contributor should try not to use jQuery and jQuery-like libraries.

## Installation instruction
All javascript is build with webpack module builder. Install the plugin and checked that it works, you can make changes to it to get acquainted with the code.

### Requirements
* PHP >= 5.4
* WordPress >= 4.6
* PHP `gd2/imagick` and `php-zip` extensions to be loaded
* Node >=8.0
* npm >=5.8
* yarn

Locate plugin folder in your WordPress installation under `wp-content/plugins` and clone builder repo here.

##### 1. Install node modules and php composer dependencies
``` sh
$ yarn install
$ php ci/composer.phar update
```

##### 2. Build project
```sh
$ yarn build
# watch
$ yarn watch
```
##### 3. Build settings (Welcome page, Activation page)
```sh
$ yarn build-settings
# watch
$ yarn watch-settings
```

##### 4. Build elements
```sh
$ bash tools/elements/buildScript.sh
# or production version
$ bash tools/elements/buildProductionScript.sh
```
You can build each element separately.
```sh
$ cd elements/{elementDirectory}
$ ../../node_modules/.bin/webpack --config webpack.config.4x.babel.js --progress --colors
# compile style.css and watch
$ ../../node_modules/.bin/webpack --config webpack.config.4x.babel.js --progress --colors --watch /public/src/init.less styles.css --autoprefix="last 2 versions"
```
You need to build public assets for element if exist.
```sh
$ cd elements/{elementDirectory}/{elementDirectory}/public
# build
$ ../../../../node_modules/.bin/webpack --config=webpack.config.js -p
# watch
$ ../../../../node_modules/.bin/webpack --config=webpack.config.js -p --watch
```

##### Build assets
```sh
$ cd public/sources/assetsLibrary/{assetDirectory}
$ ../../../../node_modules/.bin/webpack --config=webpack.config.babel.js -p
```

##### Install local githooks
Git hooks will add pre-commit hooks to keep commits clean.
```sh
$ cd _infrastructure
$ ./install-hooks
```

##### Debug mode
You can enable debug mode by adding `env-dev.php` file to the root directory of the project.
```php
<?php

if (!VcvEnv::has('VCV_DEBUG')) {
    VcvEnv::set('VCV_DEBUG', true);
}
require_once "env.php";
```



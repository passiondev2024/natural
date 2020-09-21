# Natural

[![Build Status](https://travis-ci.com/Ecodev/natural.svg?branch=master)](https://travis-ci.com/Ecodev/natural)
[![Total Downloads](https://img.shields.io/npm/dt/@ecodev/natural.svg)](https://www.npmjs.com/package/@ecodev/natural)
[![Latest Stable Version](https://img.shields.io/npm/v/@ecodev/natural.svg)](https://www.npmjs.com/package/@ecodev/natural)
[![License](https://img.shields.io/npm/l/@ecodev/natural.svg)](https://www.npmjs.com/package/@ecodev/natural)
[![Join the chat at https://gitter.im/Ecodev/natural](https://badges.gitter.im/Ecodev/natural.svg)](https://gitter.im/Ecodev/natural)

This project is a collection of Angular Material components and various utilities classes for Angular projects.

## Install

```bash
yarn add @ecodev/natural
```

## Development

The most useful commands for development are:

- `yarn dev` to start a development server
- `yarn build-demo` to build the docs locally (it will be published automatically by Travis)
- `git tag -am 1.2.3 1.2.3 && git push` to publish the lib to npm (via Travis deploy mechanism)

### i18n

This library ship its own translations in the folder `i18n/`. Those translations can then be used
in the consuming applications.

#### Marking text for translation

All text marked for translation must use the "namespace" natural. This is done via the *meaning*
of the translation. So something like:

```html
<p i18n="natural|">My text to translate</p>
```

```ts
const message = $localize`:natural|:My text to translate`;
```

This is to avoid collision between the translation of natural and the consuming application.

#### Extraction

The following command will extract all translations. Then you must double-check the content of
`projects/natural/i18n/` and commit only those files.

```sh
yarn i18n-extract
```

Once pushed, Weblate will be notified via a webhook, and translators can translate in each language.

#### Adding language

Configure new languages in `angular.json` in two locations:

- `projects.demo.i18n.locales`
- `projects.natural.architect.xliffmerge.options.xliffmergeOptions.languages`

## Components

### Natural Search

This is an Angular component to search for things via configurable facets. Facets may be
configured to use one of the built-in component, or a custom component to input values.

See the component in action on [the demo page](https://ecodev.github.io/natural).

#### Prior work

While the implementation is entirely different, [VisualSearch.js
](https://github.com/documentcloud/visualsearch/) was an important inspiration.

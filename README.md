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


## Components

### Natural Search


This is an Angular component to search for things via configurable facets. Facets may be
configured to use one of the built-in component, or a custom component to input values.

See the component in action on [the demo page](https://ecodev.github.io/natural).

#### Prior work

While the implementation is entirely different, [VisualSearch.js
](https://github.com/documentcloud/visualsearch/) was an important inspiration.

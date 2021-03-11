# Natural

[![Build Status](https://github.com/Ecodev/natural/workflows/main/badge.svg)](https://github.com/Ecodev/natural/actions)
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
- `yarn build-demo` to build the docs locally (it will be published automatically by GitHub Actions)
- `git tag -am 1.2.3 1.2.3 && git push` to publish the lib to npm (via GitHub Actions `release` job)

### i18n

This library is ready to be translated, but it does not ship translations. It is up to the consuming
application to extract and translate strings.

## Components

### Natural Search

This is an Angular component to search for things via configurable facets. Facets may be
configured to use one of the built-in component, or a custom component to input values.

See the component in action on [the demo page](https://ecodev.github.io/natural).

#### Prior work

While the implementation is entirely different, [VisualSearch.js
](https://github.com/documentcloud/visualsearch/) was an important inspiration.

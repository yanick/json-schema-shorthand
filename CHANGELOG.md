# Changelog for [json-schema-shorthand][homepage]



## 3.1.0 2023-06-01


### Features

  * add j. prefixes in the README
  * support { number: {...} } and friends

### Package maintenance

  * remove unused code

### Statistics

  * code churn: 4 files changed, 65 insertions(+), 108 deletions(-)



## 3.0.0 20203-05-31


### Features

  * change typing for json-schema-to-ts compatibility
  * removing addDefinition

### Package maintenance

  * use changelord for changelog management
  * move from tap to vitest
  * update the tsconfig.json
  * move eslint config to own file


## [2.0.0](https://github.com/yanick/json-schema-shorthand/compare/v1.0.0...v2.0.0) (2020-08-24)


### ⚠ BREAKING CHANGES

* things should continue to work as normal, but since to move to
  typescript is kinda of a big deal, I'm taking no chance.


### Features

* move project to typescript ([ca3429d](https://github.com/yanick/json-schema-shorthand/commit/ca3429db04ebc183d2b5c000e8d3d2b297a1e001))

## [1.0.0](https://github.com/yanick/json-schema-shorthand/compare/v0.3.2...v1.0.0) (2020-07-30)


### Features

* add allOf, anyOf, oneOf, not shorthands ([b47ee27](https://github.com/yanick/json-schema-shorthand/commit/b47ee27671a4861756a74f4ad6b0dc10d10f1a3c))

### [0.3.2](https://github.com/yanick/json-schema-shorthand/compare/v0.3.1...v0.3.2) (2020-01-31)


### Bug Fixes

* remove shrinkwrap.yaml from repo ([baf6ca5](https://github.com/yanick/json-schema-shorthand/commit/baf6ca5c27f9f7723afa48796da0627160579839))

## 0.3.1 (https://github.com/yanick/json-schema-shorthand/compare/v0.3.0...v0.3.1) (2020-01-31)

### Bug Fixes

    * bump dependency versions to latest (685e13e (https://github.com/yanick/json-schema-shorthand/commit/685e13eba976fda5ba956a105ac2fb039e232860))

## v0.3.0 2018-02-14

## Improvements
    * New shortcut: '$foo' expands to be `$ref: foo`.
    * New 'range' shortcut.
    * New shortcut functions for types `object`, `array`, `number`,
        `integer`, and `string`.
    * Add `add_definition` helper function.

### Bug Fixes
    * `shorthand()` deals gracefully with `null` argument.


## 0.2.0 2017-01-03
  * Properties can be made required via a '!' suffix.
  * Drop Mocha and Chai for TAP for testing.

## 0.1.0 2016-08-01
  * Recurse down 'allOf', 'oneOf', 'anyOf', 'not'.
  * Add 'install' and 'synopsis' sections in doc.


## v0.0.1 2016-07-31


### Features

  * Initial release






    [homepage]: https://github.com/yanick/json-schema-shorthand

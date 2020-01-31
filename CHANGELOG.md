# Revision history for json-schema-shorthand

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

## 0.0.1 2016-07-31
    * Initial release
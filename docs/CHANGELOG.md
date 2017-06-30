# 0.4.0

## Features

- [#96](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/pull/96) Add support for optional inline images in report

## Bugfixes

- [#101](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/pull/101) Ensure directory is created before trying to write report file

# 0.3.5

## Bugfixes

- [#93](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/pull/93) illegalchars on specs correct patch

# 0.3.4

## Features

- 2c5cf63 bumped lodash to version 4
- 18e44f2 added option to report failure url in report [#92](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/pull/92)
- b6bf349 added header on the quicklink list [#91](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/pull/91)

# 0.3.3

## Bugfixes

- 6073a5d encode HTML tags in spec names

# 0.3.2

## Bugfixes

- f9b3a85 dont try to create quicklinks if there's no container for them
- 08e866b make stack trace IDs unique (spec id, browser variations) [#56](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/issues/56)

# 0.3.1

## Features

- 83d46e5 adding stack traces to the report [#46](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/issues/46)
- 64405b4 [support for forked instances](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/blob/master/README.md#forked-browser-instances) [#44](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/issues/44)
- 4a00de3 execute done from process.nextTick. dirtyfixing [#10](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/issues/10)

# 0.3.0

## Features
- support test sharding
- added example configurations: [protractor.example.conf](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/blob/master/docs/protractor.example.conf) and [protractor.sharding-example.conf](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/blob/master/docs/protractor.sharding-example.conf)
- added [cleanDestination](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/blob/master/README.md#clean-destination-directory-optional) option

## BRAKING CHANGES
In order to support running multiple browser instances in parallel, there's a little more setup to be done in protractor configuration when adding the reporter. This affects also users who don't use sharding.

Please refer to setup instructions before upgrading: [Usage instructions](https://github.com/mlison/protractor-jasmine2-screenshot-reporter#usage).

# 0.2.0

## Features
- user specified css files
- report title option
- pass fail summary at the top of the report
- quick links to failed tests at the top of the report
- a settings summary at the end

Bugfixes:
- using 'rimraf' to empty the output directory
- using the spec description rather than full name for cleaner presentation
- reinstating the old promise resolved browser caps that is used by the pathBuilder [#21](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/issues/21), [#4](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/issues/4)

# 0.1.8

## Features

- [added change log](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/commit/c56a9d935180883b0555523c4ab3b61395ae4ff3)
- [added preserveDirectory option](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/pull/19)

## Bugfixes

- [Screenshot paths are getting '/' encoded](https://github.com/mlison/protractor-jasmine2-screenshot-reporter/issues/31)

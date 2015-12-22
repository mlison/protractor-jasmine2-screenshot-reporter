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

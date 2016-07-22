'use strict';

var assert = require('assert'),
  Jasmine2ScreenShotReporter = require('./../index.js');

describe('Jasmine2ScreenShotReporter tests', function(){

  it('beforeLaunch should create initial report', function(){
    var reporter = new Jasmine2ScreenShotReporter();

    assert.equal(typeof reporter.beforeLaunch, 'function'); //Public method beforeLaunch should be defined
  });

});


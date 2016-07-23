'use strict';

var assert = require('chai').assert,
 expect = require('chai').expect,
  chai = require('chai'),
  Jasmine2ScreenShotReporter = require('./../index.js'),
  rimraf = require('rimraf'),
  fs = require('fs'),
  destinationPath = 'test/testdirectory',
  reportFileName = 'my-custom-report.html';


describe('Jasmine2ScreenShotReporter tests', function(){

  beforeEach(function(done) {

    chai.use(require('chai-fs'));
    fs.mkdir(destinationPath, function(){done();});

  });

  it('beforeLaunch should create initial report', function(done){
    var reporter = new Jasmine2ScreenShotReporter({
      dest: destinationPath,
      filename: reportFileName});

    assert.equal(typeof reporter.beforeLaunch, 'function'); //Public method beforeLaunch should be defined

    reporter.beforeLaunch(function() {
      var contents = fs.readFileSync(destinationPath + '/' + reportFileName, 'utf8');

      expect(destinationPath + '/' + reportFileName).to.be.a.path('no path');
      expect(contents).to.contain('<body><h1>Report</h1>');
      expect(contents).to.contain('<div id="summary" class="passed"><h4>Summary</h4>' +
        '<ul>' +
        '<li id="summaryTotalSpecs">Total specs tested: </li>' +
        '<li id="summaryTotalFailed">Total failed: </li>' +
        '</ul></div>');
      done();
    });


  });


  it('afterLaunch should close down report', function(done){
    var reporter = new Jasmine2ScreenShotReporter({
      dest: destinationPath,
      filename: reportFileName});

    assert.equal(typeof reporter.afterLaunch , 'function'); //Public method afterLaunch  should be defined

    fs.writeFileSync(destinationPath + '/' + reportFileName, ""); //create empty file

    reporter.afterLaunch (function() {
      var contents = fs.readFileSync(destinationPath + '/' + reportFileName, 'utf8');

      assert.equal(contents, '</body></html>');
      done();
    });
    
  });


  afterEach(function(done) {
    // clean folder
    rimraf(destinationPath, function(err) {
      if(err) {
        console.error('Could not delete ' + destinationPath + 'directory')
      }

      done();
    });

  });


});


'use strict';

var assert = require('chai').assert,
  expect = require('chai').expect,
  chai = require('chai'),
  sinon = require('sinon'),
  Jasmine2ScreenShotReporter = require('./../index.js'),
  rimraf = require('rimraf'),
  fs = require('fs'),
  destinationPath = 'test/testdirectory',
  reportFileName = 'my-custom-report.html',
  suiteInfo = {totalSpecsDefined : 2};

describe('Jasmine2ScreenShotReporter tests', function(){

  beforeEach(function(done) {
    chai.use(require('chai-fs'));
    fs.mkdir(destinationPath, function(){done();});

    //Jasmine afterAll mock global function.
    global.afterAll = function() {};

    //Global version property.
    global.jasmine = {
      version: 'mockJasmineVersion'
    };

    //Jasmine browser global object.
    global.browser =  {
      getCapabilities: function () {
        var p = Promise.resolve(
          { get: function(el) {
              return el + 'mockValue';
          }}
        );
        return p;
      }
    };
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
    fs.writeFileSync(destinationPath + '/' + reportFileName, ''); //create empty file

    reporter.afterLaunch (function() {
      var contents = fs.readFileSync(destinationPath + '/' + reportFileName, 'utf8');
      assert.equal(contents, '</body></html>');
      done();
    });
  });

  it('jasmineStarted is calling browser getCapabilities', function(done){
    var reporter = new Jasmine2ScreenShotReporter({
        dest: destinationPath,
        filename: reportFileName}),
      save;

    assert.equal(typeof reporter.jasmineStarted , 'function'); //Public method jasmineStarted should be defined
    save = sinon.spy(global.browser, 'getCapabilities');
    fs.writeFileSync(destinationPath + '/' + reportFileName, ''); //create empty report file
    reporter.jasmineStarted(suiteInfo);

    sinon.assert.calledOnce(save);
    done();
  });

  it('report is being generated', function(done){

    //@TODO: Need to elaborate this test.

    var reporter = new Jasmine2ScreenShotReporter({
        dest: destinationPath,
        filename: reportFileName});

    assert.equal(typeof reporter.suiteStarted , 'function'); //Public method suiteStarted should be defined
    assert.equal(typeof reporter.specStarted , 'function'); //Public method specStarted should be defined
    assert.equal(typeof reporter.specDone , 'function'); //Public method specDone should be defined
    assert.equal(typeof reporter.suiteDone , 'function'); //Public method suiteDone should be defined
    assert.equal(typeof reporter.jasmineDone , 'function'); //Public method suiteDone should be defined

    fs.writeFileSync(destinationPath + '/' + reportFileName, ''); //create empty report file

    reporter.suiteStarted({description : 'mockSuiteDescription', fullName: 'mockSuiteFullName'});
    reporter.specStarted({description : 'mockSpecDescription', fullName: 'mockSpecFullName'});
    reporter.specDone({description : 'mockSpecDescription', fullName: 'mockSpecFullName',
      failedExpectations: [{message: 'mockFailedMessage', stack: 'mockStackMessage'}],
      passedExpectations: [{message: 'mockPassedMessage'}]
    });

    reporter.suiteDone({description : 'mockSuiteDescription', fullName: 'mockSuiteFullName'});
    reporter.jasmineDone();
    fs.readFile(destinationPath + '/' + reportFileName, 'utf8', function(error, contents) {

      expect(contents).to.contain('<h4>mockSuiteDescription');
      expect(contents).to.contain('mockSpecFullName');
      done();
    });
  });

  afterEach(function(done) {
    // clean folder
    rimraf(destinationPath, function(err) {
      if(err) {
        console.error('Could not delete ' + destinationPath + 'directory');
      }
      done();
    });
  });

});


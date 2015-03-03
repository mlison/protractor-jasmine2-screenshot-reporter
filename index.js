var fs     = require('fs'),
    mkdirp = require('mkdirp'),
    _      = require('lodash'),
    path   = require('path'),
    hat    = require('hat');

require('string.prototype.startswith');

function Jasmine2ScreenShotReporter(opts) {
    'use strict';

    var suites       = {},   // suite clones
        specs        = {},   // tes spec clones
        runningSuite = null, // currently running suite

        // report marks
        marks = {
            pending:'<span style="padding:0 1em;color:orange;">~</span>',
            failed: '<span style="padding:0 1em;color:red;">&#10007;</span>',
            passed: '<span style="padding:0 1em;color:green;">&#10003;</span>'
        };

    // write data into opts.dest as filename
    var writeScreenshot = function (data, filename) {
        var stream = fs.createWriteStream(opts.dest + filename);
        stream.write(new Buffer(data, 'base64'));
        stream.end();
    };

    var writeMetadata = function(data, filename) {
        var stream;

        try {
          stream = fs.createWriteStream(filename);
          stream.write(JSON.stringify(data, null, '\t'));
          stream.end();
        } catch(e) {
          console.error('Couldn\'t save metadata: ' + filename);
        }

    };

    // returns suite clone or creates one
    var getSuiteClone = function(suite) {
      suites[suite.id] = _.extend((suites[suite.id] || {}), suite);
      return suites[suite.id];
    };

    // returns spec clone or creates one
    var getSpecClone = function(spec) {
      specs[spec.id] = _.extend((specs[spec.id] || {}), spec);
      return specs[spec.id];
    };

    // returns duration in seconds
    var getDuration = function(obj) {
        if (!obj._started || !obj._finished) {
            return 0;
        }
        var duration = (obj._finished - obj._started) / 1000;
        return (duration < 1) ? duration : Math.round(duration);
    };

    var pathBuilder = function(spec, suites, capabilities) {
      return hat();
    };

    var metadataBuilder = function(spec, suites, capabilities) {
      return false;
    };

    // TODO: more options
    opts          = opts || {};
    opts.dest     = (opts.dest || 'target/screenshots') + '/';
    opts.filename = opts.filename || 'report.html';
    opts.ignoreSkippedSpecs = opts.ignoreSkippedSpecs || false;
    opts.captureOnlyFailedSpecs = opts.captureOnlyFailedSpecs || false;
    opts.pathBuilder = opts.pathBuilder || pathBuilder;
    opts.metadataBuilder = opts.metadataBuilder || metadataBuilder;


    this.jasmineStarted = function() {
        mkdirp(opts.dest, function(err) {
            var files;

            if(err) {
                throw new Error('Could not create directory ' + opts.dest);
            }

            files = fs.readdirSync(opts.dest);

            _.each(files, function(file) {
              var filepath = opts.dest + file;
              if (fs.statSync(filepath).isFile()) {
                fs.unlinkSync(filepath);
              }
            });
        });
    };

    this.suiteStarted = function(suite) {
        suite = getSuiteClone(suite);
        suite._suites = [];
        suite._specs = [];
        suite._started = Date.now();
        suite._parent = runningSuite;

        if (runningSuite) {
            runningSuite._suites.push(suite);
        }

        runningSuite = suite;
    };

    this.suiteDone = function(suite) {
        suite = getSuiteClone(suite);
        suite._finished = Date.now();
        runningSuite = suite._parent;
    };

    this.specStarted = function(spec) {
        spec = getSpecClone(spec);
        spec._started = Date.now();
        spec._suite = runningSuite;
        runningSuite._specs.push(spec);
    };

    this.specDone = function(spec) {
        var file;
        spec = getSpecClone(spec);
        spec._finished = Date.now();

        // Don't screenshot skipped specs
        var isSkipped = opts.ignoreSkippedSpecs && spec.status === 'pending';
        // Screenshot only for failed specs
        var isIgnored = opts.captureOnlyFailedSpecs && spec.status !== 'failed';

        if (isSkipped || isIgnored) {
            _.pull(runningSuite._specs, spec);
            return;
        }

        file = opts.pathBuilder(spec, suites);
        spec.filename = file + '.png';

        browser.takeScreenshot().then(function (png) {
            browser.getCapabilities().then(function (capabilities) {
                var screenshotPath,
                    metadataPath,
                    metadata;

                screenshotPath = path.join(opts.dest, spec.filename);
                metadata       = opts.metadataBuilder(spec, suites, capabilities);

                if (metadata) {
                    metadataPath = path.join(opts.dest, file + '.json');
                    mkdirp(path.dirname(metadataPath), function(err) {
                        if(err) {
                            throw new Error('Could not create directory for ' + metadataPath);
                        }
                        writeMetadata(metadata, metadataPath);
                    });
                }

                mkdirp(path.dirname(screenshotPath), function(err) {
                    if(err) {
                        throw new Error('Could not create directory for ' + screenshotPath);
                    }
                    writeScreenshot(png, spec.filename);
                });
            });
        });
    };

    this.jasmineDone = function() {
        var htmlReport = fs.openSync(opts.dest + opts.filename, 'w');
        var output = printResults(suites[Object.keys(suites)[0]]);
        fs.writeSync(htmlReport, output, 0);
        fs.closeSync(htmlReport);
    };

    // TODO: better template

    var printedSpecs = [];
    function printSpec(spec) {
      var suiteName = spec._suite ? spec._suite.fullName : '';
      if (_.contains(printedSpecs, spec.id)) {
        return '';
      }

      printedSpecs.push(spec.id);
      return '<li>' + marks[spec.status] + '<a href="' + spec.filename + '">' + spec.fullName.replace(suiteName, '').trim() + '</a> (' + getDuration(spec) + ' s)</li>';
    }

    var printedSuites = [];
    function printResults(suite) {
        var output = '';

        if (_.contains(printedSuites, suite.id)) {
          return '';
        }

        printedSuites.push(suite.id);

        output += '<ul style="list-style-type:none">';
        output += '<h4>' + suite.fullName + ' (' + getDuration(suite) + ' s)</h4>';

        _.each(suite._specs, function(spec) {
            spec = specs[spec.id];
            output += printSpec(spec);
        });

        if (suite._suites.length) {
            _.each(suite._suites, function(childSuite) {
                output += printResults(childSuite);
            });
        }

        output += '</ul>';

        return output;
    }

    return this;
}

module.exports = Jasmine2ScreenShotReporter;

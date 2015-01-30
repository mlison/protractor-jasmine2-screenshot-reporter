// Screenshot reporter that works with jasmine2
// TODO: the whole thing.

var fs     = require('fs'),
    mkdirp = require('mkdirp'),
    _      = require('lodash');

function Jasmine2ScreenShotReporter(opts) {
    var Reporter = {};

    var suites = {},
        specs = {},
        runningSuite = null;

    // TODO: options
    opts          = opts || {};
    opts.dest     = (opts.dest || 'target/screenshots') + '/';
    opts.filename = opts.filename || 'report.html';

    var writeScreenshot = function (data, filename) {
        var stream = fs.createWriteStream(opts.dest + filename);
        stream.write(new Buffer(data, 'base64'));
        stream.end();
    }

    var getSuiteClone = function(suite) {
      suites[suite.id] = _.extend((suites[suite.id] || {}), suite);
      return suites[suite.id];
    }

    var getSpecClone = function(spec) {
      specs[spec.id] = _.extend((suites[spec.id] || {}), spec);

      // some basic meta, TODO: more
      specs[spec.id].mark = (specs[spec.id].failedExpectations.length ? '&#10007;' : '&#10003;');
      specs[spec.id].filename = (specs[spec.id].failedExpectations.length ? 'failed' : 'passed') + '-' + specs[spec.id].fullName + '.png';
      return specs[spec.id];
    }

    Reporter.jasmineStarted = function(summary) {
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
    }

    Reporter.suiteStarted = function(suite) {
        // TODO: metadata
        suite = getSuiteClone(suite);
        suite._suites = [];
        suite._specs = [];
        suite._parent = runningSuite;

        if (runningSuite) {
            runningSuite._suites.push(suite);
        }

        runningSuite = suite;
    };

    Reporter.suiteDone = function(suite) {
        suite = getSuiteClone(suite);
        runningSuite = suite._parent;
    };

    Reporter.specStarted = function(spec) {
        spec = getSpecClone(spec);
        spec._suite = runningSuite;
        runningSuite._specs.push(spec);
    }

    Reporter.specDone = function(spec) {
        // TODO: handle pending specs

        spec = getSpecClone(spec);

        browser.takeScreenshot().then(function (png) {
            browser.getCapabilities().then(function (capabilities) {
                writeScreenshot(png, spec.filename);
            });
        });
    };

    Reporter.jasmineDone = function() {
        var htmlReport = fs.openSync(opts.dest + opts.filename, 'w');
        var output = printResults(suites['suite0']);
        fs.writeSync(htmlReport, output, 0);
        fs.closeSync(htmlReport);
    };

    function printResults(suite) {
        var output = '';

        output += '<ul style="list-style-type:none">';
        output += "<h4>" + suite.fullName + "</h4>";

        if (suite._suites.length) {
            _.each(suite._suites, function(childSuite) {
                output += printResults(childSuite);
            });
        } else {
            _.each(suite._specs, function(spec) {
                spec = getSpecClone(spec);
                output += '<li>' + (spec.status === 'pending' ? '&#10052;' : spec.mark) + ' <a href="' + spec.filename + '">' + spec.fullName.replace(suite.fullName, '') + '</a></li>';
            });
            output += '</ul>';
        }

        return output;
    }

    return Reporter;
}

module.exports = Jasmine2ScreenShotReporter;

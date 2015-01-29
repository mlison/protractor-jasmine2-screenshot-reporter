// Screenshot reporter that works with jasmine2
// TODO: the whole thing.

var fs     = require('fs'),
    mkdirp = require('mkdirp'),
    _      = require('lodash');

function Jasmine2ScreenShotReporter(opts) {
    var Reporter = {};

    var suites = [],
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

    Reporter.jasmineStarted = function(summary) {
        mkdirp(opts.dest, function(err) {
            if(err) {
                throw new Error('Could not create directory ' + opts.dest);
            }
        });
    }

    Reporter.suiteStarted = function(suite) {
        // TODO: metadata
        suite._suites = [];
        suite._specs = [];
        suite._parent = runningSuite;

        if (!runningSuite) {
            suites.push(suite);
        } else {
            runningSuite._suites.push(suite);
        }

        runningSuite = suite;
    };

    Reporter.suiteDone = function(suite) {
        runningSuite = suite._parent;
    };

    Reporter.specStarted = function(spec) {
        // TODO: metadata
        spec._suite = runningSuite;
        runningSuite._specs.push(spec);
    }

    Reporter.specDone = function(spec) {
        var passFail = (spec.failedExpectations.length) ? 'FAIL' : 'pass';
        // TODO: handle pending specs
        spec.filename = (spec.status || passFail) + '-' + spec.fullName + '.png';

        browser.takeScreenshot().then(function (png) {
            browser.getCapabilities().then(function (capabilities) {
                writeScreenshot(png, spec.filename);
            });
        });
    };

    Reporter.jasmineDone = function(x) {
        var htmlReport = fs.openSync(opts.dest + opts.filename, 'w');
        var output = '';
        _.each(suites, function(suite) {
            output += printResults(suite);
        });
        fs.writeSync(htmlReport, output, 0);
        fs.closeSync(htmlReport);
    };

    function printResults(suite) {
        var output = '';

        output += "<h4>" + suite.fullName + "</h4>";

        if (suite._suites.length) {
            _.each(suite._suites, function(childSuite) {
                output += printResults(childSuite);
            });
        } else {
            _.each(suite._specs, function(spec) {
                var mark = (spec.failedExpectations.length ? '&#10007;' : '&#10003;');
                output += (spec.status === 'pending' ? '&#10052;' : mark) + ' <a href="' + spec.filename + '">' + spec.fullName.replace(suite.fullName, '') + '</a><br />';
            });
        }

        return output;
    }

    return Reporter;
}

module.exports = Jasmine2ScreenShotReporter;

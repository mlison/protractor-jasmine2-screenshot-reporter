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
        var stream = fs.createWriteStream(opts.dest + opts.filename);
        stream.write(new Buffer(data, 'base64'));
        stream.end();
    }

    Reporter.jasmineStarted = function(summary) {
        // TODO: stuff here?
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
                mkdirp(opts.directory, function(err) {
                    if(err) {
                        throw new Error('Could not create directory ' + opts.directory);
                    } else {
                        writeScreenshot(png, spec.filename);
                    }
                });
            });
        });
    };

    Reporter.jasmineDone = function(x) {
        // TODO: better report
        var output = '';
        _.each(cache, function(suite) {
            output = output + "<h4>" + suite.fullName + "</h4>";
            _.each(suite.specs, function(spec) {
                var mark = (spec.failedExpectations.length ? '&#10007;' : '&#10003;');
                output = output + (spec.status === 'pending' ? '&#10052;' : mark) + ' <a href="' + spec.filename + '">' + spec.fullName + '</a><br />';
            });
        })

        var htmlReport = fs.openSync(path+'report.html', 'w');
        fs.writeSync(htmlReport, output, 0);
        fs.closeSync(htmlReport);
    };

    return Reporter;
}

module.exports = Jasmine2ScreenShotReporter;

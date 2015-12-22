var DEFAULT_DESTINATION = 'target/screenshots';

var fs     = require('fs'),
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),
    _      = require('lodash'),
    path   = require('path'),
    hat    = require('hat');

require('string.prototype.startswith');

function Jasmine2ScreenShotReporter(opts) {
    'use strict';

    var self = this,
        suites       = {},   // suite clones
        specs        = {},   // tes spec clones
        runningSuite = null, // currently running suite

        // report marks
        marks = {
            pending:'<span class="pending">~</span>',
            failed: '<span class="failed">&#10007;</span>',
            passed: '<span class="passed">&#10003;</span>'
        },

        statusCssClass = {
          pending: 'pending',
          failed:  'failed',
          passed:  'passed'
        },

        // store extra css files.
        cssLinks = [],

        // monitor failed specs for quick links
        failedSpecIds = [],

        // when use use fit, jasmine never calls suiteStarted / suiteDone, so make a fake one to use
        fakeFocusedSuite = {
          id: 'focused',
          description: 'focused specs',
          fullName: 'focused specs'
        };

    var linkTemplate = _.template(
        '<li id="<%= id %>" class="<%= cssClass %>">' +
            '<%= mark %>' +
            '<a href="<%= filename %>"><%= name %></a> ' +
            '(<%= duration %> s)' +
            '<%= reason %>' +
        '</li>'
    );

    var nonLinkTemplate = _.template(
        '<li title="No screenshot was created for this test case." id="<%= id %>" class="<%= cssClass %>">' +
            '<%= mark %>' +
            '<%= name %> ' +
            '(<%= duration %> s)' +
            '<%= reason %>' +
        '</li>'
    );

    var reportTemplate = _.template(
        '<html>' +
            '<head>' +
                '<meta charset="utf-8">' +
                '<style>' +
                    'body { font-family: Arial; }' +
                    'ul { list-style-position: inside; }' +
                    'span.passed { padding: 0 1em; color: green; }' +
                    'span.failed { padding: 0 1em; color: red; }' +
                    'span.pending { padding: 0 1em; color: orange; }' +
                '</style>' +
                '<%= userCss %>' +
            '</head>' +
            '<body>' +
            '<h1><%= title %></h1>' +
            '<%= report %>' +
            '</body>' +
        '</html>'
    );

    var reasonsTemplate = _.template(
      '<ul>' +
          '<% _.forEach(reasons, function(reason) { %>' +
              '<li><%- reason.message %></li>' +
          '<% }); %>' +
      '</ul>'
    );

    var summaryTemplate = _.template(
      '<div id="summary" class="<%= cssClass %>">' +
        '<h4>Summary</h4>' +
        '<%= summaryBody %>' +
        '<%= quickLinks %>' +
      '</div>'
    );

    var configurationTemplate = _.template(
      '<div id="config">' +
        '<h4>Configuration</h4>' +
        '<%= configBody %>' +
      '</div>'
    );

    var objectToItemTemplate = _.template(
      '<li>' +
        '<%= key %>:  <%= value %>' +
      '</li>'
    );

    var quickLinksTemplate = _.template(
      '<ul id="quickLinks"><%= quickLinks %></ul>'
    );

    var quickLinkListItemTemplate = _.template(  
      '<li>' +
        '<a href="#<%= specId %>"><%= specId %></a>' +
      '</li>'
    );

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

    var isSpecValid = function(spec) {
      // Don't screenshot skipped specs
      var isSkipped = opts.ignoreSkippedSpecs && spec.status === 'pending';
      // Screenshot only for failed specs
      var isIgnored = opts.captureOnlyFailedSpecs && spec.status !== 'failed';

      return !isSkipped && !isIgnored;
    };

    var isSpecReportable = function(spec) {
      return (opts.reportOnlyFailedSpecs && spec.status === 'failed') || !opts.reportOnlyFailedSpecs;
    };

    var hasValidSpecs = function(suite) {
      var validSuites = false;
      var validSpecs = false;

      if (suite._suites.length) {
        validSuites = _.any(suite._suites, function(s) {
          return hasValidSpecs(s);
        });
      }

      if (suite._specs.length) {
        validSpecs = _.any(suite._specs, function(s) {
          return isSpecValid(s) || isSpecReportable(s);
        });
      }

      return validSuites || validSpecs;
    };

    var getDestination = function(){
        return (opts.dest || DEFAULT_DESTINATION) + '/';
    };

    var getDestinationWithUniqueDirectory = function(){
        return getDestination() + hat() + '/';
    };

    var getCssLinks = function(cssFiles) {
        var cssLinks = '';

        _.each(cssFiles, function(file) {
            cssLinks +='<link type="text/css" rel="stylesheet" href="' + file + '">';
        });

        return cssLinks;
    };

    // TODO: more options
    opts          = opts || {};
    opts.preserveDirectory = opts.preserveDirectory || false;
    opts.dest     = opts.preserveDirectory ?  getDestinationWithUniqueDirectory() : getDestination();
    opts.filename = opts.filename || 'report.html';
    opts.ignoreSkippedSpecs = opts.ignoreSkippedSpecs || false;
    opts.reportOnlyFailedSpecs = opts.hasOwnProperty('reportOnlyFailedSpecs') ? opts.reportOnlyFailedSpecs : true;
    opts.captureOnlyFailedSpecs = opts.captureOnlyFailedSpecs || false;
    opts.pathBuilder = opts.pathBuilder || pathBuilder;
    opts.metadataBuilder = opts.metadataBuilder || metadataBuilder;
    opts.userCss = Array.isArray(opts.userCss) ?  opts.userCss : opts.userCss ? [ opts.userCss ] : [];
    opts.totalSpecsDefined = null;
    opts.failedSpecs = 0;
    opts.showSummary = opts.showSummary || true;
    opts.showQuickLinks = opts.showQuickLinks || false;
    opts.browserCaps = {};
    opts.configurationStrings = opts.configurationStrings || {};
    opts.showConfiguration = opts.showConfiguration || true;
    opts.reportTitle = opts.reportTitle || 'Report';


    this.jasmineStarted = function(suiteInfo) {
        opts.totalSpecsDefined = suiteInfo.totalSpecsDefined;

        rimraf(opts.dest, function(err) {
          if(err) {
            throw new Error('Could not remove previous destination directory ' + opts.dest);
          }

          mkdirp(opts.dest, function(err) {
            if(err) {
              throw new Error('Could not create directory ' + opts.dest);
            }
          });
        });

        browser.getCapabilities().then(function (capabilities) {
            opts.browserCaps.browserName = capabilities.get('browserName');
            opts.browserCaps.browserVersion = capabilities.get('version');
            opts.browserCaps.platform = capabilities.get('platform');
            opts.browserCaps.javascriptEnabled = capabilities.get('javascriptEnabled');
            opts.browserCaps.cssSelectorsEnabled = capabilities.get('cssSelectorsEnabled');
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
        if (suite._parent === undefined) {
            // disabled suite (xdescribe) -- suiteStarted was never called
            self.suiteStarted(suite);
        }
        suite._finished = Date.now();
        runningSuite = suite._parent;
    };

    this.specStarted = function(spec) {
        if (!runningSuite) {
          // focused spec (fit) -- suiteStarted was never called
          self.suiteStarted(fakeFocusedSuite);
        }
        spec = getSpecClone(spec);
        spec._started = Date.now();
        spec._suite = runningSuite;
        runningSuite._specs.push(spec);
    };

    this.specDone = function(spec) {
        var file;
        spec = getSpecClone(spec);
        spec._finished = Date.now();

        if (!isSpecValid(spec)) {
          spec.skipPrinting = true;
          return;
        }

        if (spec.status === 'failed') {
          opts.failedSpecs += 1;
          failedSpecIds.push(spec.id);
        }

        browser.takeScreenshot().then(function (png) {
            browser.getCapabilities().then(function (capabilities) {
                var screenshotPath,
                    metadataPath,
                    metadata;

                file = opts.pathBuilder(spec, suites, capabilities);
                spec.filename = file + '.png';

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
      var output = '';

      if (runningSuite) {
          // focused spec (fit) -- suiteDone was never called
          self.suiteDone(fakeFocusedSuite);
      }

      if (opts.showSummary) {
        output += printTestSummary();
      }

      _.each(suites, function(suite) {
        output += printResults(suite);
      });

      // Ideally this shouldn't happen, but some versions of jasmine will allow it
      _.each(specs, function(spec) {
        output += printSpec(spec);
      });

      if (opts.showConfiguration) {
        output += printTestConfiguration();
      }

      var cssLinks = getCssLinks(opts.userCss);

      fs.appendFileSync(
        opts.dest + opts.filename,
        reportTemplate({ report: output,
                         title: opts.reportTitle,
                         userCss: cssLinks}),
        { encoding: 'utf8' },
        function(err) {
            if(err) {
              console.error('Error writing to file:' + opts.dest + opts.filename);
              throw err;
            }
        }
      );
    };

    function printSpec(spec) {
      var suiteName = spec._suite ? spec._suite.fullName : '';
      var template = spec.filename ? linkTemplate : nonLinkTemplate;

      if (spec.isPrinted || (spec.skipPrinting && !isSpecReportable(spec))) {
        return '';
      }

      spec.isPrinted = true;

      return template({
        mark:     marks[spec.status],
        cssClass: statusCssClass[spec.status],
        id:       spec.id,
        name:     spec.fullName.replace(suiteName, '').trim(),
        reason:   printReasonsForFailure(spec),
        filename: encodeURI(spec.filename),
        duration: getDuration(spec),
      });
    }

    // TODO: proper nesting -> no need for magic
    function printResults(suite) {
        var output = '';

        if (suite.isPrinted || !hasValidSpecs(suite)) {
          return '';
        }

        suite.isPrinted = true;

        output += '<ul style="list-style-type:none">';
        output += '<h4>' + suite.description + ' (' + getDuration(suite) + ' s)</h4>';

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

    function printReasonsForFailure(spec) {
      if (spec.status !== 'failed') {
        return '';
      }

      return reasonsTemplate({ reasons: spec.failedExpectations });
    }

    function printTestSummary() {
      var summary = {
        "Total specs": opts.totalSpecsDefined,
        "Failed specs": opts.failedSpecs
      };

      var cssClass = opts.failedSpecs > 0 ? statusCssClass["failed"] : statusCssClass["passed"];
      var keys = Object.keys(summary);
      
      var summaryOutput = "";
      _.each(keys, function(key) {
        summaryOutput += objectToItemTemplate({"key": key, "value": summary[key]});
      });

      var quickLinks = opts.showQuickLinks ? printFailedSpecQuickLinks() : '';

      return summaryTemplate({"summaryBody": summaryOutput, "cssClass": cssClass, "quickLinks": quickLinks});
    }

    function printFailedSpecQuickLinks() {
      var quickLinksOutput = "";
      _.each(failedSpecIds, function(id) {
        quickLinksOutput += quickLinkListItemTemplate({specId: id});
      });

      return quickLinksTemplate({quickLinks: quickLinksOutput});
    }
    
    function printTestConfiguration() {
      var testConfiguration = {
        "Jasmine version": jasmine.version,
        "Browser name": opts.browserCaps.browserName,
        "Browser version": opts.browserCaps.browserVersion,
        "Platform": opts.browserCaps.platform,
        "Javascript enabled": opts.browserCaps.javascriptEnabled,
        "Css selectors enabled": opts.browserCaps.cssSelectorsEnabled
      };

      testConfiguration = _.assign(testConfiguration, opts.configurationStrings);

      var keys = Object.keys(testConfiguration);
      
      var configOutput = "";
      _.each(keys, function(key) {
        configOutput += objectToItemTemplate({"key": key, "value": testConfiguration[key]});
      });

      return configurationTemplate({"configBody": configOutput});
    }

    return this;
}

module.exports = Jasmine2ScreenShotReporter;

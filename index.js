var DEFAULT_DESTINATION = 'target/screenshots';

var fs     = require('fs'),
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),
    _      = require('lodash'),
    path   = require('path'),
    uuid   = require('uuid'),
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

  // when use use fit, jasmine never calls suiteStarted / suiteDone, so make a fake one to use
      fakeFocusedSuite = {
        id: 'focused',
        description: 'focused specs',
        fullName: 'focused specs'
      };

  var linkTemplate = _.template(
      '<li id="<%= id %>" ' +
      'class="<%= cssClass %>" ' +
      'data-spec="<%= specId %>" ' +
      'data-name="<%= name %>" ' +
      'data-browser="<%= browserName %>">' +
      '<%= mark %>' +
      '<a href="<%= filename[\'main\'] %>"><%= name %></a>' +
      '<% _.forEach(filename, function (val, key) { if (key != \'main\') { %>' +
      ' [<a href="<%= val %>"><%= key %></a>] ' +
      '<% } }) %>' +
      '(<%= duration %> s)' +
      '<%= reason %>' +
      '<%= failedUrl %>' +
      '</li>'
  );

  var inlineTemplate = _.template(
      '<li id="<%= id %>" ' +
      'class="<%= cssClass %>" ' +
      'data-spec="<%= specId %>" ' +
      'data-name="<%= name %>" ' +
      'data-browser="<%= browserName %>">' +
      '<%= mark %>' +
      '<img src="<%= filename[\'main\'] %>"><%= name %></img>' +
      '<% _.forEach(filename, function (val, key) { if (key != \'main\') { %>' +
      ' [<img src="<%= val %>"><%= key %></img>] ' +
      '<% } }) %>' +
      '(<%= duration %> s)' +
      '<%= reason %>' +
      '<%= failedUrl %>' +
      '</li>'
  );

  var nonLinkTemplate = _.template(
      '<li title="No screenshot was created for this test case." ' +
      'id="<%= id %>" ' +
      'class="<%= cssClass %>" ' +
      'data-spec="<%= specId %>" ' +
      'data-name="<%= name %>" ' +
      'data-browser="<%= browserName %>">' +
      '<%= mark %>' +
      '<%= name %> ' +
      '(<%= duration %> s)' +
      '<%= reason %>' +
      '<%= failedUrl %>' +
      '</li>'
  );

  var openReportTemplate = _.template(
      '<html>' +
      '<head>' +
      '<meta charset="utf-8">' +
      '<style>' +
      'body { font-family: Arial; }' +
      'ul { list-style-position: inside; }' +
      'li img { max-width: 100%; }' +
      'span.passed { padding: 0 1em; color: green; }' +
      'span.failed { padding: 0 1em; color: red; }' +
      'span.pending { padding: 0 1em; color: orange; }' +
      'span.stacktrace { white-space: pre; border: 1px solid rgb(0, 0, 0); font-size: 9pt; padding: 4px; background-color: rgb(204, 204, 204); }' +
      '</style>' +
      '<%= userCss %>' +
      '<script type="text/javascript">' +
      'function showhide(id) {' +
      'var e = document.getElementById(id);' +
      'e.style.display = (e.style.display === "block") ? "none" : "block";' +
      '}' +
      'function buildQuickLinks() {' +
      'var failedSpecs = document.querySelectorAll("li.failed");' +
      'var quickLinksContainer = document.getElementById("quickLinks");' +
      'if (!quickLinksContainer) return;' +
      'if (failedSpecs.length > 0) { ' +
      'document.getElementById("quickLinksHeader").textContent = "Quicklink of Failure"' +
      '}' +
      'for (var i = 0; i < failedSpecs.length; ++i) {' +
      'var li = document.createElement("li");' +
      'var a = document.createElement("a");' +
      'a.href = "#" + failedSpecs[i].id;' +
      'a.textContent = failedSpecs[i].dataset.name + "  (" + failedSpecs[i].dataset.browser + ")";' +
      'li.appendChild(a);' +
      'quickLinksContainer.appendChild(li);' +
      '}' +
      '}' +
      'function updatePassCount() {' +
      'var totalPassed = document.querySelectorAll("li.passed").length;' +
      'var totalFailed = document.querySelectorAll("li.failed").length;' +
      'var totalSpecs = totalFailed + totalPassed;' +
      'console.log("passed: %s, failed: %s, total: %s", totalPassed, totalFailed, totalSpecs);' +
      'document.getElementById("summaryTotalSpecs").textContent = ' +
      'document.getElementById("summaryTotalSpecs").textContent + totalSpecs;' +
      'document.getElementById("summaryTotalFailed").textContent = ' +
      'document.getElementById("summaryTotalFailed").textContent + totalFailed;' +
      'if (totalFailed) {' +
      'document.getElementById("summary").className = "failed";' +
      '}' +
      '}' +
      'function start() {' +
      'updatePassCount();' +
      'buildQuickLinks();' +
      '}' +
      'window.onload = start;' +
      '</script>' +
      '</head>' +
      '<body>'
  );

  var addReportTitle = _.template(
      '<h1><%= title %></h1>'
  );

  var addReportSummary = _.template(
      '<div id="summary" class="passed">' +
      '<h4>Summary</h4>' +
      '<ul>' +
      '<li id="summaryTotalSpecs">Total specs tested: </li>' +
      '<li id="summaryTotalFailed">Total failed: </li>' +
      '</ul>' +
      '<%= quickLinks %>' +
      '</div>'
  );

  var addQuickLinks = _.template(
      '<h4 id="quickLinksHeader"></h4>' +
      '<ul id="quickLinks"></ul>'
  );

  var closeReportTemplate = _.template(
      '</body>' +
      '</html>'
  );

  var reportTemplate = _.template(
      '<%= report %>'
  );

  var reasonsTemplate = _.template(
      '<ul>' +
      '<% _.forEach(reasons, function(reason, key) { %>' +
      '<li><%- reason.message %> [<a href="javascript:showhide(\'<%= id %><%= key %>\')">stack</a>]<br/>' +
      '<span style="display: none" id="<%= id %><%= key %>" class="stacktrace"><%- reason.stack %></span></li>' +
      '<% }); %>' +
      '</ul>'
  );

  var failedUrlTemplate = _.template(
      '<ul>' +
      '<li>Failed at url: <a href="<%= failedUrl %>"><%= failedUrl %></a></li>' +
      '</ul>'
  );

  var configurationTemplate = _.template(
      '<a href="javascript:showhide(\'<%= configId %>\')">' +
      'Toggle Configuration' +
      '</a>' +
      '<div class="config" id="<%= configId %>" style="display: none">' +
      '<h4>Configuration</h4>' +
      '<%= configBody %>' +
      '</div>'
  );

  var objectToItemTemplate = _.template(
      '<li>' +
      '<%= key %>:  <%= value %>' +
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

  var pathBuilder = function() {
    return hat();
  };

  var metadataBuilder = function() {
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
      validSuites = _.some(suite._suites, function(s) {
        return hasValidSpecs(s);
      });
    }

    if (suite._specs.length) {
      validSpecs = _.some(suite._specs, function(s) {
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

  var cleanDestination = function(callback) {
    // if we aren't removing the old report folder then simply return
    if (!opts.cleanDestination) {
      callback();
      return;
    }

    rimraf(opts.dest, function(err) {
      if(err) {
        throw new Error('Could not remove previous destination directory ' + opts.dest);
      }

      mkdirp(opts.dest, function(err) {
        if(err) {
          throw new Error('Could not create directory ' + opts.dest);
        }

        callback(err);
      });
    });
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
  opts.showSummary = opts.hasOwnProperty('showSummary') ? opts.showSummary : true;
  opts.showQuickLinks = opts.showQuickLinks || false;
  opts.browserCaps = {};
  opts.configurationStrings = opts.configurationStrings || {};
  opts.showConfiguration = opts.hasOwnProperty('showConfiguration') ? opts.showConfiguration : true;
  opts.reportTitle = opts.hasOwnProperty('reportTitle') ? opts.reportTitle : 'Report';
  opts.cleanDestination = opts.hasOwnProperty('cleanDestination') ? opts.cleanDestination : true;
  opts.reportFailedUrl = opts.reportFailedUrl || false;
  opts.inlineImages = opts.inlineImages || false;

  // TODO: proper nesting -> no need for magic

  function getUniqueSpecId(spec) {
    return [
      spec.id,
      opts.browserCaps.platform,
      opts.browserCaps.browserName,
      opts.browserCaps.browserVersion
    ].join('-').replace(/\ /g, '');
  }

  function printReasonsForFailure(spec) {
    if (spec.status !== 'failed') {
      return '';
    }

    return reasonsTemplate({
      id: getUniqueSpecId(spec),
      reasons: spec.failedExpectations
    });
  }

  function printFailedUrl(spec) {
    if (spec.status !== 'failed' || !opts.reportFailedUrl) {
      return '';
    }

    return failedUrlTemplate({
      failedUrl: spec.failedAtUrl
    });
  }

  function escapeInvalidXmlChars(str) {
        return str.replace(/\&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/\>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/\'/g, '&apos;')
            .replace(/[\x1b]/g, ''); //Remove control character
  }

  function printSpec(spec) {
    var suiteName = spec._suite ? spec._suite.fullName : '';
    var template = !_.isEmpty(spec.filename) ? (opts.inlineImages ? inlineTemplate : linkTemplate) : nonLinkTemplate;

    if (spec.isPrinted || (spec.skipPrinting && !isSpecReportable(spec))) {
      return '';
    }

    spec.isPrinted = true;

    return template({
      browserName: opts.browserCaps.browserName,
      cssClass: statusCssClass[spec.status],
      duration: getDuration(spec),
      filename: spec.filename,
      id:       uuid.v1(),
      mark:     marks[spec.status],
      name:     escapeInvalidXmlChars(spec.fullName.replace(suiteName, '').trim()),
      reason:   printReasonsForFailure(spec),
      failedUrl:  printFailedUrl(spec),
      specId:   spec.id
    });
  }

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

  function printTestConfiguration() {
    var testConfiguration = {
      'Jasmine version': jasmine.version,
      'Browser name': opts.browserCaps.browserName,
      'Browser version': opts.browserCaps.browserVersion,
      'Platform': opts.browserCaps.platform,
      'Javascript enabled': opts.browserCaps.javascriptEnabled,
      'Css selectors enabled': opts.browserCaps.cssSelectorsEnabled
    };

    testConfiguration = _.assign(testConfiguration, opts.configurationStrings);

    var keys = Object.keys(testConfiguration);

    var configOutput = '';
    _.each(keys, function(key) {
      configOutput += objectToItemTemplate({'key': key, 'value': testConfiguration[key]});
    });

    var configId = uuid.v1();
    return configurationTemplate({'configBody': configOutput, 'configId': configId});
  }

  this.beforeLaunch = function(callback) {
    console.log('Report destination:  ', path.join(opts.dest, opts.filename));

    var cssLinks = getCssLinks(opts.userCss);
    var summaryQuickLinks = opts.showQuickLinks ? addQuickLinks(): '';
    var reportSummary = opts.showSummary ? addReportSummary({ quickLinks: summaryQuickLinks }) : '';


    // Now you'll need to build the replacement report text for the file.
    var reportContent = openReportTemplate({ userCss: cssLinks});
    reportContent += addReportTitle({ title: opts.reportTitle});
    reportContent += reportSummary;

    // Now remove the existing stored content and replace it with the new report shell.
    cleanDestination(function(err) {
      if (err) {
        throw err;
      }

      fs.appendFile(
          path.join(opts.dest, opts.filename),
          reportContent,
          { encoding: 'utf8' },
          function(err) {
            if (err) {
              console.error ('Error writing to file: ' + path.join(opts.dest, opts.filename));
              throw err;
            }
            callback();
          }
      );
    });
  };

  this.afterLaunch = function(callback) {
    console.log('Closing report');

    fs.appendFile(
        path.join(opts.dest, opts.filename),
        closeReportTemplate(),
        { encoding: 'utf8' },
        function(err) {
          if(err) {
            console.error('Error writing to file:' + path.join(opts.dest, opts.filename));
            throw err;
          }
          callback();
        }
    );
  };

  this.jasmineStarted = function(suiteInfo) {
    opts.totalSpecsDefined = suiteInfo.totalSpecsDefined;

    /* Dirty fix to make sure last screenshot is always linked to the report
     * TODO: remove once we're able to return a promise from specDone / suiteDone
     */
    afterAll(process.nextTick);

    browser.forkedInstances = {
      'main': browser
    };

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
    spec.filename = {};
    spec = getSpecClone(spec);
    spec._finished = Date.now();

    if (!isSpecValid(spec)) {
      spec.skipPrinting = true;
      return;
    }

    _.each(browser.forkedInstances, function (browserInstance, key) {
      if (!browserInstance) {
        return;
      }
      browserInstance.takeScreenshot().then(function (png) {
        browserInstance.getCapabilities().then(function (capabilities) {
          var screenshotPath,
              metadataPath,
              metadata;

          var file = opts.pathBuilder(spec, suites, capabilities);
          spec.filename[key] = file + '.png';

          screenshotPath = path.join(opts.dest, spec.filename[key]);
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
            writeScreenshot(png, spec.filename[key]);
          });
        });
      });

      if(opts.reportFailedUrl) {
        if(spec.status === 'failed') {
          browserInstance.getCurrentUrl().then(function(url) {
            spec.failedAtUrl = url;
          });
        }
      }
    });
  };

  this.jasmineDone = function() {
    var output = '';

    if (runningSuite) {
      // focused spec (fit) -- suiteDone was never called
      self.suiteDone(fakeFocusedSuite);
    }

    _.each(suites, function(suite) {
      output += printResults(suite);
    });

    // Ideally this shouldn't happen, but some versions of jasmine will allow it
    _.each(specs, function(spec) {
      output += printSpec(spec);
    });

    // Add configuration information when requested and only if specs have been reported.
    if (opts.showConfiguration) {
      var suiteHasSpecs = false;

      _.each(specs, function(spec) {
        suiteHasSpecs = spec.isPrinted || suiteHasSpecs;
      });

      if (suiteHasSpecs) {
        output += printTestConfiguration();
      }
    }
    mkdirp(path.dirname(opts.dest + opts.filename), function (err) {
      if (err) {
        console.log('Error creating screenshot directory');
        throw err;
      }
      fs.appendFileSync(
          path.join(opts.dest, opts.filename),
          reportTemplate({ report: output }),
          { encoding: 'utf8' },
          function(err) {
            if(err) {
              console.error('Error writing to file:' + path.join(opts.dest, opts.filename));
              throw err;
            }
          }
      );
    });
  };

  return this;
}

module.exports = Jasmine2ScreenShotReporter;

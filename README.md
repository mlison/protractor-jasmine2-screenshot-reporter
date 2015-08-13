## Protractor screenshot reporter for Jasmine2
[![npm version](https://badge.fury.io/js/protractor-jasmine2-screenshot-reporter.svg)](http://badge.fury.io/js/protractor-jasmine2-screenshot-reporter)

Reporter for Protractor that will capture a screenshot after each executed test case and store the results in a HTML report.
(supports jasmine2)

## Usage
The <code>protractor-jasmine2-screenshot-reporter</code> is available via npm:

<code>$ npm install protractor-jasmine2-screenshot-reporter --save-dev</code>

In your Protractor configuration file, register protractor-jasmine2-screenshot-reporter in jasmine:

<pre><code>var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

exports.config = {
   // ...

   onPrepare: function() {
      jasmine.getEnv().addReporter(
        new HtmlScreenshotReporter({
          dest: 'target/screenshots',
          filename: 'my-report.html'
        })
      );
   }
}</code></pre>

### Additional message passing
There is possibility to pass additional messages to report from within spec:

1. Save reference to reporter object. ex.:
<pre><code>var reporter = new HtmlScreenshotReporter({
        filename: 'my-report.html'
    });
    global.reporter = reporter;
    jasmine.getEnv().addReporter(reporter);</pre></code>


2. Pass extra message
<pre><code>describe('Top Level suite', function() {
        it('spec', function() {
            reporter.addMessageToSpec("Extra message");
            expect(1).toBe(1);
        });
    });</pre></code>

## Options
### Destination directory

Output directory for created files. All screenshots and reports will be stored here.

If the directory doesn't exist, it will be created automatically or otherwise cleaned before running the test suite.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   dest: '/project/test/screenshots'
}));</code></pre>

### Filename (optional)

Filename for html report.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   filename: 'my-report.html'
}));</code></pre>

Default is <code>report.html</code>

### Ignore pending specs (optional)

When this option is enabled, reporter will not create screenshots for pending / disabled specs. Only executed specs will be captured.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   ignoreSkippedSpecs: true
}));</code></pre>

Default is <code>false</code>

### Capture only failed specs (optional)

When this option is enabled, reporter will create screenshots only for specs that have failed their expectations.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   captureOnlyFailedSpecs: true
}));</code></pre>

Default is <code>false</code>

### Report only failed specs (optional)

This option is __enabled by default__ - in combination with <code>captureOnlyFailedSpecs</code>, it will capture and report screenshots only for failed specs. Turning this option off will cause the report to contain all specs, but screenshots will be captured only for failed specs.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   reportOnlyFailedSpecs: false,
   captureOnlyFailedSpecs: true
}));</code></pre>

### Path Builder (optional)

Function used to build custom paths for screenshots. For example:

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   pathBuilder: function(currentSpec, suites, browserCapabilities) {
      // will return chrome/your-spec-name.png
      return browserCapabilities.get('browserName') + '/' + currentSpec.fullName;
   }
}));</code></pre>

By default, the path builder will generate a random ID for each spec.

### Metadata Builder (optional)

Function used to build custom metadata objects for each spec. Files (json) will use the same filename and path as created by Path Builder.
For example:

<pre><code>jasmine.getEnv().addReporter(new ScreenShotReporter({
   metadataBuilder: function(currentSpec, suites, browserCapabilities) {
      return { id: currentSpec.id, os: browserCapabilities.get('browserName') };
   }
}));</code></pre>

By default, the runner builder will not save any metadata except the actual html report.

### Preserve Directory (optional)

This option is __disabled by default__. When this option is enabled, than for each report will be
 created separate directory with unique name. Directory unique name will be generated randomly.
 
<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   preserveDirectory: true
}));</code></pre>
 

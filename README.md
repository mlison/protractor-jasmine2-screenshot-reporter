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

## Options
### Destination directory

Output directory for created files. All screenshots and reports will be stored here.

If the directory doesn't exist, it will be created automatically or otherwise cleaned before running the test suite.

<pre><code>jasmine.getEnv().addReporter(new ScreenShotReporter({
   dest: '/project/test/screenshots'
}));</code></pre>

### Filename (optional)

Filename for html report.

<pre><code>jasmine.getEnv().addReporter(new ScreenShotReporter({
   filename: 'my-report.html'
}));</code></pre>

Default is <code>report.html</code>

### Ignore pending specs (optional)

When this option is enabled, reporter will not create screenshots for pending / disabled specs. Only executed specs will be captured.

<pre><code>jasmine.getEnv().addReporter(new ScreenShotReporter({
   ignoreSkippedSpecs: true
}));</code></pre>

Default is <code>false</code>

### Capture only failed specs (optional)

When this option is enabled, reporter will create screenshots only for specs that have failed their expectations.

<pre><code>jasmine.getEnv().addReporter(new ScreenShotReporter({
   captureOnlyFailedSpecs: true
}));</code></pre>

Default is <code>false</code>

### Path Builder (optional)

Function used to build custom paths for screenshots. For example:

<pre><code>jasmine.getEnv().addReporter(new ScreenShotReporter({
   pathBuilder: function(currentSpec, suites, browserCapabilities) {
      // will return chrome/your-spec-name.png
      return browserCapabilities.get('browserName') + '/' + currentSpec.fullName);
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

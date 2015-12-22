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

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   dest: '/project/test/screenshots'
}));</code></pre>

### Filename (optional)

Filename for html report.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   filename: 'my-report.html'
}));</code></pre>

Default is <code>report.html</code>

### Use External CSS (optional)

Array of filenames that specifies extra css files to include in the html report.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   userCss: 'my-report-styles.css'
}));</code></pre>

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

### Display summary in report (optional)

This option is __enabled by default__ - it will display the total number of specs and the number of failed specs in a short summary at the beginnning of the report.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   showSummary: true
}));</code></pre>

Default is <code>true</code>

### Display links to failed specs in report summary (optional)

If this option is enabled with the report summary, it will display a link to each failed spec as a part of the short summary at the beginnning of the report.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   showSummary: true,
   showQuickLinks: true
}));</code></pre>

Default is <code>false</code>

### Display configuration summary in report (optional)

This option is __enabled by default__ - it will display a summary of the test configuration details at the end of the report.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   showConfiguration: true
}));</code></pre>

Default is <code>true</code>

### Report title (optional)

This option will add a title to the report.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   reportTitle: "Report Title"
}));</code></pre>

Default is <code>'Report'</code>

### Extra configuration summary items (optional)

The user may specify a set of key/value pairs that are appended to the configuration report.

<pre><code>jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
   configurationStrings: {
           "My 1st Param": firstParam,
           "My 2nd Param": secondParam
   }
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
 

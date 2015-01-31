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

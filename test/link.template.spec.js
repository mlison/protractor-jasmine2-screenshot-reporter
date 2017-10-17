'use strict';

var assert = require('chai').assert,
  expect = require('chai').expect,
  chai = require('chai'),
  sinon = require('sinon');

const linkTemplate = require('../modules/link.template')

describe('link template', function() {
  it('basic info', function() {
    expect(linkTemplate({ id: 123 })).to.contain('id="123"')
    expect(linkTemplate({ cssClass: 123 })).to.contain('class="123"')
    expect(linkTemplate({ specId: 123 })).to.contain('data-spec="123"')
    expect(linkTemplate({ name: 123 })).to.contain('data-name="123"')
    expect(linkTemplate({ browserName: 123 })).to.contain('data-browser="123"')
    expect(linkTemplate({ duration: 123 })).to.contain('(123 s)')
    expect(linkTemplate({ reason: 123 })).to.contain('123')
    expect(linkTemplate({ failedUrl: 123 })).to.contain('123')
  });

  it('file links', function() {
    expect(linkTemplate({
      filename: {
        main: 'link'
      },
      name: 'meh'
    })).to.contain('<a href="link">meh</a>')

    expect(linkTemplate({
      filename: {
        main: 'link',
        extra: 'extra-link'
      },
      name: 'meh'
    })).to.contain('[<a href="extra-link">extra</a>]')
  });
});

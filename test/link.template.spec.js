'use strict';

const expect = require('chai').expect;
const linkTemplate = require('../modules/link.template')

describe('link template', () => {
  it('file links', () => {
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

  it('should not throw when filenames are missing', () => {
    expect(linkTemplate.bind(null, {})).not.to.throw()
  })
});

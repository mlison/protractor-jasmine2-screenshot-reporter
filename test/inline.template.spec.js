'use strict';

const expect = require('chai').expect;
const inlineTemplate = require('../modules/inline.template')

describe('link template', () => {
  it('file links', () => {
    expect(inlineTemplate({
      filename: {
        main: 'link'
      },
      name: 'meh'
    })).to.contain('<img src="link" title="meh" />')

    expect(inlineTemplate({
      filename: {
        main: 'link',
        extra: 'extra-link'
      },
      name: 'meh'
    })).to.contain('[<img src="extra-link" title="extra" />]')
  });

  it('should not throw when filenames are missing', () => {
    expect(inlineTemplate.bind(null, {})).not.to.throw()
  })
});

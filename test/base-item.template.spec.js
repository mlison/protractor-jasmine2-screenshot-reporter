'use strict';

const expect = require('chai').expect;
const baseItem = require('../modules/base-item.template')

it('base reporter item', function() {
  expect(baseItem(null, { id: 123 })).to.contain('id="123"')
  expect(baseItem(null, { cssClass: 123 })).to.contain('class="123"')
  expect(baseItem(null, { specId: 123 })).to.contain('data-spec="123"')
  expect(baseItem(null, { name: 123 })).to.contain('data-name="123"')
  expect(baseItem(null, { browserName: 123 })).to.contain('data-browser="123"')
  expect(baseItem(null, { duration: 123 })).to.contain('(123 s)')
  expect(baseItem(null, { reason: 123 })).to.contain('123')
  expect(baseItem(null, { failedUrl: 123 })).to.contain('123')
  expect(baseItem('bodyElems')).to.contain('bodyElems')
});

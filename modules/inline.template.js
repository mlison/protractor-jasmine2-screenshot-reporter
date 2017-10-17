'use strict';

const _ = require('lodash')
const baseLink = require('./base-item.template')

module.exports = (opts) => {
  opts.filename = opts.filename || {}

  const extraImages = _(opts.filename)
    .omit('main')
    .map((val, key) => `[<img src="${val}" title="${key}" />] `)
    .join('')

  const itemBody = `
    <img src="${opts.filename.main}" title="${opts.name}" />
    ${extraImages}
  `

  return baseLink(itemBody, opts)
}

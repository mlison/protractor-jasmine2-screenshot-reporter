'use strict';

const _ = require('lodash')
const baseLink = require('./base-item.template')

module.exports = (opts) => {
  opts.filename = opts.filename || {}

  const extraFiles = _(opts.filename)
    .omit('main')
    .map((val, key) => `[<a href="${val}">${key}</a>] `)
    .join('')

  const itemBody = `
    <a href="${opts.filename.main}">${opts.name}</a>
    ${extraFiles}
  `

  return baseLink(itemBody, opts)
}

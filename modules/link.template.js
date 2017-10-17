'use strict';

const _ = require('lodash')

module.exports = (opts) => {
  opts.filename = opts.filename || {}

  const extraFiles = _(opts.filename)
    .omit('main')
    .map((val, key) => `[<a href="${val}">${key}</a>] `)
    .join('')

  return `
    <li id="${opts.id}"
      class="${opts.cssClass}"
      data-spec="${opts.specId}"
      data-name="${opts.name}"
      data-browser="${opts.browserName}">
      ${opts.mark}
      <a href="${opts.filename.main}">${opts.name}</a>
      ${extraFiles}
      (${opts.duration} s)
      ${opts.reason}
      ${opts.failedUrl}
    </li>
  `
}

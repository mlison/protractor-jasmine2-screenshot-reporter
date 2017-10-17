'use strict';

module.exports = (itemBody = '', opts = {}) => {
  return `
    <li id="${opts.id}"
      class="${opts.cssClass}"
      data-spec="${opts.specId}"
      data-name="${opts.name}"
      data-browser="${opts.browserName}">
      ${opts.mark}
      ${itemBody}
      (${opts.duration} s)
      ${opts.reason}
      ${opts.failedUrl}
    </li>
  `
}

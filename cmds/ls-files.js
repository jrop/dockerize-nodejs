'use strict'

const co = require('co')
const npm = require('../lib/npm')
const path = require('path')

module.exports = co.wrap(function * main(/* argv */) {
	try {
		const files = yield npm.list(process.cwd())
		files.forEach(f => console.log(path.relative(process.cwd(), f)))  // eslint-disable-line no-console
	} catch (e) {
		console.error(e && e.stack ? e.stack : e)  // eslint-disable-line no-console
	}
})

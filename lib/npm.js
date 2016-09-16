'use strict'

const npmPkg = require('fstream-npm')

module.exports.list = path => new Promise((yes, no) => {
	const files = [ ]
	npmPkg({ path })
		.on('entry', f => files.push(f._path))
		.on('error', e => no(e))
		.on('end', () => yes(files))
})

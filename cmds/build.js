'use strict'

const child_process = require('child_process')
const co = require('co')
const fs = require('fs')
const fse = require('fs-extra')
const npm = require('../lib/npm')
const path = require('path')
const tmp = require('tmp')

function * spawn(cmd, args, cwd) {
	const cmdText = `${cmd} ${args.join(' ')}`

	console.log() // eslint-disable-line no-console
	console.log('>', cmdText) // eslint-disable-line no-console
	console.log() // eslint-disable-line no-console

	const proc = child_process.spawn(cmd, args, { cwd, stdio: 'inherit' })
	yield new Promise((yes, no) => {
		proc.on('close', code => {
			if (code == 0)
				return yes()

			const message = `Command failed: \`${cmdText}\``
			no(new Error(message))
		})
	})
}

//
// Create a container:
//
// This is actually not that complicated.  The steps it takes to create
// the container are as follows:
//
// 0) Run npm prepublish
// 1) Create a TMP directory
// 2) Copy the package files (from dockerize ls-files) into TMP/app
// 3) Copy node_modules to TMP/app/node_modules
// 4) Copy Dockerfile into TMP/
// 5) Run npm install --production in TMP/app
// 6) Run npm prune --production in TMP/app
// 7) Run docker build in the TMP directory
//
module.exports = co.wrap(function * (argv) {
	let tmpPath = ''
	let tmpCleanup = () => null
	try {
		// Run npm prepublish:
		const scripts = require(`${process.cwd()}/package.json`).scripts || { }
		if (scripts.prepublish)
			yield spawn('npm', [ 'run', 'prepublish' ], process.cwd())

		// create tmp directory:
		;[ tmpPath, tmpCleanup ] = yield done => tmp.dir({ unsafeCleanup: true }, done)

		// copy node_modules into it:
		yield done => fse.copy(`${process.cwd()}/node_modules/`, `${tmpPath}/app/node_modules/`, done)

		// copy package files into it:
		const files = yield npm.list(process.cwd())
		for (const file of files) {
			const fPath = path.relative(process.cwd(), file)
			yield done => fse.copy(file, `${tmpPath}/app/${fPath}`, done)
		}

		// copy Dockerfile into it:
		const dockerfile = (yield done => fs.readFile(`${__dirname}/../assets/Dockerfile`, 'utf-8', done))
			.replace('<<BASE>>', argv.base)
			.replace('<<ENVIRONMENT>>', argv.env.map(e => `ENV ${e}`).join('\n'))
		yield done => fs.writeFile(`${tmpPath}/Dockerfile`, dockerfile, 'utf-8', done)

		// Run some commands:
		yield spawn('npm', [ 'install', '--production' ], `${tmpPath}/app`)
		yield spawn('npm', [ 'prune', '--production' ], `${tmpPath}/app`)
		yield spawn('cat', [ 'Dockerfile' ], tmpPath)
		yield spawn('docker', [ 'build', '-t', argv.tag, '.' ], tmpPath)
	} catch (e) {
		console.error(e && e.stack ? e.stack : e) // eslint-disable-line no-console
		process.exitCode = 1
	} finally {
		tmpCleanup()
	}
})

module.exports.yargs = yargs => yargs
	.option('tag', {
		demand: true,
		alias: 't',
		describe: 'The docker tag',
		type: 'string',
	})
	.option('env', {
		alias: 'e',
		describe: 'Sets an environment variable in the container',
		default: [ ],
		type: 'array',
	})
	.option('base', {
		alias: 'i',
		describe: 'Sets the base image to build from',
		default: 'node',
		type: 'string',
	})

	.usage('$0 build --tag some/tag [options]')
	.example('$0 build -t my/tag -e NODE_ENV=production -e MY_ENV=some-value', 'Build with environment variables')
	.example('$0 build -t my/tag -i node:6.5.0-slim', 'Build from a different base image')

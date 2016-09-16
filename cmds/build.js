'use strict'

const child_process = require('child_process')
const co = require('co')
const fs = require('fs')
const fse = require('fs-extra')
const npm = require('../lib/npm')
const path = require('path')
const tmp = require('tmp')

function * spawn(cmd, args, cwd) {
	const proc = child_process.spawn(cmd, args, { cwd, stdio: 'inherit' })
	yield new Promise((yes, no) => {
		proc.on('close', code => {
			if (code == 0)
				return yes()

			const message = `Command failed: \`${cmd} ${args.join(' ')}\``
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
		// create tmp directory:
		[ tmpPath, tmpCleanup ] = yield done => tmp.dir({ unsafeCleanup: true }, done)

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
			.replace('<<ENVIRONMENT>>', argv.env)
		yield done => fs.writeFile(`${tmpPath}/Dockerfile`, dockerfile, 'utf-8', done)

		// Run some commands:
		yield spawn('npm', [ 'install', '--production' ], `${tmpPath}/app`)
		yield spawn('npm', [ 'prune', '--production' ], `${tmpPath}/app`)
		yield spawn('cat', [ 'Dockerfile' ], tmpPath)
		yield spawn('docker', [ 'build', '-t', argv.tag, '.' ], tmpPath)
	} catch (e) {
		console.error(e && e.stack ? e.stack : e)
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
			describe: 'Sets NODE_ENV in the container',
			default: process.env.NODE_ENV || 'development',
			type: 'string',
		})

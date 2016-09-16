'use strict'

require('colors')
const co = require('co')
const { exec } = require('child_process')
const inquirer = require('inquirer')

module.exports = co.wrap(function * (argv) {
	try {
		let [ lines ] = yield done => exec('docker images', done)
		lines = lines.split(/\r?\n/)

		const orphans = lines.slice(1)
			.filter(l => l.includes('<none>'))
		if (orphans.length == 0)
			return console.error('Nothing to do') // eslint-disable-line no-console
		for (const line of lines)
			console.log(line.includes('<none>') ? line.red : line) // eslint-disable-line no-console

		for (const orphan of orphans) {
			//
			// an orphan line looks something like this:
			// <none>                 <none>              097e509ebf46        10 minutes ago      654.2 MB
			//
			const imageId = orphan.split(/\s+/)[2]
			if (!argv.yes) { // need confirmation
				const response = yield inquirer.prompt([ {
					type: 'confirm',
					name: 'okay',
					message: `Confirm deletion of image: ${imageId}`,
					default: false,
				} ])
				if (!response.okay)
					continue // skip
			}

			yield done => exec(`docker rmi ${imageId}`, done)
			console.log(`Deleted ${imageId}`.red) // eslint-disable-line no-console
		}
	} catch (e) {
		console.error(e && e.stack ? e.stack : e) // eslint-disable-line no-console
	}
})

module.exports.yargs = yargs => yargs
	.option('yes', {
		alias: 'y',
		describe: 'Run in non-interactive mode',
		default: false,
		type: 'boolean',
	})
	.usage('$0 clean [--yes]')
	.example('$0 clean', 'Run in interactive mode')
	.example('$0 clean -y', 'Run in non-interactive mode')

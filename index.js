#!/usr/bin/env node
'use strict'

const yargs = require('yargs')

const args = yargs
	.command('build', 'Build a container', require('./cmds/build').yargs, require('./cmds/build'))
	.command('ls-files', 'List files in NPM package', { }, require('./cmds/ls-files'))

	.help('help').alias('help', 'h')
	.version('version', require('./package').version).alias('version', 'v')
	.demand(1)

	.usage('$0 [command] [options]')
	.example('$0 ls-files', 'List files that will be included in the container')
	.example('$0 build [options]', 'Build a dockerized version of your application')
	.argv

#!/usr/bin/env node
'use strict'

const yargs = require('yargs')

yargs
	.command('build', 'Build a container', require('./cmds/build').yargs, require('./cmds/build'))
	.command('clean', 'Clean up unused container images', require('./cmds/clean').yargs, require('./cmds/clean'))
	.command('ls-files', 'List files in NPM package', { }, require('./cmds/ls-files'))

	.help('help').alias('help', 'h')
	.version('version', require('./package').version).alias('version', 'v')
	.demand(1)

	.usage('$0 [command] [options]')
	.example('$0 build [options]', 'Build a dockerized version of your application')
	.example('$0 clean [--yes]', 'Clean up unused container images')
	.example('$0 ls-files', 'List files that will be included in the container')
	.argv

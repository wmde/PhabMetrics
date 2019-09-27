const fs = require('fs')
const createCanduit = require('canduit')
const moment = require('moment')
const qs = require('qs')
const args = require('yargs').argv
const { Parser } = require('json2csv')
const { createManiphestSearch } = require('../src/phabApi/maniphestSearch')
const calcLeadTime = require('../src/calcLeadTime')

const apiToken = args.api_token || process.env.CONDUIT_API_TOKEN

if (!apiToken) {
	console.error(`
		API token is required. Specify one through argument api_token
		or environment variable CONDUIT_API_TOKEN
	`);
	return
}

const canduit = createCanduit({
	api: 'https://phabricator.wikimedia.org/api/',
	token: apiToken
}, (error, canduit) => {
	if (error) {
		throw error
	}

	const maniphestSearchParams = getManiphestSearchParams()
	const maniphestSearch = createManiphestSearch(canduit)
	maniphestSearch.call(maniphestSearchParams)
		.then((results) => {
			return results.data.map(t => {
				const startTime = t.fields.dateCreated
				const endTime = t.fields.dateClosed
				return {
					id: `T${t.id}`,
					createdOn: moment.unix(startTime).format('YYYY-MM-DD HH:mm:ss'),
					closedOn: moment.unix(endTime).format('YYYY-MM-DD HH:mm:ss'),
					leadTime: calcLeadTime(startTime, endTime)
				}
			});
		})
		.then((tasksWithLeadTime) => {
			const fields = Object.keys(tasksWithLeadTime[0]);
			const opts = { fields };
			const parser = new Parser(opts);
			const csv = parser.parse(tasksWithLeadTime);
			const output = args.o || args.output || `${maniphestSearchParams.rangeStart.format()}-${maniphestSearchParams.rangeEnd.format()}.csv`;
			fs.writeFile(output, csv, err => {
				if (err) {
					console.error(`Error writing csv file ${output}`);
				} else {
					console.log(`Written csv ${output} succesfully`);
				}
			});
		})
		.catch(console.error)
})

function getManiphestSearchParams() {
	const statuses = [ 'resolved', 'declined' ]
	const projects = args.projects
		  ? (typeof args.projects === 'string') ? [ args.projects ] : args.projects
		  : []
	const subtypes = args.subtypes
		  ? (typeof args.subtypes === 'string') ? [ args.subtypes ] : args.subtypes
		  : []
	const { rangeStart, rangeEnd } = getRangeFromArgs()

	return {
		rangeStart,
		rangeEnd,
		statuses,
		projects,
		subtypes
	}
}

function getRangeFromArgs() {
	const range = {}

	const { fromDate, toDate } = args
	const week = args.w || args.week
	const month = args.m || args.month

	if (fromDate) {
		range.rangeStart = moment(args.fromDate)
		if (toDate) {
			range.rangeEnd = moment(args.toDate)
		} else {
			range.rangeEnd = rangeStart.clone()
		}
	} else if (week) {
		range.rangeStart = moment().week(week).startOf('week')
		range.rangeEnd = rangeStart.clone().endOf('week')
	} else if (month) {
		range.rangeStart = moment().month(month).startOf('month')
		range.rangeEnd = rangeStart.clone().endOf('month')
	}

	return range
}

const fs = require('fs')
const createCanduit = require('canduit')
const moment = require('moment')
const qs = require('qs')
const args = require('yargs').argv
const { Parser } = require('json2csv')
const { createManiphestSearch, EVENT_CLOSED } = require('../src/phabApi/maniphestSearch')

const apiBase = args.api_base || process.env.CONDUIT_API_BASE
const apiToken = args.api_token || process.env.CONDUIT_API_TOKEN

if (!apiBase) {
  console.error(`
    API base url is required. Specify one through argument api_base
    or environment variable CONDUIT_API_BASE
  `);
  return
}

if (!apiToken) {
  console.error(`
    API token is required. Specify one through argument api_token
    or environment variable CONDUIT_API_TOKEN
  `);
  return
}

const canduit = createCanduit({
  api: apiBase,
  token: apiToken
}, (error, canduit) => {
  if (error) {
    throw error
  }

  const maniphestSearchParams = getManiphestSearchParams()
  const maniphestSearch = createManiphestSearch(canduit)
  maniphestSearch.call(maniphestSearchParams)
    .then(results => {
      if (!results || !Array.isArray(results.data)) {
        return null
      }

      const aggregatedResults = {}
      const mapTaskToKey = getKeyMapper(getAggregationOption())

      results.data.forEach(t => {
        const key = mapTaskToKey(t)

        if (!(key in aggregatedResults)) {
          aggregatedResults[key] = 0
        }

        aggregatedResults[key] += 1
      });

      return aggregatedResults
    })
    .then(aggregatedResults => {
      if (!aggregatedResults) {
        return []
      }

      const keyFieldName = getKeyFieldName(getAggregationOption())
      const sortedResults = Object.keys(aggregatedResults).map(key => {
        return {
          [keyFieldName]: key,
          tasksClosed: aggregatedResults[key]
        }
      })

      sortedResults.sort((obj1, obj2) => {
        return obj1[keyFieldName] < obj2[keyFieldName] ? -1 : 1
      })

      return sortedResults
    })
    .then(sortedResults => {
      if (!Array.isArray(sortedResults) || !sortedResults.length) {
        console.log(`No tasks found.`);
        return
      }

      const fields = Object.keys(sortedResults[0]);
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(sortedResults);
      const output = args.o || args.output || `${getAggregationOption()}_throughput_${maniphestSearchParams.rangeStart.format()}-${maniphestSearchParams.rangeEnd.format()}.csv`;
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

function getKeyMapper(aggregationOption) {
  switch(aggregationOption) {
  case 'daily':
    return t => moment.unix(t.fields.dateClosed).format('YYYY-MM-DD')
  case 'weekly':
    return t => moment.unix(t.fields.dateClosed).format('YYYY ww')
  case 'monthly':
    return t => moment.unix(t.fields.dateClosed).format('YYYY-MM')
  }

  throw `unrecognized aggregation type '${aggregationOption}'`
}

function getKeyFieldName(aggregationOption) {
  switch(aggregationOption) {
  case 'daily':
    return 'day'
  case 'weekly':
    return 'week'
  case 'monthly':
    return 'month'
  }
}

function getAggregationOption() {
  if (args.daily) {
    return 'daily'
  } else if (args.weekly) {
    return 'weekly'
  } else if (args.monthly) {
    return 'monthly'
  }

  // default when nothing specified
  return 'daily'
}

function getManiphestSearchParams() {
  const statuses = [ 'resolved', 'declined' ]
  const projects = args.projects
      ? (typeof args.projects === 'string') ? [ args.projects ] : args.projects
      : []
  const subtypes = args.subtypes
      ? (typeof args.subtypes === 'string') ? [ args.subtypes ] : args.subtypes
      : []
  const { rangeStart, rangeEnd, rangeStartEvent, rangeEndEvent } = getRangeFromArgs()

  return {
    rangeStart,
    rangeEnd,
    rangeStartEvent,
    rangeEndEvent,
    statuses,
    projects,
    subtypes
  }
}

function getRangeFromArgs() {
  const range = {
    rangeStartEvent: EVENT_CLOSED,
    rangeEndEvent: EVENT_CLOSED
  }

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

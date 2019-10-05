const moment = require('moment')

const EVENT_CREATED = 'created'
const EVENT_UPDATED = 'updated'
const EVENT_CLOSED = 'closed'
const EVENT_TYPES = [ EVENT_CREATED, EVENT_UPDATED, EVENT_CLOSED]

function validateEvents(rangeStartEvent, rangeEndEvent) {
  const startEventIndex = EVENT_TYPES.indexOf(rangeStartEvent)
  const endEventIndex = EVENT_TYPES.indexOf(rangeEndEvent)

  if (startEventIndex === -1) {
    throw `rangeStartEvent '${rangeStartEvent}' is invalid. Options are ${EVENT_TYPES}`
  }

  if (endEventIndex === -1) {
    throw `rangeEndEvent '${rangeEndEvent}' is invalid. Options are ${EVENT_TYPES}`
  }

  if (endEventIndex < startEventIndex) {
    throw `invalid combination where rangeEndEvent '${rangeEndEvent}' happens before rangeStartEvent '${rangeStartEvent}'`
  }
}

function getRangeEvents({ rangeStartEvent, rangeEndEvent }) {
  rangeStartEvent = rangeStartEvent || EVENT_CREATED
  rangeEndEvent = rangeEndEvent || EVENT_CLOSED

  validateEvents(rangeStartEvent, rangeEndEvent)

  return { rangeStartEvent, rangeEndEvent }
}

class ManiphestSearch {
  get canduit() {
    return this._canduit
  }

  set canduit(value) {
    this._canduit = value
  }

  constructor(canduit) {
    this.canduit = canduit
  }

  call(params = {}) {
    let { statuses, projects, subtypes, rangeStart, rangeEnd } = params

    const { rangeStartEvent, rangeEndEvent } = getRangeEvents(params)
    if (!moment.isMoment(rangeStart)) {
      rangeStart = moment().startOf('week')
    } else {
      rangeStart.startOf('day')
    }

    if (!moment.isMoment(rangeEnd) || rangeEnd < rangeStart) {
      rangeEnd = rangeStart.clone().endOf('week')
    } else {
      rangeEnd.endOf('day')
    }

    return new Promise( (resolve, reject) => {
      const constraints = {
        [`${rangeStartEvent}Start`]: rangeStart.unix(),
        [`${rangeEndEvent}End`]: rangeEnd.unix()
      }

      if (Array.isArray(statuses) && statuses.length) {
      	constraints.statuses = statuses
      }
      if (Array.isArray(projects) && projects.length) {
      	constraints.projects = projects
      }
      if (Array.isArray(subtypes) && subtypes.length) {
      	constraints.subtypes = subtypes
      }

      this.canduit.exec('maniphest.search', { constraints }, (error, result) => {
        if (!result) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
}

const createManiphestSearch = function (canduit) {
  return new ManiphestSearch(canduit)
}

module.exports = {
  createManiphestSearch,
  ManiphestSearch,
  EVENT_CREATED,
  EVENT_UPDATED,
  EVENT_CLOSED
}

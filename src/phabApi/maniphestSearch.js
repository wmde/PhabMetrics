const moment = require('moment')

const EVENT_CREATED = 'created'
const EVENT_UPDATED = 'updated'
const EVENT_CLOSED = 'closed'
const EVENT_TYPES = [ EVENT_CLOSED, EVENT_UPDATED, EVENT_CREATED]

function isValidEvent(event) {
  return EVENT_TYPES.indexOf(event) > -1
}

function getRangeEvents({ rangeStartEvent, rangeEndEvent }) {
    rangeStartEvent = rangeStartEvent || EVENT_CREATED
    rangeEndEvent = rangeEndEvent || EVENT_CLOSED

    if (!isValidEvent(rangeStartEvent)) {
      throw `rangeStartEvent '${rangeStartEvent}' is invalid. Options are ${EVENT_TYPES}`
    }

    if (!isValidEvent(rangeEndEvent)) {
      throw `rangeEndEvent '${rangeEndEvent}' is invalid. Options are ${EVENT_TYPES}`
    }

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

  async call(params = {}) {
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

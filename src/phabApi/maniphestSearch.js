const moment = require('moment')

/**
 * Task creation event. Used as value to rangeStartEvent and rangeEndEvent
 * params to {@link ManiphestSearch#call}
 * @constant
 * @type {string}
*/
const EVENT_CREATED = 'created'

/**
 * Task update event. Used as value to rangeStartEvent and rangeEndEvent
 * params to {@link ManiphestSearch#call}
 * @constant
 * @type {string}
 */
const EVENT_UPDATED = 'updated'

/**
 * Task closing event. Used as value to rangeStartEvent and rangeEndEvent
 * params to {@link ManiphestSearch#call}
 * @constant
 * @type {string}
 */
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

	/**
	 * Calls phabricator endpoint to search for maniphest tasks
	 * @param {Object} params
	 * @param {string[]} [params.statuses] filter search for given statuses, if any given
	 * @param {string[]} [params.projects] filter search for given projects, if any given
	 * @param {string[]} [params.subtypes] filter search for given subtypes, if any given
	 * @param {moment}	 [rangeStart] 		 start of date range within which to search for tasks
	 * @param {string}	 [rangeStartEvent] the event the tasks need to have happened after date range start to be selected
	 * @param {moment}	 [rangeEnd] 			 end of date range within which to search for tasks
	 * @param {string}	 [rangeEndEvent] 	 the event the tasks need to have happened before date range end to be selected
	 * @return {Promise} Promise will resolve with result object from Canduit, or error on client, server or conduit errors
	 */
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

/**
 * @param {Object} canduit - {@link https://github.com/uber/canduit Canduit} instance
 */
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

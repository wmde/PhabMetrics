const moment = require('moment')

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
        createdStart: rangeStart.unix(),
        closedEnd: rangeEnd.unix()
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
  ManiphestSearch
}

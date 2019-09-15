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
    let { statuses, projects, subTypes, rangeStart, rangeEnd } = params

    if (typeof statuses !== 'array') {
      statuses = []
    }

    if (typeof projects !== 'array') {
      projects = []
    }

    if (typeof subTypes !== 'array') {
      subTypes = []
    }

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
        statuses,
        projects,
        subTypes,
        createdStart: rangeStart.unix(),
        closedEnd: rangeEnd.unix()
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


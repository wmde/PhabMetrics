const assert = require('chai').assert
const sinon = require('sinon')
const moment = require('moment')
const { createManiphestSearch, ManiphestSearch } = require('../../src/phabApi/maniphestSearch.js')

function getDefaultConstraints(now) {
  return {
    statuses: [],
    projects: [],
    subTypes: [],
    createdStart: moment(now).startOf('week').unix(),
    closedEnd: moment(now).endOf('week').unix()
  }
}

function getCanduitMock(
  execMock = sinon.mock('exec'),
  authenticateMock = sinon.mock('authenticate')
) {
  const canduit = {
    exec: execMock,
    authenticate: authenticateMock
  }

  return { canduit, execMock }
}

describe('maniphestSearch.js', () => {
  describe('createManiphestSearch', () => {
    it('creates maniphestSearch object', () => {
      const maniphestSearch = createManiphestSearch()
      assert.isOk(maniphestSearch instanceof ManiphestSearch)
    })
  })

  describe('ManiphestSearch', () => {
    describe('call', () => {
      let clock

      beforeEach(() => {
        clock = sinon.useFakeTimers()
      })

      afterEach(() => {
        clock.restore()
      })

      it('calls canduit with defaults when no params provided', () => {
        const expectedParamsToCanduit = { constraints: getDefaultConstraints(clock.Date.now()) }

        const { canduit, execMock } = getCanduitMock()
        execMock.once().withArgs('maniphest.search', expectedParamsToCanduit)

        createManiphestSearch(canduit).call()

        execMock.verify()
      })

      describe('adjusts rangeEnd to end of rangeStart week', () => {
        it('when rangeEnd is not supplied', () => {
          const rangeStart = moment('2050-09-06')
          const expectedRangeEnd = rangeStart.clone().endOf('week')
          const expectedParamsToCanduit = {
            constraints: {
              ...getDefaultConstraints(clock.Date.now()),
              createdStart: rangeStart.unix(),
              closedEnd: expectedRangeEnd.unix()
            }
          }

          const { canduit, execMock } = getCanduitMock()
          execMock.once().withArgs('maniphest.search', expectedParamsToCanduit)

          createManiphestSearch(canduit).call({ rangeStart })

          execMock.verify()
        })

        it('when rangeEnd is before rangeStart', () => {
          const rangeStart = moment('2050-09-06')
          const rangeEnd = moment('2050-09-05')
          const expectedRangeEnd = rangeStart.clone().endOf('week')
          const expectedParamsToCanduit = {
            constraints: {
              ...getDefaultConstraints(clock.Date.now()),
              createdStart: rangeStart.unix(),
              closedEnd: expectedRangeEnd.unix()
            }
          }

          const { canduit, execMock } = getCanduitMock()
          execMock.once().withArgs('maniphest.search', expectedParamsToCanduit)

          createManiphestSearch(canduit).call({ rangeStart, rangeEnd })

          execMock.verify()
        })
      })

      it('adjusts specified rangeStart and rangeEnd to day start and end respectively', () => {
        const rangeStart = moment('2050-09-06 12:15:15')
        const rangeEnd = moment('2050-09-06 04:50:50')
        const expectedRangeStart = rangeStart.clone().startOf('day')
        const expectedRangeEnd = rangeEnd.clone().endOf('day')
        const expectedParamsToCanduit = {
          constraints: {
            ...getDefaultConstraints(clock.Date.now()),
            createdStart: expectedRangeStart.unix(),
            closedEnd: expectedRangeEnd.unix()
          }
        }

        const { canduit, execMock } = getCanduitMock()
        execMock.once().withArgs('maniphest.search', expectedParamsToCanduit)

        createManiphestSearch(canduit).call({ rangeStart, rangeEnd })

        execMock.verify()
      })

      it('returns results when search does not error', (done) => {
      	const canduitExecFake = sinon.stub().callsFake((endpoint, params, callback) => {
      		callback(false, true)
      	})
        const { canduit } = getCanduitMock(canduitExecFake)

        createManiphestSearch(canduit).call().then(() => { done() })
      })

      it('throws when search errors', (done) => {
      	const canduitExecFake = sinon.stub().callsFake((endpoint, params, callback) => {
      		callback(true)
      	})
        const { canduit } = getCanduitMock(canduitExecFake)

        createManiphestSearch(canduit).call().catch(() => { done() })
      })
    })
  })
})

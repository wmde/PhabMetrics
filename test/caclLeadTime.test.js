const assert = require('chai').assert
const calcLeadTime = require('../src/calcLeadTime')

describe('calcLeadTime', () => {
	it('throws if workInDays is bigger than 7', () => {
		assert.throws(() => {
			calcLeadTime(100, 200, 8)
		})
	})

	it('throws if endTime is less than startTime', () => {
		assert.throws(() => {
			calcLeadTime(200, 100)
		})
	})

	describe('calculates correct lead time in working days', () => {
		it('when using default, 5 working days per week', () => {
			const startTime = new Date('2019-01-01 00:00:00').getTime() / 1000
			const endTime = new Date('2019-01-21 23:59:59').getTime() / 1000

			assert.equal(15, calcLeadTime(startTime, endTime))
		})

		it('when using different value for working days per week', () => {
			const startTime = new Date('2019-01-01 00:00:00').getTime() / 1000
			const endTime = new Date('2019-01-21 23:59:59').getTime() / 1000

			assert.equal(21, calcLeadTime(startTime, endTime, 7))
		})
	})
})

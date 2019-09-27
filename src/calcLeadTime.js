const SECONDS_PER_DAY = 24 * 60 * 60;

/**
 * Calculates lead time of a task in working days.
 * @param  {int} startTime       unix-timestamp of task start
 * @param  {int} endTime         unix-timestamp of task end
 * @param  {Number} workDaysPerWeek
 * @return {Number}              lead time in days
 */
module.exports = (startTime, endTime, workDaysPerWeek = 5) => {
	if (workDaysPerWeek > 7) {
		throw 'workDaysPerWeek cannot be bigger than 7'
	}

	if (endTime < startTime) {
		throw 'endTime cannot be less than startTime'
	}

	const leadTimeInSeconds = endTime - startTime
	const leadTimeInDays = leadTimeInSeconds / SECONDS_PER_DAY
	const leadTimeInWorkingDays = leadTimeInDays * workDaysPerWeek / 7

	return Math.ceil(leadTimeInWorkingDays)
}

const moment = require('moment')

class DateUtil {

    static padZero = (n) => { return n < 10 ? '0' + n : '' + n; }
    monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


    /**
     * Return current string date. Default output is in DD/MM/YYYY
     * @param {String} [outputFormat = 'DD/MM/YYYY'] - format of output date. eg. 'DD MMMM YYYY', 
     */
    static getDate(outputFormat = 'DD/MM/YYYY') {
        return moment().format(outputFormat)
    }

    static getMonth(outputFormat = 'MM') {
        return moment().format(outputFormat) 
    }

    static getYear(outputFormat = 'YYYY') {
        return moment().format(outputFormat) 
    }


    /**
     * Return current date in ISOString format
     * @param {Boolean} [useUTCTime = false] - false = use local time; true = convert time to UTC 
     * @param {Boolean} [includeTimeZone = false] - false = strip the timezone; true = retain the timezone
     * @returns 
     */
    static getDateISOString(useUTCTime = false, includeTimeZone = false) {
        if (includeTimeZone) return moment().toISOString(!useUTCTime)
        else return moment().toISOString(!useUTCTime).split('+')[0]
    }


    /**
     * Get the string date of Xdays before or after current date. Default output is in DD/MM/YYYY
     * @param {Number} dateDiff - number of days from today; can also be a negative number to move to days prior today 
     * @param {String} [outputFormat = 'DD/MM/YYYY'] - format of output date. eg. 'DD MMMM YYYY'
     */
    static getDateFromToday(dateDiff, outputFormat = 'DD/MM/YYYY') {
        return moment().add(dateDiff, 'days').format(outputFormat)
    }


    /**
     * Get the string date of X-months before/after current month. Default outpu is in DD/MM/YYYY
     * @param {Number} monthDiff -number of months from current month; can be positive or negative number to indicate months prior or future month
     * @param {String} [outputFormat = 'DD/MM/YYYY'] - format of output date. eg. 'DD MMMM YYYY'
     * @returns 
     */
    static getMonthsFromToday(monthDiff, outputFormat = 'DD/MM/YYYY') {
        return moment().add(monthDiff, 'months').format(outputFormat)
    }


    /**
     * Add/Subtract hours, minutes, seconds from current time. Default outpu is in HH:mm:ss
     * @param {Number} monthDiff -number of hours/minutes/seconds from current time; can be positive or negative number to indicate time prior or future time
     * @param {String} [timeUnit = 'hours'] - can be 'hours', 'minutes', or 'seconds'
     * @param {String} [outputFormat = 'HH:mm:ss'] - format of output date. eg. 'HH:mm:ss'
     * @returns 
     */
     static getTimeFromNow(timeDiff, timeUnit = 'hours', outputFormat = 'HH:mm:ss') {
        return moment().add(timeDiff, timeUnit).format(outputFormat)
    }


    /**
     * Retrun current time in HH:mm:ss format
     * @param {String} [outputFormat = 'HH:mm:ss'] - format of output time. eg. 'HH:mm:ss'
     */
    static getTime(outputFormat = 'HH:mm:ss') {
        return moment().format(outputFormat)
    }


    /**
     * return current hour HH
     * @param {String} [outputFormat = 'HH'] - format of output time. eg. 'HH'
     */
    static getHours(outputFormat = 'HH') {
        return moment().format(outputFormat)
    }


    /**
     * return current minutes mm
     * @param {String} [outputFormat = 'mm'] - format of output time. eg. 'mm'
     */
    static getMinutes(outputFormat = 'mm') {
        return moment().format(outputFormat)
    }


    /**
     * Return the short month name
     * @param {Number} intMonth - 1=Jan, 2=Feb etc
     */
    static getMonthShort(intMonth) {
        return this.monthsShort[intMonth - 1]
    }


    /**
     * Retrun the long month name
     * @param {Number} intMonth - 1=January, 2=February etc
     */
    static getMonthLong(intMonth) {
        return this.monthsLong[intMonth - 1]
    }


    /**
     * Format a string date
     * @param {*} strDate - date in string format
     * @param {*} strDateFormat - format of strDate. eg 'DD/MM/YYYY hh:mm:ss A'
     * @param {*} outputFormat - format of string date to return. eg. 'DD/MMMM/YYYY hh:mm:ss A'
     */
    static formatDate(strDate, strDateFormat, outputFormat) {
        return moment(strDate, strDateFormat).format(outputFormat)
    }


    /**
     * return duration in HH:MM:SS format
     * @param {Number} nanoseconds 
     * @returns 
     */
    static formatDuration(nanoseconds) {
        let seconds = nanoseconds / 1000000000
        let elapsed = moment().startOf("day").add(seconds, 'seconds')
        return (elapsed.format('HH:mm:ss'))
    }


    static formatDateUS(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleString('en-US', options);
    }


    /**
     * get the day of a date
     * @param {String} [year] - YYYY 
     * @param {String} [month] -MM - 01=Jan, 02=Feb etc 
     * @param {String} [date] -DD 
     * @param {String} [outputFormat = 'number'] - format of number. eg. 0 = Sunday, 1 = Monday etc. - format of text. e.g. Monday, Tuesday, Wednesday etc.
     */
    static getDayOfDate(year, month, date, outputFormat = 'number') {
        const dateString = year + '-' + month + '-' + date;
        const dateMoment = moment(dateString);
        const dow = dateMoment.day();

        if (outputFormat === 'number') {
            return dow;
        } else if (outputFormat === 'text') {
            switch (dow) {
                case 0 :
                    return 'Sunday'
                case 1:
                    return 'Monday'
                case 2 :
                    return 'Tuesday'
                case 3 :
                    return 'Wednesday'
                case 4 :
                    return 'Thursday'
                case 5 :
                    return 'Friday'
                case 6 :
                    return 'Saturday'
            }
        } else {
            throw Error('Please specify a valid output format')
        }
    }


    static getDayOfMonth(){
        const today = new Date(); // Get the current date
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = daysOfWeek[today.getDay()];
        
        // Get the day of the month
        const dayOfMonth = today.getDate();
        
        // Calculate the week number as a string (first, second, etc.)
        const weekNames = ['first', 'second', 'third', 'fourth', 'fifth']; // Adjust if the month has 5 weeks
        const weekOfMonthIndex = Math.ceil(dayOfMonth / 7) - 1;
        const weekOfMonth = weekNames[weekOfMonthIndex] || 'fifth';
        
        return `Monthly on ${weekOfMonth} ${dayOfWeek}`;
    }
    
}
module.exports = DateUtil;
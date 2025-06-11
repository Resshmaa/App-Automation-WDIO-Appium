const Log = require('./Log')

/**
 * Utility class for interacting with web elements using WebdriverIO
 */

class ElementUtil {

    /**
     * Finds an element using a selector
     * @param {string} locator - The selector used to locate the element
     * @param {string} description - Description of the element for logging purpose
     * @returns {Promise<WebdriverIO.Element>} The found element
     */
    static async findElement(locator, description) {
        Log.info(`Looking for ${description}`)
        return await browser.$(locator)
    }


    /**
     * Performs a mouse hover on the element
     * @param {WebdriverIO.Element} element - Element to hover over
     * @param {string} description - Description for logging the action
     */
    static async mouseHover(element, description) {
        Log.info(`Hovering over ${description}`)
        await element.moveTo()
    }


    /**
     * Clicks the given element
     * @param {WebdriverIO.Element} element - Element to be clicked
     * @param {string} description - Description of the element for logging purpose
     */
    static async click(element, description) {
        Log.info(`Clicking on ${description}`)
        await element.click()
    }


    /**
     * Double-clicks the element
     * @param {WebdriverIO.Element} element - Element to double click
     * @param {string} description - Description of the element for logging purpose
     */
    static async doubleClick(element, description) {
        Log.info(`Double clicking on ${description}`)
        await element.doubleClick()
    }


    /**
     * Right-clicks the element
     * @param {WebdriverIO.Element} element - Element to right click
     */
    static async rightClick(element) {
        Log.info(`Doing a right-click on the element`)
        await element.click({ button: 'right' })
    }


    /**
     * Sends text to an input field, replacing any existing content.
     * @param {WebdriverIO.Element} element - Input element to send text to
     * @param {string} value - Text to send into the input field
     */
    static async sendText(element, value) {
        Log.info(`Sending text '${value}' to the input field`)
        await element.setValue(value)
    }


    /**
     * Adds a value to an input field, appending to any existing content.
     * @param {WebdriverIO.Element} element - Input element to add value to
     * @param {string} value - Value to add into the input field
     */
    static async addValue(element, value) {
        Log.info(`Adding value '${value}' to the input field`)
        await element.addValue(value)
    }


    /**
     * Clears the value from an input field
     * @param {WebdriverIO.Element} element - Input element to clear the value from
     */
    static async clearValue(element) {
        Log.info(`Clearing value from the input field`)
        await element.clearValue()
    }


    /**
     * Retrieves the text content of an element
     * @param {WebdriverIO.Element} element - Element to retrieve text from
     * @returns {Promise<string>} The text content of the element
     */
    static async getText(element) {
        Log.info(`Getting text from the element`)
        return await element.getText()
    }


    /**
     * Gets an attribute value from the element
     * @param {WebdriverIO.Element} element - Element to get the attribute from
     * @param {string} attribute - Name of the attribute to retrieve
     * @returns {Promise<string>} The attribute value
     */
    static async getAttribute(element, attribute) {
        Log.info(`Getting attribute '${attribute}' from the element`)
        return await element.getAttribute(attribute)
    }


    /**
     * Gets the current value of an input field
     * @param {WebdriverIO.Element} element - Input element to get the value from
     * @returns {Promise<string>} The current value of the input field
     */
    static async getValue(element) {
        Log.info(`Getting current value of the input field`)
        return await element.getValue()
    }


    /**
     * Gets the tag name of the element
     * @param {WebdriverIO.Element} element - Element to get the tag name from
     * @returns {Promise<string>} The tag name of the element
     */
    static async getTagName(element) {
        Log.info(`Fetching tag name of the element`)
        return await element.getTagName()
    }


    /**
     * Drags the source element and drops it on the target element
     * @param {WebdriverIO.Element} source - Element to drag
     * @param {WebdriverIO.Element} target - Element to drop onto
     */
    static async dragAndDrop(source, target) {
        Log.info(`Dragging the source element and dropping it on the target`)
        await source.dragAndDrop(target)
    }


    /**
     * Checks if an element is clickable
     * @param {WebdriverIO.Element} element - Element to check clickability
     * @returns {Promise<boolean>} True if clickable, otherwise false
     */
    static async isClickable(element) {
        Log.info(`Checking if the element is clickable`)
        return await element.isClickable()
    }


    /**
     * Checks if an element is displayed
     * @param {WebdriverIO.Element} element - Element to check visibility
     * @returns {Promise<boolean>} True if displayed, otherwise false
     */
    static async isDisplayed(element) {
        Log.info(`Checking if the element is visible on the page`)
        return await element.isDisplayed()
    }


    /**
     * Checks if an element is enabled
     * @param {WebdriverIO.Element} element - Element to check if enabled
     * @returns {Promise<boolean>} True if enabled, otherwise false
     */
    static async isEnabled(element) {
        Log.info(`Checking if the element is enabled`)
        return await element.isEnabled()
    }


    /**
     * Checks if an element exists in the DOM
     * @param {WebdriverIO.Element} element - Element to check existence
     * @returns {Promise<boolean>} True if exists, otherwise false
     */
    static async isExisting(element) {
        Log.info(`Checking if the element exists in the DOM`)
        return await element.isExisting()
    }


    /**
     * Compares two elements to check if they are the same
     * @param {WebdriverIO.Element} el1 - First element to compare
     * @param {WebdriverIO.Element} el2 - Second element to compare
     * @returns {Promise<boolean>} True if both elements are equal
     */
    static async isEqual(el1, el2) {
        Log.info(`Comparing two elements to check if they are the same`)
        return el1.elementId === el2.elementId
    }


    /**
     * Checks if an element is selected
     * @param {WebdriverIO.Element} element - Element to check selection status
     * @returns {Promise<boolean>} True if selected, otherwise false
     */
    static async isSelected(element) {
        Log.info(`Checking if the element is selected`)
        return await element.isSelected()
    }


    /**
     * Scrolls an element into view
     * @param {WebdriverIO.Element} element - Element to scroll into view
     */
    static async scrollIntoView(element) {
        Log.info(`Scrolling the element into view`)
        await element.scrollIntoView()
    }


    /**
     * Selects an option from dropdown by attribute value
     * @param {WebdriverIO.Element} element - Select element to choose option from
     * @param {string} attribute - Attribute to match the option
     * @param {string} value - Value of the attribute to select
     */
    static async selectByAttribute(element, attribute, value) {
        Log.info(`Selecting option from dropdown by ${attribute} = '${value}'`)
        await element.selectByAttribute(attribute, value)
    }


    /**
     * Selects an option by index
     * @param {WebdriverIO.Element} element - Select element to choose option from
     * @param {number} index - Index of the option to select
     */
    static async selectByIndex(element, index) {
        Log.info(`Selecting option number ${index} from the dropdown`)
        await element.selectByIndex(index)
    }


    /**
     * Selects an option by visible text
     * @param {WebdriverIO.Element} element - Select element to choose option from
     * @param {string} text - Visible text of the option to select
     */
    static async selectByVisibleText(element, text) {
        Log.info(`Selecting option with visible text '${text}' from the dropdown`)
        await element.selectByVisibleText(text)
    }


    /**
     * Wait until an element is displayed
     * @param {WebdriverIO.Element} element element we want to wait to become displayed
     * @param {number} waitTimeInSeconds wait timeout in seconds
     * @param {string} description description of the element
     * @param {boolean} reverse if true it waits for the opposite - Not exist (default: false)
     */
    static async waitForDisplayed(element, waitTimeInSeconds, description, reverse = false) {
        if (reverse) {
            Log.info("Waiting for '" + description + "' to be not displayed within " + waitTimeInSeconds + " seconds")
        }
        else {
            Log.info("Waiting for '" + description + "' to be displayed within " + waitTimeInSeconds + " seconds")
        }
        await element.waitForDisplayed({ timeout: waitTimeInSeconds * 1000 }, reverse);
    }


    /**
     * Wait until an element is clickable
     * @param {WebdriverIO.Element} element element we want to wait to become clickable
     * @param {number} waitTimeInSeconds wait timeout in seconds 
     * @param {string} description description of the element
     * @param {boolean} reverse if true it waits for the opposite - Not exist (default: false)
     */
    static async waitForClickable(element, waitTimeInSeconds, description, reverse = false) {
        if (reverse) {
            Log.info("Waiting for '" + description + "' to be not clickable within " + waitTimeInSeconds + " seconds")
        }
        else {
            Log.info("Waiting for '" + description + "' to be clickable within " + waitTimeInSeconds + " seconds")
        }
        await element.waitForClickable({ timeout: waitTimeInSeconds * 1000 }, reverse);
    }


    /**
     * Wait until an element exist
     * @param {WebdriverIO.Element} element element we want to wait to exist
     * @param {number} waitTimeInSeconds wait timeout in seconds
     * @param {string} description description of the element
     * @param {boolean} reverse if true it waits for the opposite - Not exist (default: false)
     */
    static async waitForExist(element, waitTimeInSeconds, description, reverse = false) {
        if (reverse) {
            Log.info("Waiting for '" + description + "' to not exist within " + waitTimeInSeconds + " seconds")
        }
        else {
            Log.info("Waiting for '" + description + "' to exist within " + waitTimeInSeconds + " seconds")
        }
        await element.waitForExist({ timeout: waitTimeInSeconds * 1000, reverse });
    }


    /**
     * Wait until an element is enabled
     * @param {WebdriverIO.Element} element element we want to wait to be enabled
     * @param {number} waitTimeInSeconds wait timeout in seconds
     * @param {string} description description of the element
     * @param {boolean} reverse if true it waits for the opposite - Not exist (default: false)
     */
    static async waitForEnabled(element, waitTimeInSeconds, description, reverse = false) {
        if (reverse) {
            Log.info("Waiting for '" + description + "' to not be enabled within " + waitTimeInSeconds + " seconds")
        }
        else {
            Log.info("Waiting for '" + description + "' to be enabled within " + waitTimeInSeconds + " seconds")
        }
        await element.waitForEnabled({ timeout: waitTimeInSeconds * 1000, reverse });
    }
}

module.exports = ElementUtil;

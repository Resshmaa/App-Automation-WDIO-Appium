const Log = require('./Log')
const fs = require('fs')


/**
 * Utility class for interacting with browser using WebdriverIO
 */

class BrowserUtil {

    /////////////////////////////////////////////
    // BROWSER NAVIGATION HELPERS
    /////////////////////////////////////////////

    /**
       * Navigates to a URL
       * @param {string} url - URL to navigate to
       * @param {string} description - Description of the action for logging
       */
    static async browseUrl(url, description) {
        Log.info(`Navigating to URL: ${description}`)
        await browser.url(url)
    }


    /**
     * Get the current URL of the browser.
     * @returns {Promise<string>} - The current page URL.
     */
    static async getUrl() {
        const url = await browser.getUrl();
        Log.info(`Current URL: ${url}`);
        return url;
    }


    /**
     * Go one step back in browser history.
     * @returns {Promise<void>}
     */
    static async back() {
        Log.info('Navigating back in browser history');
        await browser.back();
    }


    /**
     * Go one step forward in browser history.
     * @returns {Promise<void>}
     */
    static async forward() {
        Log.info('Navigating forward in browser history');
        await browser.forward();
    }


    /**
     * Refresh the current page.
     * @returns {Promise<void>}
     */
    static async refresh() {
        Log.info('Refreshing the current page');
        await browser.refresh();
    }


    /**
     * Get the title of the current page.
     * @returns {Promise<string>} - The page title.
     */
    static async getTitle() {
        const title = await browser.getTitle();
        Log.info(`Current page title: ${title}`);
        return title;
    }


    /**
     * Close the current browser window.
     * @returns {Promise<void>}
     */
    static async closeWindow() {
        Log.info('Closing the current browser window');
        await browser.closeWindow();
    }


    /**
     * Create a new browser window or tab.
     * @param {string} type - "tab" or "window".
     * @returns {Promise<Object>} - The new window object with handle and type.
     */
    static async createWindow(type) {
        Log.info(`Creating a new browser ${type}`);
        return await browser.createWindow(type);
    }


    /**
     * Maximize the current browser window.
     * @returns {Promise<Object>} - Window size and position.
     */
    static async maximizeWindow() {
        Log.info('Maximizing the current browser window');
        return await browser.maximizeWindow();
    }


    /**
     * Minimize the current browser window.
     * @returns {Promise<Object>} - Window size and position.
     */
    static async minimizeWindow() {
        Log.info('Minimizing the current browser window');
        return await browser.minimizeWindow();
    }


    /**
     * Scroll the browser viewport by the specified offsets.
     * Coordinates are relative to current scroll position.
     * @param {number} [x=0] - Horizontal scroll offset.
     * @param {number} [y=0] - Vertical scroll offset.
     * @returns {Promise<void>}
     */
    static async scroll(x = 0, y = 0) {
        Log.info(`Scrolling viewport by x: ${x}, y: ${y}`);
        await browser.execute((scrollX, scrollY) => window.scrollBy(scrollX, scrollY), x, y);
        Log.info('Scroll completed.');
    }



    /////////////////////////////////////////////
    // BROWSER WAIT HELPERS
    /////////////////////////////////////////////


    /**
        Wait a given number of seconds
        @param {int} seconds for which we want script to wait
        */
    static async wait(seconds) {
        Log.info(`Waiting for '${seconds.toString()} seconds'`);
        await browser.pause(seconds * 1000);
    }



    /**
     * Wait until condition is satified
     * @param {*} condition - A function. Evaluates to true or false. 
     * @param {*} timeOut - time (Seconds) to wait for condition to be true
     * @param {*} timeOutMessage - Message to display when timeout is reached
     * @param {*} description - description of the condition we are waiting for
     * @param {*} [interval=500] - value in milliseconds, time interval between condition checks
     */
    static async waitUntil(condition, timeOut, timeOutMessage, description, timeInterval = 500) {
        Log.info(`Waiting for condition: ${description}`)
        await browser.waitUntil(
            condition,
            {
                timeout: timeOut * 1000,
                timeoutMsg: timeOutMessage,
                interval: timeInterval
            }
        );
    }



    /////////////////////////////////////////////
    // BROWSER TAB & WINDOW HELPERS
    /////////////////////////////////////////////

    static #TABS = {};

    static get tabs() {
        return this.#TABS;
    }


    static get tabCount() {
        return Object.keys(this.#TABS).length
    }


    /**
     * Resets the browser to a clean, empty state.
     * Note that this does not undo a maximize
     */
    static async reset() {
        Log.info("Resetting browser to initial state");

        // Iterate through all tabs but the first and close them,
        // then switch back to the first tab and put it in the 
        // intial "Data" state
        const handles = await browser.getWindowHandles();
        for (var i = 1; i < handles.length; i++) {
            await browser.switchToWindow(handles[i]);
            await browser.closeWindow();
        }
        await browser.switchToWindow(handles[0]);
        await browser.url("Data:,");

        // Clear managed tabs 
        this.#TABS = {};
    }


    /**
     * Opens a new managed tab
     * @param {TabDefinition} tabDefinition A predefined tab definition 
     */
    static async openTab(tabDefinition) {
        var name = await tabDefinition.name;
        var entryUrl = await tabDefinition.entryUrl;

        // Make sure a tab with this name doesn't already exist
        if (this.#TABS[name] != null)
            throw new Error('A tab with this name already exists!');

        // Nr of tabs that already exist
        var tabCount = this.tabCount;

        // If we haven't opened a tab yet we use the initial "Data" tab for our first tab
        // Otherwise we actually open a new browser tab. Note that we use a workaround for the 
        // third and up tab as newWindow will not open more than 2 tabs.
        // In all cases the windowHandle is stored on the tab object itself
        Log.info(`Opening tab Nr ${tabCount + 1} named "${name}" to url: "${entryUrl}"`);
        if (tabCount == 0) {
            await browser.navigateTo(entryUrl);
            tabDefinition.windowHandle = await browser.getWindowHandle();
        }
        else if (tabCount == 1) {
            await browser.newWindow(entryUrl);
            tabDefinition.windowHandle = await browser.getWindowHandle();
        }
        else {
            tabDefinition.windowHandle = await browser.createWindow("tab").handle;
            await browser.switchToWindow(tabDefinition.windowHandle);
            await browser.navigateTo(entryUrl);
        }

        // Add the tab to our managed tabs
        this.#TABS[name] = tabDefinition;
    }


    /**
     * Switches to a managed tab and returns it
     * @param {string} name The name of the tab to switch to
     */
    static async switchToTab(name) {
        // Make sure a tab with this name exists
        if (this.#TABS[name] == null)
            throw new Error('A tab with this name does not exist!');

        // Compare the current window handle to the managed tabs window handle
        // Only if they differ do we need to actually switch
        var currentHandle = await browser.getWindowHandle();
        var newHandle = await this.#TABS[name].windowHandle;
        if (currentHandle != newHandle) {
            Log.info(`Switching to tab named "${name}"`)
            await browser.switchToWindow(newHandle);
        }
    }


    /**
     * Switches to a managed tab and returns it
     * @param {string} name The name of the tab to switch to
     */
    static async switchAndGetTab(name) {
        await this.switchToTab(name);
        return await this.#TABS[name];
    }


    /**
     * Retrieves a managed tab by name
     * @param {string} name Name of the managed tab 
     */
    static async getTab(name) {
        // Make sure a tab with this name exists
        if (await this.#TABS[name] == null)
            throw new Error('A tab with this name does not exist!');

        return await this.#TABS[name];
    }


    /**
     * Refresh tab
     * @param {tabname} tabName Name of the tab to retrieve refresh. Defaults to current tab
     */
    static async refreshTab(tabName = null) {
        if (tabName == null)
            Log.info("Refreshing current tab");
        else {
            Log.info(`Refreshing tab named ${tabName}`);
            await this.switchToTab(tabName);
        }
        await browser.refresh();
    }


    /**
    Retrieve url of tab
    @param {string} tabName Name of the tab to retrieve url from. Defaults to current tab
    */
    static async getTabUrl(tabName = null) {
        if (tabName == null)
            Log.info("Getting url of current tab");
        else {
            Log.info(`Getting url of tab named ${tabName}`);
            await this.switchToTab(tabName);
        }
        return await browser.getUrl();
    }


    /**
     * Retrieve title of tab
     * @param {string} tabName Name of the tab to retrieve title of. Defaults to current tab
     */
    static async getTabTitle(tabName = null) {
        if (tabName == null)
            Log.info("Getting title of current tab.");
        else {
            Log.info(`Getting title of tab named ${tabName}`);
            await this.switchToTab(tabName);
        }
        return await browser.getTitle();
    }



    /////////////////////////////////////////////
    // BROWSER FILE UPLOAD / DOWNLOAD HELPERS
    /////////////////////////////////////////////


    /**
    * Takes a screenshot of the entire viewport and saves it to a file.
    * @param {string} filePath - Path to save the screenshot (e.g., './screenshots/full.png')
    */
    static async takeScreenshot(filePath) {
        Log.info(`Taking full viewport screenshot and saving to ${filePath}`);
        const screenshotBase64 = await browser.takeScreenshot();
        fs.writeFileSync(filePath, screenshotBase64, 'base64');
    }


    /**
     * Takes a screenshot of a specific element and saves it to a file.
     * @param {string} elementId - The element ID to capture
     * @param {string} filePath - Path to save the screenshot (e.g., './screenshots/element.png')
     * @param {boolean} [scroll=true] - Whether to scroll element into view before capturing
     */

    static async takeElementScreenshot(elementId, filePath, scroll = true) {
        Log.info(`Taking screenshot of element ${selector}, scroll=${scroll} and saving to ${filePath}`);
        if (scroll) {
            await elementId.scrollIntoView();
        }
        const screenshotBase64 = await browser.takeElementScreenshot(elementId, scroll);
        fs.writeFileSync(filePath, screenshotBase64, 'base64');
    }
    

    /**
   * Download a file from the remote Selenium node to the local machine.
   * Note: Requires Selenium Grid with Chrome, Edge, or Firefox and se:downloadsEnabled flag set.
   * @param {string} fileName - Remote path to the file on Selenium node.
   * @param {string} targetDirectory - Local directory to save the downloaded file.
   * @returns {Promise<string>} - The local path where the file was saved.
   */
    static async downloadFile(fileName, targetDirectory) {
        Log.info(`Downloading file from remote path: ${fileName} to local directory: ${targetDirectory}`);
        const localPath = await browser.downloadFile(fileName, targetDirectory);
        Log.info(`File downloaded successfully to: ${localPath}`);
        return localPath;
    }


    /**
     * Save the current page as a PDF file on the local file system.
     * @param {string} filepath - Path to save the PDF file (must end with .pdf).
     * @param {Object} [options] - Optional PDF print options.
     * @param {string} [options.orientation] - PDF page orientation.
     * @param {number} [options.scale] - PDF scale.
     * @param {boolean} [options.background] - Include background graphics.
     * @param {number} [options.width] - PDF page width.
     * @param {number} [options.height] - PDF page height.
     * @param {number} [options.top] - Top padding.
     * @param {number} [options.bottom] - Bottom padding.
     * @param {number} [options.left] - Left padding.
     * @param {number} [options.right] - Right padding.
     * @param {boolean} [options.shrinkToFit] - Shrink content to fit page.
     * @param {Object[]} [options.pageRanges] - Pages to include in PDF.
     * @returns {Promise<Buffer>} - PDF file buffer.
     */
    static async savePDF(filepath, options = {}) {
        Log.info(`Saving current page as PDF to: ${filepath} with options: ${JSON.stringify(options)}`);
        const pdfBuffer = await browser.savePDF(filepath, options);
        Log.info('PDF saved successfully.');
        return pdfBuffer;
    }


    /**
     * Upload a file to the Selenium server or browser driver.
     * Note: Supported only in Selenium Grid with Chrome or Edge drivers.
     * @param {string} localPath - Local file path to upload.
     * @returns {Promise<string>} - The remote path on Selenium node or browser driver.
    */
    static async uploadFile(localPath) {
        Log.info(`Uploading file from local path: ${localPath}`);
        const remotePath = await browser.uploadFile(localPath);
        Log.info(`File uploaded successfully to remote path: ${remotePath}`);
        return remotePath;
    }



    /////////////////////////////////////////////
    // BROWSER SWITCHING TO FRAME & WINDOW HELPERS
    /////////////////////////////////////////////


    /**
   * Get the window handle for the current top-level browsing context.
   * @returns {Promise<string>} The window handle string.
   */
    static async getWindowHandle() {
        const handle = await browser.getWindowHandle();
        Log.info(`Current window handle: ${handle}`);
        return handle;
    }


    /**
     * Switch to a window by its handle.
     * @param {string} handle - The window handle to switch to.
     * @returns {Promise<void>}
     */
    static async switchToWindow(handle) {
        Log.info(`Switching to window with handle: ${handle}`);
        await browser.switchToWindow(handle);
    }


    /**
     * Get a list of all open window handles.
     * @returns {Promise<string[]>} Array of window handle strings.
     */
    static async getWindowHandles() {
        const handles = await browser.getWindowHandles();
        Log.info(`Available window handles: ${handles.join(', ')}`);
        return handles;
    }


    /**
     * Switch to a frame by its id, index, or element.
     * @param {number | object | null} id - The frame identifier (index, element, or null for top-level).
     * @returns {Promise<void>}
     */
    static async switchToFrame(id) {
        Log.info(`Switching to frame: ${id === null ? 'top-level frame' : JSON.stringify(id)}`);
        await browser.switchToFrame(id);
    }


    /**
     * Switch to the parent frame of the current browsing context.
     * @returns {Promise<void>}
     */
    static async switchToParentFrame() {
        Log.info('Switching to parent frame');
        await browser.switchToParentFrame();
    }



    /////////////////////////////////////////////
    // BROWSER ALERT HELPERS
    /////////////////////////////////////////////


    /**
       * Dismisses the alert popup if present.
       */
    static async dismissAlert() {
        Log.info("Dismissing alert prompt");
        await browser.dismissAlert();
    }


    /**
     * Accepts the alert popup if present.
     */
    static async acceptAlert() {
        Log.info("Accepting alert prompt");
        await browser.acceptAlert();
    }


    /**
     * Retrieves the text message from the alert popup.
     * @returns {Promise<string>} The alert message text
     */
    static async getAlertText() {
        Log.info("Retrieving text from alert popup");
        return await browser.getAlertText();
    }


    /**
     * Sends text input to a prompt alert popup.
     * @param {string} text The text to enter into the prompt alert
     */
    static async sendAlertText(text) {
        Log.info(`Sending text to alert prompt: ${text}`);
        await browser.sendAlertText(text);
    }



    /////////////////////////////////////////////
    // BROWSER COOKIE HELPERS
    /////////////////////////////////////////////


    /**
   * Retrieves all cookies associated with the current page
   * @returns {Promise<Object[]>} A list of serialized cookies
   */
    static async getAllCookies() {
        Log.info("Fetching all cookies from the current context");
        return await browser.getAllCookies();
    }


    /**
     * Retrieves a cookie by its name
     * @param {string} name - Name of the cookie to retrieve
     * @returns {Promise<Object>} The serialized cookie object
     */
    static async getNamedCookie(name) {
        Log.info(`Fetching cookie with name: ${name}`);
        return await browser.getNamedCookie(name);
    }


    /**
     * Adds a single cookie with the given name and value.
     *
     * Example:
     * await BrowserUtil.addCookie('token', 'abc123');
     *
     * @param {string} name - Name of the cookie
     * @param {string} value - Value of the cookie
     */
    static async addCookie(name, value) {
        Log.info(`Adding cookie: ${name}=${value}`);
        await browser.setCookies({ name, value });
    }


    /**
     * Adds multiple cookies with the given names and values.
     *
     * Example:
     * await BrowserUtil.setCookies([
     *   ['token', 'abc123'],
     *   ['user_id', 'u456']
     * ]);
     *
     * @param {Array<Array<string>>} cookiePairs - Array of [name, value] pairs
     */
    static async setCookies(cookiePairs) {
        const formattedCookies = cookiePairs.map(([name, value]) => ({ name, value }));
        const cookieNames = formattedCookies.map(c => c.name).join(', ');
        Log.info(`Setting multiple cookies: ${cookieNames}`);
        await browser.setCookies(formattedCookies);
    }


    /**
     * Deletes a specific cookie by its name
     * @param {string} name - Name of the cookie to delete
     */
    static async deleteCookie(name) {
        Log.info(`Deleting cookie with name: ${name}`);
        await browser.deleteCookie(name);
    }


    /**
     * Deletes all cookies from the current page
     */
    static async deleteAllCookies() {
        Log.info("Deleting all cookies from the current context");
        await browser.deleteAllCookies();
    }



    /////////////////////////////////////////////
    // BROWSER KEY ACTION HELPERS
    /////////////////////////////////////////////


    /**
         * Hold down a key until releaseKey() action is called. 
         * Example use case is to hold down the Shift or Ctrl key while clicking an element
         * @param {String} keyValue - unicode code point, ex '\uE008'="Shift"; for supported keys see https://w3c.github.io/webdriver/webdriver-spec.html#keyboard-actions
         */
    static async holdDownKey(keyValue) {
        Log.info(`Hold key down: ${keyValue.codePointAt(0).toString(16)}`)
        await browser.performActions([{
            type: 'key',
            id: 'keyboard',
            actions: [{ type: 'keyDown', value: keyValue }],
        }]);
    }


    /**
     * Release keys from being held down. Use in conjuction with holdDownKey()
     * @param {String} keyValue - unicode code point, ex '\uE008'="Shift"; for supported keys see https://w3c.github.io/webdriver/webdriver-spec.html#keyboard-actions
     */
    static async releaseKey(keyValue) {
        Log.info(`Release key hold: ${keyValue.codePointAt(0).toString(16)}`)
        await browser.performActions([{
            type: 'key',
            id: 'keyboard',
            actions: [{ type: 'keyUp', value: keyValue }],
        }]);
    }

}

module.exports = BrowserUtil;